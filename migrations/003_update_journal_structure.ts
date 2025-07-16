import { sql } from "drizzle-orm";
import { db } from "../server/db";

async function runMigration() {
  console.log("Running migration: Update journal entries schema");
  
  try {
    // Add gratitude column as text array
    await db.execute(sql`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS gratitude TEXT[] DEFAULT '{}'
    `);
    
    // Add affirmation column
    await db.execute(sql`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS affirmation TEXT
    `);
    
    // Add short_term_goals column as text array
    await db.execute(sql`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS short_term_goals TEXT[] DEFAULT '{}'
    `);
    
    // Add long_term_vision column
    await db.execute(sql`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS long_term_vision TEXT
    `);
    
    // Add language column with default 'english'
    await db.execute(sql`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english'
    `);
    
    // Add ai_insights column
    await db.execute(sql`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS ai_insights TEXT
    `);
    
    console.log("Journal entries schema updated successfully");
  } catch (error) {
    console.error("Error updating journal entries schema:", error);
    throw error;
  }
}

runMigration()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
