// backend/scripts/createTables.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

async function createTables() {
    console.log('🔧 Création des tables SQLite...\n');

    try {
        // Table des utilisateurs
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role TEXT CHECK(role IN ('admin', 'client')) DEFAULT 'client',
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table users créée');

        // Table des produits
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(200) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                image VARCHAR(255),
                category VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table products créée');

        // Table des stocks
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS stock (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 0,
                low_stock_threshold INTEGER DEFAULT 5,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE(product_id)
            )
        `);
        console.log('✅ Table stock créée');

        // Table des paniers
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS carts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id)
            )
        `);
        console.log('✅ Table carts créée');

        // Table des articles du panier
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cart_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE(cart_id, product_id)
            )
        `);
        console.log('✅ Table cart_items créée');

        // Table des commandes
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                total DECIMAL(10, 2) NOT NULL,
                status TEXT CHECK(status IN ('En préparation', 'Expédiée', 'Livrée', 'Annulée')) DEFAULT 'En préparation',
                shipping_address TEXT NOT NULL,
                payment_method TEXT CHECK(payment_method IN ('Carte', 'PayPal')) NOT NULL,
                payment_status TEXT CHECK(payment_status IN ('En attente', 'Payé', 'Échoué', 'Remboursé')) DEFAULT 'En attente',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table orders créée');

        // Table des articles de commande
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                product_name VARCHAR(200) NOT NULL,
                quantity INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                total DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table order_items créée');

        // Table des factures
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                order_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                discount DECIMAL(10, 2) DEFAULT 0,
                total DECIMAL(10, 2) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table invoices créée');

        // Table des livraisons
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS shipping (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                address TEXT NOT NULL,
                status TEXT CHECK(status IN ('En préparation', 'Expédiée', 'Livrée', 'Retardée')) DEFAULT 'En préparation',
                tracking_number VARCHAR(100),
                carrier VARCHAR(100),
                estimated_delivery DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(order_id)
            )
        `);
        console.log('✅ Table shipping créée');

        // Table des codes de réduction
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS discounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code VARCHAR(50) UNIQUE NOT NULL,
                type TEXT CHECK(type IN ('percentage', 'fixed')) NOT NULL,
                value DECIMAL(10, 2) NOT NULL,
                min_purchase DECIMAL(10, 2),
                valid_from DATETIME,
                valid_until DATETIME,
                max_uses INTEGER,
                used_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table discounts créée');

        // Créer des index pour les performances
        await db.runAsync('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await db.runAsync('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
        await db.runAsync('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
        await db.runAsync('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
        await db.runAsync('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
        await db.runAsync('CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)');
        await db.runAsync('CREATE INDEX IF NOT EXISTS idx_stock_product_id ON stock(product_id)');
        
        console.log('\n✅ Toutes les tables ont été créées avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error.message);
    }
}

// Exécuter la création des tables
createTables().then(() => {
    console.log('\n🔌 Fermeture de la connexion...');
    db.close((err) => {
        if (err) {
            console.error('❌ Erreur lors de la fermeture:', err.message);
        } else {
            console.log('✅ Connexion fermée');
        }
    });
});