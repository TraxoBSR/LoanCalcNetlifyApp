import pkg from 'pg';
const { Pool } = pkg;
import sqlite3 from 'sqlite3';
import path from 'path';

let dbClient = null;

// Database initialization with fallback options
async function initializeDatabase() {
  const skipDatabase = process.env.SKIP_DATABASE === 'true';
  
  if (skipDatabase) {
    console.log('Skipping database initialization (SKIP_DATABASE=true)');
    return null;
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('No DATABASE_URL provided, skipping database initialization');
    return null;
  }

  try {
    // Check if using SQLite
    if (databaseUrl.startsWith('sqlite:')) {
      const dbPath = databaseUrl.replace('sqlite:', '');
      const db = new sqlite3.verbose().Database(dbPath);
      
      // Create tables for SQLite
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);
          
          db.run(`CREATE TABLE IF NOT EXISTS calculations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            business_data TEXT,
            results TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS user_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            report_type TEXT NOT NULL,
            report_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )`, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
      
      dbClient = db;
      console.log('SQLite database initialized successfully');
      return db;
    } else {
      // PostgreSQL connection
      const pool = new Pool({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
      });

      // Test connection
      const client = await pool.connect();
      
      // Create tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS calculations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          business_data JSONB,
          results JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS user_usage (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          action VARCHAR(255) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          report_type VARCHAR(255) NOT NULL,
          report_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      client.release();
      dbClient = pool;
      console.log('PostgreSQL database initialized successfully');
      return pool;
    }
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    console.log('Continuing without database connection...');
    return null;
  }
}

// Query function that wraps the database client's query method
async function query(text, params) {
  if (!dbClient) {
    throw new Error('Database not initialized');
  }

  // Handle SQLite
  if (dbClient.constructor.name === 'Database') {
    return new Promise((resolve, reject) => {
      if (text.trim().toUpperCase().startsWith('SELECT')) {
        dbClient.all(text, params || [], (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        dbClient.run(text, params || [], function(err) {
          if (err) reject(err);
          else resolve({ rows: [], rowCount: this.changes, insertId: this.lastID });
        });
      }
    });
  }
  
  // Handle PostgreSQL
  return dbClient.query(text, params);
}

export { initializeDatabase, query };