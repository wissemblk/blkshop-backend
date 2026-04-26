// backend/scripts/seedData.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedDatabase() {
    console.log('🌱 Insertion des données de test...\n');
    
    // Configuration de la connexion MySQL
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ecommerce',
        multipleStatements: true
    };
    
    console.log('📡 Connexion à MySQL...');
    console.log(`   Hôte: ${config.host}`);
    console.log(`   Base de données: ${config.database}`);
    console.log(`   Utilisateur: ${config.user}\n`);
    
    let connection;
    
    try {
        // Établir la connexion
        connection = await mysql.createConnection(config);
        console.log('✅ Connecté à MySQL\n');

        // 1. Vider les tables existantes (dans l'ordre pour éviter les problèmes de clés étrangères)
        console.log('🗑️  Nettoyage des tables existantes...');
        
        const tables = [
            'order_items',
            'orders',
            'cart_items',
            'carts',
            'stock',
            'products',
            'shipping',
            'invoices',
            'discounts',
            'users'
        ];
        
        // Désactiver les contraintes de clés étrangères temporairement
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        
        for (const table of tables) {
            await connection.query(`TRUNCATE TABLE ${table}`);
            console.log(`   ✅ Table ${table} vidée`);
        }
        
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Nettoyage terminé\n');

        // 2. Insérer les utilisateurs
        console.log('👥 Création des utilisateurs...');
        
        // Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const [adminResult] = await connection.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin', 'admin@example.com', adminPassword, 'admin']
        );
        console.log('   ✅ Admin créé: admin@example.com / admin123');
        
        // Utilisateurs normaux
        const userPassword = await bcrypt.hash('user123', 10);
        const [user1Result] = await connection.query(
            'INSERT INTO users (name, email, password, address) VALUES (?, ?, ?, ?)',
            ['Jean Dupont', 'jean@example.com', userPassword, '15 Rue de Paris, 75001 Paris']
        );
        
        const [user2Result] = await connection.query(
            'INSERT INTO users (name, email, password, address) VALUES (?, ?, ?, ?)',
            ['Marie Martin', 'marie@example.com', userPassword, '8 Avenue Victor Hugo, 69002 Lyon']
        );
        
        const [user3Result] = await connection.query(
            'INSERT INTO users (name, email, password, address) VALUES (?, ?, ?, ?)',
            ['Pierre Durand', 'pierre@example.com', userPassword, '23 Boulevard Saint-Germain, 75005 Paris']
        );
        
        console.log('   ✅ 3 utilisateurs créés (mot de passe: user123)');

        // 3. Insérer les produits
        console.log('\n📦 Création des produits...');
        
        const products = [
            ['Ordinateur Portable Pro', 1299.99, 'Ordinateur haute performance avec processeur i7, 16Go RAM, SSD 512Go', 'laptop.jpg', 'Informatique'],
            ['Smartphone X12', 899.99, 'Écran 6.5", 128Go stockage, appareil photo 108MP', 'phone.jpg', 'Téléphonie'],
            ['Casque Audio Sans Fil', 199.99, 'Casque Bluetooth avec réduction de bruit active', 'headphones.jpg', 'Audio'],
            ['Machine à Café Expresso', 349.99, 'Machine automatique avec broyeur intégré', 'coffee.jpg', 'Électroménager'],
            ['Chaussures de Sport', 89.99, 'Chaussures running confortables, légères', 'shoes.jpg', 'Sport'],
            ['Sac à Dos Voyage', 59.99, 'Sac résistant à l\'eau, 40L', 'backpack.jpg', 'Accessoires'],
            ['Montre Connectée', 249.99, 'Montre avec GPS, fréquence cardiaque', 'watch.jpg', 'Électronique'],
            ['Livre "Programmation Node.js"', 39.99, 'Apprenez Node.js pas à pas', 'book.jpg', 'Livres'],
            ['Tablette Graphique', 199.99, 'Pour dessin et design', 'tablet.jpg', 'Informatique'],
            ['Enceinte Bluetooth', 79.99, 'Enceinte portable waterproof', 'speaker.jpg', 'Audio']
        ];

        for (const product of products) {
            const [result] = await connection.query(
                'INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)',
                product
            );
            
            // Ajouter le stock pour chaque produit
            const stockQuantity = Math.floor(Math.random() * 50) + 5; // Entre 5 et 55 unités
            await connection.query(
                'INSERT INTO stock (product_id, quantity, low_stock_threshold) VALUES (?, ?, ?)',
                [result.insertId, stockQuantity, 5]
            );
            
            console.log(`   ✅ ${product[0]} - Stock: ${stockQuantity} unités`);
        }

        // 4. Créer des paniers pour les utilisateurs
        console.log('\n🛒 Création des paniers...');
        
        // Panier pour Jean
        const [cart1Result] = await connection.query(
            'INSERT INTO carts (user_id) VALUES (?)',
            [user1Result.insertId]
        );
        
        await connection.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [cart1Result.insertId, 1, 1, 1299.99]
        );
        
        await connection.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [cart1Result.insertId, 3, 2, 199.99]
        );
        console.log('   ✅ Panier de Jean: 2 articles');
        
        // Panier pour Marie
        const [cart2Result] = await connection.query(
            'INSERT INTO carts (user_id) VALUES (?)',
            [user2Result.insertId]
        );
        
        await connection.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [cart2Result.insertId, 5, 1, 89.99]
        );
        
        await connection.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [cart2Result.insertId, 6, 1, 59.99]
        );
        console.log('   ✅ Panier de Marie: 2 articles');

        // 5. Créer des commandes
        console.log('\n📋 Création des commandes...');
        
        // Commande pour Jean (livrée)
        const [order1Result] = await connection.query(
            `INSERT INTO orders (user_id, total, status, shipping_address, payment_method, payment_status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user1Result.insertId, 1699.97, 'Livré', '15 Rue de Paris, 75001 Paris', 'Carte', 'Payé']
        );

        // Articles de la commande
        await connection.query(
            `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [order1Result.insertId, 1, 'Ordinateur Portable Pro', 1, 1299.99, 1299.99]
        );
        
        await connection.query(
            `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [order1Result.insertId, 3, 'Casque Audio Sans Fil', 2, 199.99, 399.98]
        );

        // Facture
        await connection.query(
            `INSERT INTO invoices (invoice_number, order_id, user_id, subtotal, total) 
             VALUES (?, ?, ?, ?, ?)`,
            [`INV-${Date.now()}-001`, order1Result.insertId, user1Result.insertId, 1699.97, 1699.97]
        );

        // Livraison
        await connection.query(
            `INSERT INTO shipping (order_id, user_id, address, status, tracking_number, carrier) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [order1Result.insertId, user1Result.insertId, '15 Rue de Paris, 75001 Paris', 'Livré', 'TRACK123456', 'DHL']
        );
        console.log('   ✅ Commande de Jean créée');

        // Commande pour Marie (en préparation)
        const [order2Result] = await connection.query(
            `INSERT INTO orders (user_id, total, status, shipping_address, payment_method, payment_status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user2Result.insertId, 249.99, 'En preparation', '8 Avenue Victor Hugo, 69002 Lyon', 'PayPal', 'Payé']
        );

        await connection.query(
            `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [order2Result.insertId, 7, 'Montre Connectée', 1, 249.99, 249.99]
        );

        await connection.query(
            `INSERT INTO invoices (invoice_number, order_id, user_id, subtotal, total) 
             VALUES (?, ?, ?, ?, ?)`,
            [`INV-${Date.now()}-002`, order2Result.insertId, user2Result.insertId, 249.99, 249.99]
        );

        await connection.query(
            `INSERT INTO shipping (order_id, user_id, address, status) 
             VALUES (?, ?, ?, ?)`,
            [order2Result.insertId, user2Result.insertId, '8 Avenue Victor Hugo, 69002 Lyon', 'En preparation']
        );
        console.log('   ✅ Commande de Marie créée');

        // 6. Créer des codes de réduction
        console.log('\n🏷️  Création des codes de réduction...');
        
        const discounts = [
            ['WELCOME10', 'percentage', 10.00, 50.00, null, null, 100, 0, true],
            ['FLAT20', 'fixed', 20.00, 100.00, null, null, 50, 0, true],
            ['SUMMER25', 'percentage', 25.00, 200.00, null, null, 30, 0, true],
            ['FREESHIP', 'fixed', 10.00, 50.00, null, null, 200, 0, true]
        ];

        for (const discount of discounts) {
            await connection.query(
                `INSERT INTO discounts (code, type, value, min_purchase, valid_from, valid_until, max_uses, used_count, is_active) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                discount
            );
        }
        console.log('   ✅ 4 codes de réduction créés');

        // Vérification finale
        console.log('\n📊 Résumé final:');
        
        const [userCount] = await connection.query('SELECT COUNT(*) as total FROM users');
        console.log(`   👥 Utilisateurs: ${userCount[0].total}`);
        
        const [productCount] = await connection.query('SELECT COUNT(*) as total FROM products');
        console.log(`   📦 Produits: ${productCount[0].total}`);
        
        const [orderCount] = await connection.query('SELECT COUNT(*) as total FROM orders');
        console.log(`   📋 Commandes: ${orderCount[0].total}`);
        
        const [stockCount] = await connection.query('SELECT SUM(quantity) as total FROM stock');
        console.log(`   📊 Stock total: ${stockCount[0].total} unités`);

        console.log('\n🎉 Données de test insérées avec succès!');
        console.log('\n🔑 Identifiants de test:');
        console.log('   Admin:  admin@example.com / admin123');
        console.log('   Jean:   jean@example.com / user123');
        console.log('   Marie:  marie@example.com / user123');
        console.log('   Pierre: pierre@example.com / user123');

    } catch (error) {
        console.error('\n❌ Erreur lors de l\'insertion:', error.message);
        if (error.sqlMessage) {
            console.error('   Détail SQL:', error.sqlMessage);
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Connexion fermée');
        }
    }
}

// Exécuter le script
seedDatabase();