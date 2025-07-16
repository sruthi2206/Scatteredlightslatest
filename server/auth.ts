import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { User as SelectUser, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { triggerWebhook } from "./webhooks";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'scattered-lights-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.NODE_ENV === 'production' 
            ? "https://soul-synergy-sruthi2206.replit.app/api/auth/google/callback"
            : "/api/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            const existingUser = await storage.getUserByGoogleId(profile.id);
            
            if (existingUser) {
              return done(null, existingUser);
            }

            // Check if user exists with same email (only if email is available)
            const userEmail = profile.emails?.[0]?.value;
            if (userEmail) {
              const emailUser = await storage.getUserByEmail(userEmail);
              
              if (emailUser) {
                // Link Google account to existing user
                await storage.updateUser(emailUser.id, { 
                  googleId: profile.id 
                });
                return done(null, emailUser);
              }
            }

            // Create new user
            const referralCode = nanoid(6);
            const newUser = await storage.createUser({
              name: profile.displayName || profile.name?.givenName || 'Google User',
              username: `google_${profile.id}`,
              email: profile.emails?.[0]?.value || '',
              googleId: profile.id,
              referralCode,
              lights: 0,
              password: '' // No password for OAuth users
            });

            return done(null, newUser);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, email, name, referredBy } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Generate unique referral code for the new user
      const referralCode = nanoid(6);
      
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        name,
        referralCode,
        referredBy,
        lights: 0
      });

      // If the user was referred, update the referrer's lights
      if (referredBy) {
        const referrer = await storage.getUserByReferralCode(referredBy);
        if (referrer) {
          // Add 50 lights to the referrer
          const updatedLights = (referrer.lights || 0) + 50;
          await storage.updateUserLights(referrer.id, updatedLights);
          
          // Calculate if this unlocks additional premium time
          if (Math.floor(updatedLights / 250) > Math.floor((referrer.lights || 0) / 250)) {
            // User has crossed a 250 lights threshold, extend their premium by 7 days
            const currentExpiryDate = referrer.premiumExpiryDate || new Date();
            const newExpiryDate = new Date(currentExpiryDate);
            newExpiryDate.setDate(newExpiryDate.getDate() + 7);
            await storage.updatePremiumExpiry(referrer.id, newExpiryDate);
          }
        }
      }

      req.login(user, async (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration", error: err.message });
        }
        
        // Trigger webhook for new user registration
        try {
          await triggerWebhook('user.registered', {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
          });
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
          // Don't fail registration if webhook fails
        }
        
        return res.status(201).json(user);
      });
    } catch (error) {
      res.status(500).json({ message: "Registration failed", error: (error as Error).message });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser, info: { message: string }) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed", error: err.message });
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed", error: err.message });
      }
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Google OAuth routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth?error=google_auth_failed" }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect("/dashboard");
    }
  );

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json(req.user);
  });
  
  // Password reset endpoint
  app.post("/api/reset-password", async (req, res) => {
    console.log("Password reset request received", req.body);
    try {
      const { email, tempPassword } = req.body;
      
      if (!email) {
        console.log("Email missing in reset request");
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user by email
      console.log("Finding user by email:", email);
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        console.log("User not found with email:", email);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("User found:", user.id, user.username);
      
      // Generate a simple temporary password that doesn't include special characters
      // to avoid compatibility issues
      let finalTempPassword = tempPassword;
      if (!finalTempPassword) {
        console.log("No temp password provided, generating one");
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        finalTempPassword = '';
        for (let i = 0; i < 8; i++) {
          finalTempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      
      console.log("Using temporary password:", finalTempPassword);
      
      try {
        // Hash the temporary password
        const hashedPassword = await hashPassword(finalTempPassword);
        console.log("Hashed password generated");
        
        // Update the user's password in the database
        console.log("Updating user password in database for user ID:", user.id);
        
        // Update password directly in the database
        await db.update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, user.id));
          
        console.log("Password reset successful");
        
        return res.status(200).json({ 
          success: true, 
          message: "Password reset successful",
          tempPassword: finalTempPassword
        });
      } catch (updateError) {
        console.error("Error updating password:", updateError);
        return res.status(500).json({ message: "Failed to update password in database" });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({ message: "Error processing password reset" });
    }
  });
  
  // Password change endpoint for authenticated users
  app.post("/api/users/:id/change-password", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Ensure user is changing their own password
      const userId = parseInt(req.params.id);
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      // Validate request
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, req.user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user password in database
      const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Password changed successfully" 
      });
    } catch (error) {
      console.error("Password change error:", error);
      return res.status(500).json({ message: "Error changing password" });
    }
  });
}