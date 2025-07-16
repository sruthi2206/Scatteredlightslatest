import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function runMigration() {
  console.log("Running migration: Add Google OAuth support");
  
  try {
    // Add google_id column to users table
    await db.execute(sql`ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE`);
    
    console.log("✓ Added google_id column to users table");
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export { runMigration };