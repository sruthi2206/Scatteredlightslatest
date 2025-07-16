import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Starting migration: Adding phone field to users table");
    
    // Add phone field to users table
    await db.execute(
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;`
    );
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();