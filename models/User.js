// backend/models/User.js
class User {
    constructor(userData) {
        console.log('🏗️ Création d\'un objet User avec:', userData);
        
        if (!userData) {
            console.error('❌ userData est undefined');
            userData = {};
        }

        // S'assurer que les bonnes propriétés sont utilisées
        this.id = userData.id || null;
        this.name = userData.name || '';
        this.email = userData.email || '';
        this.password = userData.password || '';
        this.role = userData.role || 'client';
        this.address = userData.address || null;
        this.createdAt = userData.created_at || userData.createdAt || new Date();
        this.updatedAt = userData.updated_at || userData.updatedAt || new Date();
        
        console.log('✅ User créé:', {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role
        });
    }

    isAdmin() {
        return this.role === 'admin';
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            address: this.address,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = User;