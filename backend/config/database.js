const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection without database specified
const initialConnection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Create the pool for the specific database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_route_planner',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await initialConnection.getConnection();
        console.log('Successfully connected to MySQL server');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error connecting to MySQL server:', error.message);
        return false;
    }
}

// Database initialization function
async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');

        // Test connection first
        console.log('Testing database connection...');
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('Could not connect to MySQL server');
        }
        console.log('Database connection test successful.');

        // Drop database if it exists
        console.log('Dropping existing database...');
        await initialConnection.execute(
            `DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'smart_route_planner'}`
        );
        console.log('Existing database dropped.');

        // Create database
        console.log(`Creating new database: ${process.env.DB_NAME || 'smart_route_planner'}`);
        await initialConnection.execute(
            `CREATE DATABASE ${process.env.DB_NAME || 'smart_route_planner'}`
        );
        console.log('Database created successfully');

        // Create users table
        console.log('Creating users table...');
        await pool.execute(`
            CREATE TABLE users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created successfully');

        // Create routes table
        console.log('Creating routes table...');
        await pool.execute(`
            CREATE TABLE routes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                route_name VARCHAR(255) NOT NULL,
                cities JSON NOT NULL,
                total_distance FLOAT NOT NULL,
                weather_conditions JSON NOT NULL,
                algorithm_used VARCHAR(50) NOT NULL,
                execution_time FLOAT NOT NULL,
                transport_mode VARCHAR(50) NOT NULL,
                total_cost FLOAT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('Routes table created successfully');

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    } finally {
        await initialConnection.end();
    }
}

// If this file is run directly (npm run setup-db), initialize the database
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database setup completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('Database setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = {
    pool,
    initializeDatabase,
    testConnection
}; 