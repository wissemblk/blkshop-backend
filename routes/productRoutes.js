// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

console.log('🔍 DEBUG - productRoutes.js');
console.log('   productController:', productController ? '✅' : '❌');
console.log('   productController.create:', typeof productController.create === 'function' ? '✅' : '❌');
console.log('   productController.getAll:', typeof productController.getAll === 'function' ? '✅' : '❌');
console.log('   authenticate:', typeof authenticate === 'function' ? '✅' : '❌');
console.log('   authorizeAdmin:', typeof authorizeAdmin === 'function' ? '✅' : '❌');

// Routes publiques - Vérifions chaque route individuellement
console.log('\n📝 Configuration des routes:');

try {
    router.get('/', productController.getAll);
    console.log('   ✅ GET /');
} catch (e) {
    console.log('   ❌ GET /:', e.message);
}

try {
    router.get('/:id', productController.getById);
    console.log('   ✅ GET /:id');
} catch (e) {
    console.log('   ❌ GET /:id:', e.message);
}

try {
    router.get('/category/:category', productController.getByCategory);
    console.log('   ✅ GET /category/:category');
} catch (e) {
    console.log('   ❌ GET /category/:category:', e.message);
}

// Routes protégées
try {
    router.post('/', authenticate, authorizeAdmin, productController.create);
    console.log('   ✅ POST /');
} catch (e) {
    console.log('   ❌ POST /:', e.message);
}

try {
    router.put('/:id', authenticate, authorizeAdmin, productController.update);
    console.log('   ✅ PUT /:id');
} catch (e) {
    console.log('   ❌ PUT /:id:', e.message);
}

try {
    router.delete('/:id', authenticate, authorizeAdmin, productController.delete);
    console.log('   ✅ DELETE /:id');
} catch (e) {
    console.log('   ❌ DELETE /:id:', e.message);
}

module.exports = router;