// backend/models/db/CartModel.js
const pool = require('../../config/database');
const Cart = require('../Cart');

class CartModel {
    async getOrCreateCart(userId) {
        try {
            // Vérifier que userId est valide
            if (!userId) {
                throw new Error('userId est requis');
            }

            // Chercher un panier existant
            const [rows] = await pool.execute(
                'SELECT * FROM carts WHERE user_id = ?',
                [userId]
            );
            
            let cartId;
            if (rows.length === 0) {
                // Créer un nouveau panier
                const [result] = await pool.execute(
                    'INSERT INTO carts (user_id) VALUES (?)',
                    [userId]
                );
                cartId = result.insertId;
            } else {
                cartId = rows[0].id;
            }
            
            return this.getCartWithItems(cartId);
        } catch (error) {
            console.error('❌ Erreur getOrCreateCart:', error);
            throw error;
        }
    }

    async getCartWithItems(cartId) {
        try {
            // Récupérer les infos du panier
            const [cartRows] = await pool.execute(
                'SELECT * FROM carts WHERE id = ?',
                [cartId]
            );
            
            if (cartRows.length === 0) return null;
            
            // Récupérer les articles avec les détails des produits
            const [items] = await pool.execute(
                `SELECT ci.*, p.name, p.price as current_price, p.image 
                 FROM cart_items ci 
                 JOIN products p ON ci.product_id = p.id 
                 WHERE ci.cart_id = ?`,
                [cartId]
            );
            
            const cartData = {
                ...cartRows[0],
                items: items.map(item => ({
                    id: item.id,
                    productId: item.product_id,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    total: parseFloat(item.price) * item.quantity,
                    image: item.image
                }))
            };
            
            return new Cart(cartData);
        } catch (error) {
            console.error('❌ Erreur getCartWithItems:', error);
            throw error;
        }
    }

    async addItem(userId, productId, quantity = 1) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            console.log('🛒 Ajout au panier:', { userId, productId, quantity });

            // Vérifier les paramètres
            if (!userId) throw new Error('userId est requis');
            if (!productId) throw new Error('productId est requis');
            if (quantity < 1) throw new Error('La quantité doit être supérieure à 0');

            // Récupérer ou créer le panier
            let [cartRows] = await connection.execute(
                'SELECT id FROM carts WHERE user_id = ?',
                [userId]
            );
            
            let cartId;
            if (cartRows.length === 0) {
                const [result] = await connection.execute(
                    'INSERT INTO carts (user_id) VALUES (?)',
                    [userId]
                );
                cartId = result.insertId;
                console.log('✅ Nouveau panier créé:', cartId);
            } else {
                cartId = cartRows[0].id;
                console.log('✅ Panier existant:', cartId);
            }

            // Récupérer le prix du produit
            const [productRows] = await connection.execute(
                'SELECT price, name FROM products WHERE id = ?',
                [productId]
            );
            
            if (productRows.length === 0) {
                throw new Error(`Produit ${productId} non trouvé`);
            }
            
            const price = productRows[0].price;
            console.log('💰 Prix du produit:', price);

            // Vérifier si l'article est déjà dans le panier
            const [existingItems] = await connection.execute(
                'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
                [cartId, productId]
            );
            
            if (existingItems.length > 0) {
                // Mettre à jour la quantité
                console.log('📦 Article existant, mise à jour quantité');
                await connection.execute(
                    'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?',
                    [quantity, cartId, productId]
                );
            } else {
                // Insérer un nouvel article
                console.log('➕ Nouvel article, insertion');
                await connection.execute(
                    'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [cartId, productId, quantity, price]
                );
            }
            
            await connection.commit();
            console.log('✅ Transaction réussie');
            
            return this.getCartWithItems(cartId);
            
        } catch (error) {
            await connection.rollback();
            console.error('❌ Erreur addItem:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateItem(userId, productId, quantity) {
        try {
            if (!userId) throw new Error('userId est requis');
            if (!productId) throw new Error('productId est requis');
            if (quantity === undefined) throw new Error('quantity est requis');

            const cart = await this.getOrCreateCart(userId);
            
            if (!cart) {
                throw new Error('Panier non trouvé');
            }

            if (quantity <= 0) {
                await pool.execute(
                    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
                    [cart.id, productId]
                );
            } else {
                await pool.execute(
                    'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
                    [quantity, cart.id, productId]
                );
            }
            
            return this.getCartWithItems(cart.id);
            
        } catch (error) {
            console.error('❌ Erreur updateItem:', error);
            throw error;
        }
    }

    async removeItem(userId, productId) {
        try {
            if (!userId) throw new Error('userId est requis');
            if (!productId) throw new Error('productId est requis');

            const cart = await this.getOrCreateCart(userId);
            
            if (!cart) {
                throw new Error('Panier non trouvé');
            }

            await pool.execute(
                'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
                [cart.id, productId]
            );
            
            return this.getCartWithItems(cart.id);
            
        } catch (error) {
            console.error('❌ Erreur removeItem:', error);
            throw error;
        }
    }

    async clearCart(userId) {
        try {
            if (!userId) throw new Error('userId est requis');

            const cart = await this.getOrCreateCart(userId);
            
            if (cart) {
                await pool.execute(
                    'DELETE FROM cart_items WHERE cart_id = ?',
                    [cart.id]
                );
            }
            
            return this.getCartWithItems(cart?.id);
            
        } catch (error) {
            console.error('❌ Erreur clearCart:', error);
            throw error;
        }
    }
}

module.exports = new CartModel();