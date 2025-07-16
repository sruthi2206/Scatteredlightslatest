import { db } from "../server/db";

async function runMigration() {
  try {
    console.log('Adding performance indexes...');

    // Add indexes for frequently queried fields
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_chakra_profiles_user_id ON chakra_profiles(user_id);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_coach_conversations_user_id ON coach_conversations(user_id);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_emotion_tracking_user_id ON emotion_tracking(user_id);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);
    `);

    console.log('Performance indexes added successfully');
  } catch (error) {
    console.error('Error adding performance indexes:', error);
    throw error;
  }
}

export { runMigration };

if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}