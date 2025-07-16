import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

async function runMigration() {
  // Configure Neon to use ws
  neonConfig.webSocketConstructor = ws;
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Connect to the database
    const db = drizzle(pool);
    
    // Execute raw SQL to add the new columns to the healing_rituals table
    await db.execute(`
      ALTER TABLE healing_rituals
      ADD COLUMN IF NOT EXISTS lesson1_title TEXT,
      ADD COLUMN IF NOT EXISTS lesson1_description TEXT,
      ADD COLUMN IF NOT EXISTS lesson1_video_url TEXT,
      ADD COLUMN IF NOT EXISTS lesson1_duration TEXT,
      ADD COLUMN IF NOT EXISTS lesson2_title TEXT,
      ADD COLUMN IF NOT EXISTS lesson2_description TEXT,
      ADD COLUMN IF NOT EXISTS lesson2_video_url TEXT,
      ADD COLUMN IF NOT EXISTS lesson2_duration TEXT,
      ADD COLUMN IF NOT EXISTS lesson3_title TEXT,
      ADD COLUMN IF NOT EXISTS lesson3_description TEXT,
      ADD COLUMN IF NOT EXISTS lesson3_video_url TEXT,
      ADD COLUMN IF NOT EXISTS lesson3_duration TEXT;
    `);
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the connection
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error);