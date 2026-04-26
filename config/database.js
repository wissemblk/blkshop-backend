// backend/config/database.js
const mysql = require('mysql2/promise');

// Create connection pool with Railway SSL requirements
const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // CRITICAL for Railway - Enable SSL
    ssl: {
        rejectUnauthorized: false
    },
    // Add connection timeout
    connectTimeout: 10000,
    // Enable keep alive
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Connection config:', {
            host: process.env.MYSQLHOST,
            port: process.env.MYSQLPORT,
            user: process.env.MYSQLUSER,
            database: process.env.MYSQLDATABASE,
            hasPassword: !!process.env.MYSQLPASSWORD
        });
    }
})();

module.exports = pool;