// backend/scripts/runSchema.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSchema() {
    console.log('🔧 Exécution du schéma SQL...\n');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });
    
    try {
        // Lire le fichier schema.sql
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        let schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Supprimer les commentaires et les lignes vides
        schema = schema.replace(/--.*$/gm, ''); // Supprimer les commentaires
        schema = schema.replace(/\n\s*\n/g, '\n'); // Supprimer les lignes vides
        
        // Exécuter le schéma
        console.log('📦 Création de la base de données et des tables...');
        await connection.query(schema);
        console.log('✅ Schéma exécuté avec succès!\n');
        
        // Vérifier les tables créées
        const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'ecommerce'
        `);
        
        console.log('📊 Tables créées:');
        tables.forEach(table => {
            console.log(`   - ${table.TABLE_NAME}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.sqlMessage) {
            console.error('   Détail:', error.sqlMessage);
        }
    } finally {
        await connection.end();
    }
}

runSchema();