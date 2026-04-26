// backend/controllers/orderController.js
const OrderModel = require('../models/db/OrderModel');
const CartModel = require('../models/db/CartModel');
const StockModel = require('../models/db/StockModel');
const Order = require('../models/Order');

class OrderController {
    async create(req, res) {
        try {
            const { shippingAddress, paymentMethod } = req.body;

            // Get user's cart
            const cart = await CartModel.getOrCreateCart(req.user.id);
            if (!cart.items || cart.items.length === 0) {
                return res.status(400).json({ error: 'Panier vide' });
            }

            // Check stock availability for all items
            for (const item of cart.items) {
                const stock = await StockModel.findByProductId(item.productId);
                if (!stock || stock.quantity < item.quantity) {
                    return res.status(400).json({ 
                        error: `Stock insuffisant pour ${item.name}` 
                    });
                }
            }

            // Create order
            const orderData = {
                total: cart.getTotal(),
                shippingAddress,
                paymentMethod
            };

            const order = await OrderModel.create(req.user.id, orderData, cart.items);

            // Update stock for each item
            for (const item of cart.items) {
                await StockModel.updateQuantity(item.productId, item.quantity, 'subtract');
            }

            // Clear cart
            await CartModel.clearCart(req.user.id);

            // Get invoice and shipping info
            const [invoiceRows] = await pool.execute(
                'SELECT * FROM invoices WHERE order_id = ?',
                [order.id]
            );
            
            const [shippingRows] = await pool.execute(
                'SELECT * FROM shipping WHERE order_id = ?',
                [order.id]
            );

            res.status(201).json({
                message: 'Commande créée avec succès',
                order: order.toJSON(),
                invoice: invoiceRows[0],
                shipping: shippingRows[0]
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async getUserOrders(req, res) {
        try {
            const orders = await OrderModel.findByUser(req.user.id);
            res.json(orders.map(order => order.toJSON()));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const order = await OrderModel.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ error: 'Commande non trouvée' });
            }

            // Check if user owns the order or is admin
            if (order.userId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Accès non autorisé' });
            }

            // Get invoice and shipping info
            const [invoiceRows] = await pool.execute(
                'SELECT * FROM invoices WHERE order_id = ?',
                [order.id]
            );
            
            const [shippingRows] = await pool.execute(
                'SELECT * FROM shipping WHERE order_id = ?',
                [order.id]
            );

            res.json({
                order: order.toJSON(),
                invoice: invoiceRows[0],
                shipping: shippingRows[0]
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;

            const order = await OrderModel.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ error: 'Commande non trouvée' });
            }

            const updatedOrder = await OrderModel.updateStatus(req.params.id, status);

            // Update shipping status if order is shipped or delivered
            if (status === 'Expédiée' || status === 'Livrée') {
                await pool.execute(
                    'UPDATE shipping SET status = ? WHERE order_id = ?',
                    [status, req.params.id]
                );
            }

            res.json({
                message: 'Statut de la commande mis à jour',
                order: updatedOrder.toJSON()
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async cancelOrder(req, res) {
        try {
            const order = await OrderModel.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ error: 'Commande non trouvée' });
            }

            // Check if user owns the order
            if (order.userId !== req.user.id) {
                return res.status(403).json({ error: 'Accès non autorisé' });
            }

            const cancelled = await OrderModel.cancelOrder(req.params.id);
            if (!cancelled) {
                return res.status(400).json({ 
                    error: 'Impossible d\'annuler cette commande' 
                });
            }

            // Restore stock
            for (const item of order.items) {
                await StockModel.updateQuantity(item.productId, item.quantity, 'add');
            }

            res.json({ message: 'Commande annulée avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new OrderController();