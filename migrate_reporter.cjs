const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Migrating issues table...');
        
        // Add reporter_name
        try {
            await connection.query('ALTER TABLE issues ADD COLUMN reporter_name VARCHAR(255)');
            console.log('Added reporter_name column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('reporter_name column already exists');
            } else {
                throw err;
            }
        }

        // Add reporter_phone
        try {
            await connection.query('ALTER TABLE issues ADD COLUMN reporter_phone VARCHAR(20)');
            console.log('Added reporter_phone column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('reporter_phone column already exists');
            } else {
                throw err;
            }
        }

        await connection.end();
        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
