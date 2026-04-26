// backend/test-products.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testProducts() {
    console.log('🔍 TEST COMPLET DES PRODUITS\n');
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ecommerce'
    };
    
    console.log('📡 Configuration:', {
        ...config,
        password: config.password ? '****' : '(vide)'
    });
    
    let connection;
    
    try {
        // Test 1: Connexion
        console.log('\n1. Test de connexion...');
        connection = await mysql.createConnection(config);
        console.log('✅ Connecté à MySQL');
        
        // Test 2: Vérifier que la base de données existe
        console.log('\n2. Vérification base de données...');
        const [dbCheck] = await connection.execute(
            'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
            [config.database]
        );
        
        if (dbCheck.length === 0) {
            console.log(`❌ Base de données '${config.database}' inexistante`);
            console.log('👉 Créez-la avec: CREATE DATABASE ecommerce;');
            return;
        }
        console.log(`✅ Base de données '${config.database}' trouvée`);
        
        // Test 3: Vérifier la table products
        console.log('\n3. Vérification table products...');
        const [tableCheck] = await connection.execute(
            "SELECT * FROM information_schema.tables WHERE table_schema = ? AND table_name = 'products'",
            [config.database]
        );
        
        if (tableCheck.length === 0) {
            console.log('❌ Table products inexistante');
            console.log('👉 Exécutez le script SQL: npm run db:setup');
            return;
        }
        console.log('✅ Table products trouvée');
        
        // Test 4: Compter les produits
        console.log('\n4. Comptage des produits...');
        const [count] = await connection.execute('SELECT COUNT(*) as total FROM products');
        console.log(`📊 Nombre de produits: ${count[0].total}`);
        
        // Test 5: Afficher les 3 premiers produits
        console.log('\n5. Aperçu des produits:');
        const [products] = await connection.execute('SELECT id, name, price FROM products LIMIT 3');
        
        if (products.length === 0) {
            console.log('⚠️ Aucun produit trouvé');
            console.log('👉 Insérez des produits: node scripts/seedDb.js');
        } else {
            products.forEach(p => {
                console.log(`   - ${p.name}: ${p.price}€ (ID: ${p.id})`);
            });
        }
        
        // Test 6: Vérifier les stocks
        console.log('\n6. Vérification des stocks...');
        const [stock] = await connection.execute(`
            SELECT p.name, s.quantity 
            FROM products p 
            LEFT JOIN stock s ON p.id = s.product_id 
            LIMIT 3
        `);
        
        stock.forEach(s => {
            console.log(`   - ${s.name}: stock ${s.quantity || 0}`);
        });
        
        console.log('\n✅ Test terminé avec succès!');
        
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('👉 MySQL n\'est pas démarré. Lancez XAMPP!');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('👉 Erreur d\'authentification. Vérifiez vos identifiants');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Connexion fermée');
        }
    }
}

testProducts();