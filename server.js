require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);


// Route de test simple
app.get('/', (req, res) => {
    res.json({ message: 'API E-commerce fonctionne!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Une erreur est survenue!' });
});

// Only use app.listen() when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    
    const startServer = async () => {
        try {
            const connection = await pool.getConnection();
            console.log('✅ Database connected successfully');
            connection.release();
            
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT} (without database)`);
            });
        }
    };
    
    startServer();
}

// Export for Vercel (important!)
module.exports = app;