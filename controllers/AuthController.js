// backend/controllers/authController.js
const UserModel = require('../models/db/UserModel');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password, address } = req.body;
            
          
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email déjà utilisé' });
            }

            
            const user = await UserModel.create({ name, email, password, address });

           
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'Inscription réussie',
                user: user.toJSON(),
                token
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

   // backend/controllers/authController.js
async login(req, res) {
    try {
        console.log('='.repeat(50));
        console.log('🔑 TENTATIVE DE CONNEXION');
        console.log('='.repeat(50));
        
        const { email, password } = req.body;
        console.log('📧 Email reçu:', email);
        console.log('🔐 Mot de passe reçu:', password ? '******' : 'non fourni');

        // Validation
        if (!email || !password) {
            console.log('❌ Email ou mot de passe manquant');
            return res.status(400).json({ 
                error: 'Email et mot de passe sont requis' 
            });
        }

        // Chercher l'utilisateur
        console.log('\n🔍 Recherche utilisateur dans la DB...');
        const user = await UserModel.findByEmail(email);
        
        if (!user) {
            console.log('❌ Utilisateur non trouvé:', email);
            return res.status(401).json({ 
                error: 'Email ou mot de passe incorrect' 
            });
        }
        
        console.log('✅ Utilisateur trouvé:', {
            id: user.id,
            email: user.email,
            role: user.role,
            hasPassword: !!user.password
        });

        // Vérifier le mot de passe
        console.log('\n🔐 Vérification du mot de passe...');
        const isValidPassword = await UserModel.comparePassword(user, password);
        console.log('✅ Résultat comparaison:', isValidPassword);
        
        if (!isValidPassword) {
            console.log('❌ Mot de passe incorrect');
            return res.status(401).json({ 
                error: 'Email ou mot de passe incorrect' 
            });
        }

        // Générer le token
        console.log('\n🎫 Génération du token JWT...');
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'votre_secret_jwt_par_defaut',
            { expiresIn: '7d' }
        );
        
        console.log('✅ Token généré avec succès');
        console.log('📤 Envoi de la réponse au client');

        res.json({
            message: 'Connexion réussie',
            user: user.toJSON(),
            token
        });

    } catch (error) {
        console.error('❌ ERREUR CRITIQUE:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la connexion',
            details: error.message 
        });
    }
}
    async getProfile(req, res) {
        try {
            const user = await UserModel.findById(req.user.id);
            res.json(user.toJSON());
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { name, address } = req.body;
            const user = await UserModel.update(req.user.id, { name, address });
            res.json({
                message: 'Profil mis à jour avec succès',
                user: user.toJSON()
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();