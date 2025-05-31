import pg from 'pg';
const { Pool } = pg;

// PostgreSQL接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// データベース初期化
export const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_name TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('PostgreSQL database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// メッセージ保存
export const saveMessage = async (message) => {
  try {
    const result = await pool.query(
      'INSERT INTO messages (user_name, text, timestamp) VALUES ($1, $2, $3) RETURNING *',
      [message.user, message.text, message.timestamp || new Date()]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// メッセージ取得（最新50件）
export const getMessages = async () => {
  try {
    const result = await pool.query(
      'SELECT id, user_name as user, text, timestamp FROM messages ORDER BY timestamp DESC LIMIT 50'
    );
    return result.rows.reverse();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// データベースクローズ
export const closeDatabase = async () => {
  await pool.end();
  console.log('Database connection closed');
};

// プロセス終了時のクリーンアップ
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});