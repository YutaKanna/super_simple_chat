import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbName = process.env.DB_NAME || (process.env.NODE_ENV === 'production' ? 'chat-prod.db' : 'chat.db');
const dbPath = join(__dirname, '../db', dbName);

// データベース接続
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// データベース初期化
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database initialized');
        resolve();
      }
    });
  });
};

// メッセージ保存
export const saveMessage = (message) => {
  return new Promise((resolve, reject) => {
    const { user, text, timestamp } = message;
    db.run(
      'INSERT INTO messages (user, text, timestamp) VALUES (?, ?, ?)',
      [user, text, timestamp],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...message });
        }
      }
    );
  });
};

// メッセージ取得（最新50件）
export const getMessages = () => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50',
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // 古い順に並び替えて返す
          resolve(rows.reverse());
        }
      }
    );
  });
};

// データベースクローズ
export const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
};

// プロセス終了時のクリーンアップ
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});