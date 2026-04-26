class Order {
    constructor(orderData) {
        this.id = orderData._id || orderData.id;
        this.userId = orderData.userId;
        this.items = orderData.items || [];
        this.total = orderData.total || 0;
        this.status = orderData.status || 'En preparation'; // CORRIGÉ
        this.shippingAddress = orderData.shippingAddress || null; // CORRIGÉ
        this.paymentMethod = orderData.paymentMethod || null;
        this.paymentStatus = orderData.paymentStatus || null;
        this.createdAt = orderData.createdAt || new Date();
        this.updatedAt = orderData.updatedAt || new Date();
    }

    updateStatus(status) {
        const validStatuses = ['En preparation', 'Expedié', 'Livré', 'Annulé'];
        if (validStatuses.includes(status)) {
            this.status = status;
            this.updatedAt = new Date();
        }
        return this.status;
    }

    cancel() {
        if (this.status === 'En preparation') {
            this.status = 'Annulé';
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            items: this.items,
            total: this.total,
            status: this.status,
            shippingAddress: this.shippingAddress, // CORRIGÉ
            paymentMethod: this.paymentMethod,
            paymentStatus: this.paymentStatus,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Order;