const { Pool } = require('@neondatabase/serverless');
const process = require('process');

async function runMigration() {
  console.log("Running migration: Update journal entries schema");
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Add gratitude column as text array
    await pool.query(`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS gratitude TEXT[] DEFAULT '{}'
    `);
    
    // Add affirmation column
    await pool.query(`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS affirmation TEXT
    `);
    
    // Add short_term_goals column as text array
    await pool.query(`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS short_term_goals TEXT[] DEFAULT '{}'
    `);
    
    // Add long_term_vision column
    await pool.query(`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS long_term_vision TEXT
    `);
    
    // Add language column with default 'english'
    await pool.query(`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english'
    `);
    
    // Add ai_insights column
    await pool.query(`
      ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS ai_insights TEXT
    `);
    
    console.log("Journal entries schema updated successfully");
  } catch (error) {
    console.error("Error updating journal entries schema:", error);
    throw error;
  } finally {
    await pool.end();
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
