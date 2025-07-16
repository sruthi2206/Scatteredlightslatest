// Migration file for adding referral system fields to the user table
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    // Check if columns already exist before adding them
    await db.execute(sql`
      DO $$
      BEGIN
        -- Add the lights column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'lights') THEN
          ALTER TABLE users ADD COLUMN lights INTEGER DEFAULT 0;
        END IF;

        -- Add the referral_code column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'referral_code') THEN
          ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;
        END IF;

        -- Add the referred_by column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'referred_by') THEN
          ALTER TABLE users ADD COLUMN referred_by TEXT;
        END IF;

        -- Add the premium_expiry_date column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'premium_expiry_date') THEN
          ALTER TABLE users ADD COLUMN premium_expiry_date TIMESTAMP;
        END IF;
      END $$;
    `);

    console.log("Migration 004_add_referral_system.ts completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});