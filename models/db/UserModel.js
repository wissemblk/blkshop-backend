// backend/models/db/UserModel.js
const pool = require('../../config/database');
const bcrypt = require('bcryptjs');
const User = require('../User');

class UserModel {
    async findByEmail(email) {
        try {
            console.log('🔍 UserModel.findByEmail:', email);
            
            // Vérifier que la requête est correcte
            const [rows] = await pool.execute(
                'SELECT id, name, email, password, role, address, created_at, updated_at FROM users WHERE email = ?',
                [email]
            );
            
            console.log('📦 Résultat brut:', rows);
            
            if (rows.length === 0) {
                console.log('✅ Aucun utilisateur trouvé avec cet email');
                return null;
            }
            
            // Vérifier que toutes les colonnes sont présentes
            const userData = rows[0];
            console.log('✅ Utilisateur trouvé:', {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role
            });
            
            return new User(userData);
            
        } catch (error) {
            console.error('❌ Erreur UserModel.findByEmail:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, name, email, password, role, address, created_at, updated_at FROM users WHERE id = ?',
                [id]
            );
            
            if (rows.length === 0) return null;
            return new User(rows[0]);
            
        } catch (error) {
            console.error(`❌ Erreur UserModel.findById ${id}:`, error);
            throw error;
        }
    }

    async create(userData) {
        try {
            const { name, email, password, address } = userData;
            
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, address) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, address || null]
            );
            
            return this.findById(result.insertId);
            
        } catch (error) {
            console.error('❌ Erreur UserModel.create:', error);
            throw error;
        }
    }

    async comparePassword(user, candidatePassword) {
        try {
            console.log('🔐 comparePassword appelé');
            console.log('   - Mot de passe stocké (hash):', user.password ? 'présent' : 'manquant');
            console.log('   - Mot de passe candidat:', candidatePassword ? 'présent' : 'manquant');
            
            if (!user.password) {
                console.log('❌ Pas de mot de passe stocké');
                return false;
            }
            
            const isValid = await bcrypt.compare(candidatePassword, user.password);
            console.log('   - Résultat:', isValid);
            
            return isValid;
            
        } catch (error) {
            console.error('❌ Erreur comparePassword:', error);
            return false;
        }
    }
}

module.exports = new UserModel();