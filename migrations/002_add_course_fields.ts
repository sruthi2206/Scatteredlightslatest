import { pool } from "../server/db";

async function runMigration() {
  try {
    // Add new columns to the healing_rituals table
    await pool.query(`
      ALTER TABLE healing_rituals 
      ADD COLUMN IF NOT EXISTS main_image_url TEXT,
      ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
      ADD COLUMN IF NOT EXISTS course_url TEXT,
      ADD COLUMN IF NOT EXISTS duration TEXT;
    `);
    
    console.log("Migration 002: Added course fields to healing_rituals table successfully");
  } catch (error) {
    console.error("Migration 002 failed:", error);
  }
}

// Run the migration
runMigration();