// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

console.log('🔐 Chargement du middleware auth...');

const authenticate = (req, res, next) => {
    console.log('🔑 Middleware authenticate appelé');
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('❌ Token manquant');
            throw new Error('Token manquant');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_par_defaut');
        req.user = decoded;
        
        console.log('✅ Utilisateur authentifié:', req.user.id);
        next();
    } catch (error) {
        console.error('❌ Erreur authentification:', error.message);
        res.status(401).json({ error: 'Veuillez vous authentifier' });
    }
};

const authorizeAdmin = (req, res, next) => {
    console.log('👑 Middleware authorizeAdmin appelé');
    console.log('   Rôle utilisateur:', req.user?.role);
    
    if (req.user?.role !== 'admin') {
        console.log('❌ Accès refusé - pas admin');
        return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    console.log('✅ Accès autorisé - admin');
    next();
};

console.log('   authenticate:', typeof authenticate === 'function' ? '✅' : '❌');
console.log('   authorizeAdmin:', typeof authorizeAdmin === 'function' ? '✅' : '❌');

module.exports = { authenticate, authorizeAdmin };