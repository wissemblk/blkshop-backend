class Shippint{
    constructor(shippingData){
        this.id = shippingData._id || shippingData.id;
        this.orderId = shippingData.orderId;
        this.userId = shippingData.userId;
        this.address = shippingData.address || null;
        this.status = shippingData.status || 'En préparation';
        this.trackingNumber = shippingData.trackingNumber || null;
        this.carrier = shippingData.carrier || null;
        this.estimatedDelivery = shippingData.estimatedDelivery || null;
        this.createdAt = shippingData.createdAt || new Date();
        this.updatedAt = shippingData.updatedAt || new Date();
    }

    updateStatus(status){
        const validStatuses = ['En preparation','Expedié','Livré','Retardé'];
        if(validStatuses.includes(status)){
            this.status = status;
            this.updatedAt = new Date();

        }
        return this.status;
    }

    assignTracking(trackingNumber,carrier){
        this.trackingNumber = trackingNumber;
        this.carrier = carrier;
        this.updatedAt = new Date();

    }

    toJSON() {
        return {
            id: this.id,
            orderId: this.orderId,
            userId: this.userId,
            address: this.address,
            status: this.status,
            trackingNumber: this.trackingNumber,
            carrier: this.carrier,
            estimatedDelivery: this.estimatedDelivery,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Shipping;