const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Appliquer les middleware d'authentification et admin à toutes les routes
router.use(authenticate);
router.use(authorizeAdmin);

// ==================== GESTION DES COMMANDES ====================

// Récupérer toutes les commandes
router.get('/orders', async (req, res) => {
    try {
        console.log('📋 Récupération de toutes les commandes');
        
        const orders = await Order.find()
            .populate('userId', 'email name')
            .sort({ createdAt: -1 });
        
        console.log(`✅ ${orders.length} commandes trouvées`);
        res.json(orders);
    } catch (error) {
        console.error('❌ Erreur récupération commandes:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer une commande spécifique
router.get('/orders/:orderId', async (req, res) => {
    try {
        console.log(`📋 Récupération commande ${req.params.orderId}`);
        
        const order = await Order.findById(req.params.orderId)
            .populate('userId', 'email name');
        
        if (!order) {
            console.log('❌ Commande non trouvée');
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        
        console.log('✅ Commande trouvée');
        res.json(order);
    } catch (error) {
        console.error('❌ Erreur récupération commande:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Mettre à jour le statut d'une commande
router.put('/orders/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;
        console.log(`🔄 Mise à jour commande ${req.params.orderId} -> statut: ${status}`);
        
        const validStatuses = ['En preparation', 'Expedié', 'Livré', 'Annulé'];
        
        if (!validStatuses.includes(status)) {
            console.log('❌ Statut invalide');
            return res.status(400).json({ message: 'Statut invalide' });
        }
        
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status, updatedAt: new Date() },
            { new: true }
        );
        
        if (!order) {
            console.log('❌ Commande non trouvée');
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        
        console.log('✅ Statut mis à jour');
        res.json(order);
    } catch (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// ==================== GESTION DES UTILISATEURS ====================

// Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
    try {
        console.log('👥 Récupération de tous les utilisateurs');
        
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        
        // Ajouter le nombre de commandes par utilisateur
        const usersWithOrderCount = await Promise.all(
            users.map(async (user) => {
                const orderCount = await Order.countDocuments({ userId: user._id });
                return {
                    ...user.toObject(),
                    orderCount
                };
            })
        );
        
        console.log(`✅ ${users.length} utilisateurs trouvés`);
        res.json(usersWithOrderCount);
    } catch (error) {
        console.error('❌ Erreur récupération utilisateurs:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Mettre à jour le rôle d'un utilisateur
router.put('/users/:userId/role', async (req, res) => {
    try {
        const { role } = req.body;
        console.log(`🔄 Mise à jour utilisateur ${req.params.userId} -> rôle: ${role}`);
        
        if (!['user', 'admin'].includes(role)) {
            console.log('❌ Rôle invalide');
            return res.status(400).json({ message: 'Rôle invalide' });
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role, updatedAt: new Date() },
            { new: true }
        ).select('-password');
        
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        console.log('✅ Rôle mis à jour');
        res.json(user);
    } catch (error) {
        console.error('❌ Erreur mise à jour rôle:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Supprimer un utilisateur
router.delete('/users/:userId', async (req, res) => {
    try {
        console.log(`🗑️ Suppression utilisateur ${req.params.userId}`);
        
        // Empêcher la suppression de son propre compte
        if (req.params.userId === req.user.id) {
            console.log('❌ Tentative de suppression de son propre compte');
            return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
        }
        
        const user = await User.findByIdAndDelete(req.params.userId);
        
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Supprimer toutes les commandes de l'utilisateur
        await Order.deleteMany({ userId: req.params.userId });
        
        console.log('✅ Utilisateur supprimé');
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// ==================== GESTION DES PRODUITS (Admin) ====================

// Mettre à jour le stock d'un produit
router.patch('/products/:productId/stock', async (req, res) => {
    try {
        const { stock } = req.body;
        console.log(`🔄 Mise à jour stock produit ${req.params.productId} -> ${stock}`);
        
        if (stock === undefined || stock < 0) {
            console.log('❌ Stock invalide');
            return res.status(400).json({ message: 'Stock invalide' });
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            { stock, updatedAt: new Date() },
            { new: true }
        );
        
        if (!product) {
            console.log('❌ Produit non trouvé');
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        
        console.log('✅ Stock mis à jour');
        res.json(product);
    } catch (error) {
        console.error('❌ Erreur mise à jour stock:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// ==================== STATISTIQUES ====================

// Statistiques admin
router.get('/stats', async (req, res) => {
    try {
        console.log('📊 Récupération des statistiques');
        
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        
        const revenue = await Order.aggregate([
            { $match: { status: { $ne: 'Annulé' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        console.log('✅ Statistiques calculées');
        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue: revenue[0]?.total || 0,
            ordersByStatus
        });
    } catch (error) {
        console.error('❌ Erreur statistiques:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;