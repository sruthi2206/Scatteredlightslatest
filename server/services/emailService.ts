import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  tlsRejectUnauthorized: boolean;
  fromName: string;
  fromEmail: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.EMAIL_HOST || 'email.storyweb.in',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      username: process.env.EMAIL_USERNAME || 'admin@storyweb.in',
      password: process.env.EMAIL_PASSWORD || '',
      tlsRejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
      fromName: process.env.EMAIL_FROM_NAME || 'Scattered Lights',
      fromEmail: process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_USERNAME || 'admin@storyweb.in'
    };

    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Try different SMTP configurations
      const configs = [
        {
          // Standard configuration
          host: this.config.host,
          port: this.config.port,
          secure: this.config.secure,
          auth: {
            user: this.config.username,
            pass: this.config.password,
          },
          tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3',
          },
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
        },
        {
          // Alternative with no TLS first
          host: this.config.host,
          port: this.config.port,
          secure: false,
          auth: {
            user: this.config.username,
            pass: this.config.password,
          },
          requireTLS: false,
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
        },
        {
          // Try with STARTTLS
          host: this.config.host,
          port: 25, // Try standard SMTP port
          secure: false,
          auth: {
            user: this.config.username,
            pass: this.config.password,
          },
          requireTLS: true,
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
        }
      ];

      // Use the first configuration for now
      this.transporter = nodemailer.createTransport(configs[0]);

      console.log(`Email service initialized with SMTP server: ${this.config.host}:${this.config.port}`);
      console.log(`Using credentials: ${this.config.username} (password: ${this.config.password ? 'SET' : 'NOT SET'})`);
      console.log(`TLS reject unauthorized: ${this.config.tlsRejectUnauthorized}`);
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string, username: string): Promise<boolean> {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Scattered Lights</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .token { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: monospace; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌟 Scattered Lights</h1>
          <p>Reset Your Password</p>
        </div>
        <div class="content">
          <h2>Hello ${username},</h2>
          <p>We received a request to reset your password for your Scattered Lights account. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <div class="token">${resetUrl}</div>
          
          <p><strong>This link will expire in 1 hour</strong> for your security.</p>
          
          <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
          
          <p>Best regards,<br>The Scattered Lights Team</p>
        </div>
        <div class="footer">
          <p>This email was sent from Scattered Lights - AI-Powered Inner Healing Platform</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hello ${username},
      
      We received a request to reset your password for your Scattered Lights account.
      
      To reset your password, visit this link: ${resetUrl}
      
      This link will expire in 1 hour for your security.
      
      If you didn't request this password reset, you can safely ignore this email.
      
      Best regards,
      The Scattered Lights Team
    `;

    return this.sendEmail(to, 'Reset Your Password - Scattered Lights', html, text);
  }

  async sendWelcomeEmail(to: string, username: string): Promise<boolean> {
    const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/auth`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Scattered Lights</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌟 Welcome to Scattered Lights</h1>
          <p>Your journey to inner healing begins now</p>
        </div>
        <div class="content">
          <h2>Hello ${username},</h2>
          <p>Welcome to Scattered Lights! We're excited to have you join our community of individuals on a journey toward emotional balance and spiritual growth.</p>
          
          <h3>What you can do with Scattered Lights:</h3>
          
          <div class="feature">
            <strong>🧘 Chakra Assessment</strong><br>
            Discover your energy centers and understand your spiritual alignment
          </div>
          
          <div class="feature">
            <strong>📝 AI-Powered Journaling</strong><br>
            Reflect on your thoughts and emotions with intelligent insights
          </div>
          
          <div class="feature">
            <strong>🤖 Personal AI Coaches</strong><br>
            Get guidance from specialized AI coaches for different aspects of healing
          </div>
          
          <div class="feature">
            <strong>📊 Progress Tracking</strong><br>
            Monitor your emotional journey and celebrate your growth
          </div>
          
          <p>Ready to start your healing journey?</p>
          <a href="${loginUrl}" class="button">Begin Your Journey</a>
          
          <p>We recommend starting with the Chakra Assessment to understand your current energy state and receive personalized recommendations.</p>
          
          <p>Best regards,<br>The Scattered Lights Team</p>
        </div>
        <div class="footer">
          <p>This email was sent from Scattered Lights - AI-Powered Inner Healing Platform</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Scattered Lights, ${username}!
      
      Your journey to inner healing begins now. 
      
      With Scattered Lights, you can:
      - Take chakra assessments to understand your energy centers
      - Use AI-powered journaling for emotional reflection
      - Chat with personal AI coaches for guidance
      - Track your progress on your healing journey
      
      Start your journey: ${loginUrl}
      
      We recommend beginning with the Chakra Assessment to understand your current energy state.
      
      Best regards,
      The Scattered Lights Team
    `;

    return this.sendEmail(to, 'Welcome to Scattered Lights - Begin Your Healing Journey', html, text);
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();