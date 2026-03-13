const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Test connection (non-blocking, log-only)
pool.query('SELECT 1')
    .then(() => console.log('[v0] Database connected successfully!'))
    .catch(err => {
        console.error('[v0] Database connection FAILED:', err.message);
        // Don't exit - let requests fail gracefully with error messages
    });

module.exports = pool;
