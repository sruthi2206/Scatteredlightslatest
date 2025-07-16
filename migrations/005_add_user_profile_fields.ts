import { db, pool } from "../server/db";

async function runMigration() {
  try {
    console.log("Running migration: add user profile fields");
    
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS interests TEXT[]
    `);
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();