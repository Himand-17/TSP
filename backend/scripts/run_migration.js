const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Add your MySQL password here if you have one
            database: 'tsp_db'
        });

        console.log('Connected to database');

        // Read the migration file
        const migrationPath = path.join(__dirname, '../migrations/create_users_table.sql');
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');

        // Execute the migration
        await connection.execute(migrationSQL);
        console.log('Migration completed successfully');

        // Close the connection
        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration(); 