const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'deepak@12',
            database: 'smart_route_planner'
        });

        console.log('Successfully connected to the database!');

        // Test if tables exist
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\nExisting tables:');
        tables.forEach(table => {
            console.log(Object.values(table)[0]);
        });

        await connection.end();
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
    }
}

testConnection(); 