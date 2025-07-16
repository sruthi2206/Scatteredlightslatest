import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Starting migration: Adding new fields to healing_rituals and creating new tables');
  
  try {
    // Add new columns to healing_rituals table
    await db.execute(sql`
      ALTER TABLE healing_rituals 
      ADD COLUMN IF NOT EXISTS featured_image TEXT,
      ADD COLUMN IF NOT EXISTS video_url TEXT,
      ADD COLUMN IF NOT EXISTS zoom_link TEXT,
      ADD COLUMN IF NOT EXISTS event_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);
    
    // Create community_events table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        featured_image TEXT,
        event_date TIMESTAMP NOT NULL,
        event_time TEXT NOT NULL,
        duration INTEGER,
        is_virtual BOOLEAN DEFAULT true,
        is_free BOOLEAN DEFAULT false,
        zoom_link TEXT,
        video_url TEXT,
        max_attendees INTEGER,
        status TEXT DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create event_attendees table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        registration_date TIMESTAMP DEFAULT NOW(),
        attended BOOLEAN DEFAULT false
      )
    `);
    
    // Create media_library table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS media_library (
        id SERIAL PRIMARY KEY,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER,
        alt_text TEXT,
        uploaded_by_id INTEGER NOT NULL,
        upload_date TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();