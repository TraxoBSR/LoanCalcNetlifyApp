import { initializeDatabase } from '../database/init.js';

async function runMigration() {
  try {
    console.log('Starting database migration...');
    await initializeDatabase();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();