const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing MySQL connection...');
    console.log('DB_HOST:', process.env.DB_HOST ? process.env.DB_HOST : 'NOT SET');
    console.log('DB_PORT:', process.env.DB_PORT || '3306 (default)');
    console.log('DB_USER:', process.env.DB_USER ? 'set' : 'NOT SET');
    console.log('DB_NAME:', process.env.DB_NAME ? process.env.DB_NAME : 'NOT SET');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'set (length: ' + process.env.DB_PASSWORD.length + ')' : 'NOT SET');
    
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
        console.log('\nERROR: Missing required environment variables!');
        return;
    }

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectTimeout: 30000,
            ssl: { rejectUnauthorized: false }
        });

        console.log('\nConnection successful!');

        // Check tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\nTables in database:');
        if (tables.length === 0) {
            console.log('  (No tables found - database is empty)');
        } else {
            tables.forEach(t => console.log('  -', Object.values(t)[0]));
        }

        // Check if users table exists
        const tableNames = tables.map(t => Object.values(t)[0]);
        if (!tableNames.includes('users')) {
            console.log('\nWARNING: "users" table does not exist!');
            console.log('You need to create the required tables.');
        }

        await connection.end();
    } catch (err) {
        console.log('\nConnection FAILED!');
        console.log('Error code:', err.code);
        console.log('Error message:', err.message);
    }
}

testConnection();
