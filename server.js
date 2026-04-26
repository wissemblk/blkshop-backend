// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration - Place this BEFORE any routes!
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://blkshop-frontend.vercel.app',
        'https://blkshop.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route (add this temporarily)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend is running',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        db_host: process.env.MYSQLHOST ? 'configured' : 'missing'
    });
});

// Your products route
app.get('/api/products', async (req, res) => {
    try {
        // Test database connection first
        const db = require('./config/database');
        const [rows] = await db.query('SELECT 1 as test');
        
        // If connection works, fetch products
        const [products] = await db.query('SELECT * FROM products LIMIT 10');
        
        res.json({
            success: true,
            count: products.length,
            products: products
        });
    } catch (error) {
        console.error('Products error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        message: err.message 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});