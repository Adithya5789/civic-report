const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 30000,
    // Enable SSL by default for cloud databases (most require it)
    ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
});

// Test connection (non-blocking, log-only)
pool.query('SELECT 1')
    .then(() => console.log('[v0] Database connected successfully!'))
    .catch(err => {
        console.error('[v0] Database connection FAILED:', err.message);
        // Don't exit - let requests fail gracefully with error messages
    });

module.exports = pool;
