const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Toutes les routes de commande nécessitent une authentification
router.use(authenticate);

router.post('/', orderController.create);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getById);
router.put('/:id/status', authorizeAdmin, orderController.updateStatus);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;  // ← IMPORTANT: exporter le router