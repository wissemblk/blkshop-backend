// backend/models/db/ProductModel.js
const pool = require('../../config/database');
const Product = require('../Product');

class ProductModel {
    async findAll() {
        try {
            console.log('🔍 Exécution SQL: SELECT * FROM products');
            const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
            console.log(`✅ ${rows.length} lignes récupérées`);
            
            // Vérifier que rows est un tableau et a du contenu
            if (!Array.isArray(rows)) {
                console.error('❌ rows n\'est pas un tableau:', rows);
                return [];
            }
            
            // Afficher la première ligne pour déboguer
            if (rows.length > 0) {
                console.log('📦 Exemple de données brutes:', rows[0]);
            }
            
            // Créer les objets Product avec les données
            const products = rows.map(row => {
                try {
                    return new Product(row);
                } catch (err) {
                    console.error('❌ Erreur création produit pour ligne:', row, err);
                    return null;
                }
            }).filter(p => p !== null); // Enlever les produits null
            
            console.log(`✅ ${products.length} produits créés avec succès`);
            return products;
            
        } catch (error) {
            console.error('❌ Erreur SQL findAll:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            return new Product(rows[0]);
        } catch (error) {
            console.error(`❌ Erreur SQL findById ${id}:`, error);
            throw error;
        }
    }

    async create(productData) {
        const { name, price, description, image, category } = productData;
        try {
            const [result] = await pool.execute(
                'INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)',
                [name, price, description, image, category]
            );
            return this.findById(result.insertId);
        } catch (error) {
            console.error('❌ Erreur SQL create:', error);
            throw error;
        }
    }

    async update(id, productData) {
        const { name, price, description } = productData;
        try {
            await pool.execute(
                'UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?',
                [name, price, description, id]
            );
            return this.findById(id);
        } catch (error) {
            console.error(`❌ Erreur SQL update ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`❌ Erreur SQL delete ${id}:`, error);
            throw error;
        }
    }
}

module.exports = new ProductModel();