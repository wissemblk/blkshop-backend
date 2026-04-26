// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Determine if we're on Vercel
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT) || 3306,
  waitForConnections: true,
  connectionLimit: isVercel ? 1 : 10, // Vercel serverless functions need fewer connections
  queueLimit: 0,
  // Add SSL for external connections (Vercel to Railway)
  ...(isVercel && {
    ssl: {
      rejectUnauthorized: false // Required for Railway external connections
    }
  }),
  // Enable keep-alive for serverless
  enableKeepAlive: true
});

// Test connection function
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    console.log('Connected to:', process.env.MYSQLDATABASE);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    console.error('Connection details:', {
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT,
      isVercel
    });
    return false;
  }
};

// For serverless environments, don't keep connections open
if (isVercel) {
  // Handle connection cleanup
  process.on('SIGTERM', async () => {
    await pool.end();
  });
}

module.exports = pool;
module.exports.testConnection = testConnection;