// backend/models/db/StockModel.js
const pool = require('../../config/database');
const Stock = require('../Stock');

class StockModel {
    async findByProductId(productId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM stock WHERE product_id = ?',
                [productId]
            );
            
            if (rows.length === 0) return null;
            return new Stock(rows[0]);
        } catch (error) {
            console.error(`❌ Erreur stock findByProductId ${productId}:`, error);
            return null; // Retourner null au lieu de throw pour éviter de casser la requête produits
        }
    }

    async create(productId) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO stock (product_id, quantity) VALUES (?, 0)',
                [productId]
            );
            return this.findByProductId(productId);
        } catch (error) {
            console.error('❌ Erreur stock create:', error);
            throw error;
        }
    }

    async updateQuantity(productId, quantity, operation = 'set') {
        try {
            let query;
            if (operation === 'add') {
                query = 'UPDATE stock SET quantity = quantity + ? WHERE product_id = ?';
            } else if (operation === 'subtract') {
                query = 'UPDATE stock SET quantity = quantity - ? WHERE product_id = ?';
            } else {
                query = 'UPDATE stock SET quantity = ? WHERE product_id = ?';
            }
            
            await pool.execute(query, [quantity, productId]);
            return this.findByProductId(productId);
        } catch (error) {
            console.error('❌ Erreur updateQuantity:', error);
            throw error;
        }
    }
}

module.exports = new StockModel();