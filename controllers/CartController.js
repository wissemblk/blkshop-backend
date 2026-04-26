// backend/controllers/cartController.js
const CartModel = require('../models/db/CartModel');
const ProductModel = require('../models/db/ProductModel');
const StockModel = require('../models/db/StockModel');

class CartController {
    async getCart(req, res) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Utilisateur non authentifié' });
            }

            console.log('👤 Récupération panier pour user:', req.user.id);
            const cart = await CartModel.getOrCreateCart(req.user.id);
            res.json(cart ? cart.toJSON() : { items: [], total: 0 });
            
        } catch (error) {
            console.error('❌ Erreur getCart:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async addItem(req, res) {
        try {
            const { productId, quantity = 1 } = req.body;
            
            console.log('📦 Tentative d\'ajout au panier:', { 
                userId: req.user.id, 
                productId, 
                quantity 
            });

            // Validations
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Utilisateur non authentifié' });
            }

            if (!productId) {
                return res.status(400).json({ error: 'productId est requis' });
            }

            if (quantity < 1) {
                return res.status(400).json({ error: 'La quantité doit être supérieure à 0' });
            }

            // Vérifier si le produit existe
            const product = await ProductModel.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Produit non trouvé' });
            }

            // Vérifier le stock
            const stock = await StockModel.findByProductId(productId);
            if (!stock || stock.quantity < quantity) {
                return res.status(400).json({ 
                    error: `Stock insuffisant. Disponible: ${stock?.quantity || 0}` 
                });
            }

            const cart = await CartModel.addItem(req.user.id, productId, quantity);
            
            res.json({
                message: 'Produit ajouté au panier',
                cart: cart.toJSON()
            });
            
        } catch (error) {
            console.error('❌ Erreur addItem:', error);
            res.status(500).json({ 
                error: 'Erreur lors de l\'ajout au panier',
                details: error.message 
            });
        }
    }

    async updateItem(req, res) {
        try {
            const { productId, quantity } = req.body;

            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Utilisateur non authentifié' });
            }

            if (!productId) {
                return res.status(400).json({ error: 'productId est requis' });
            }

            if (quantity === undefined || quantity === null) {
                return res.status(400).json({ error: 'quantity est requis' });
            }

            const cart = await CartModel.updateItem(req.user.id, productId, quantity);

            res.json({
                message: 'Panier mis à jour',
                cart: cart.toJSON()
            });
            
        } catch (error) {
            console.error('❌ Erreur updateItem:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async removeItem(req, res) {
        try {
            const { productId } = req.params;

            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Utilisateur non authentifié' });
            }

            if (!productId) {
                return res.status(400).json({ error: 'productId est requis' });
            }

            const cart = await CartModel.removeItem(req.user.id, productId);

            res.json({
                message: 'Produit retiré du panier',
                cart: cart.toJSON()
            });
            
        } catch (error) {
            console.error('❌ Erreur removeItem:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async clearCart(req, res) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Utilisateur non authentifié' });
            }

            const cart = await CartModel.clearCart(req.user.id);

            res.json({
                message: 'Panier vidé avec succès',
                cart: cart ? cart.toJSON() : { items: [], total: 0 }
            });
            
        } catch (error) {
            console.error('❌ Erreur clearCart:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CartController();