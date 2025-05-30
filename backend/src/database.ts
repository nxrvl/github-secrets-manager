import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'secrets.db');

const db = new sqlite3.Database(dbPath);

interface DbRunResult {
  lastID?: number;
  changes?: number;
}

export const run = (sql: string, params: any[] = []): Promise<DbRunResult> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const get = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
};

export const all = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};

export const initDatabase = async () => {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS secrets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_owner TEXT NOT NULL,
        repository_name TEXT NOT NULL,
        secret_name TEXT NOT NULL,
        secret_value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(repository_owner, repository_name, secret_name)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS secret_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_owner TEXT NOT NULL,
        repository_name TEXT NOT NULL,
        secret_name TEXT NOT NULL,
        action TEXT NOT NULL,
        performed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export default db;