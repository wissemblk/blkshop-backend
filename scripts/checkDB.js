// backend/scripts/checkDb.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    console.log('🔍 Vérification de la base de données...\n');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ecommerce'
        });
        
        // Vérifier les tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`✅ ${tables.length} tables trouvées\n`);
        
        // Afficher le nombre d'enregistrements dans chaque table
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`   📁 ${tableName}: ${rows[0].count} enregistrements`);
        }
        
        // Vérifier la structure de la table discounts
        const [discountsColumns] = await connection.query('DESCRIBE discounts');
        console.log('\n📋 Structure de la table discounts:');
        discountsColumns.forEach(col => {
            console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

checkDatabase();