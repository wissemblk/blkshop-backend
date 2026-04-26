class Invoice {
    constructor(invoiceData) {
        this.id = invoiceData._id || invoiceData.id;
        this.orderId = invoiceData.orderId;
        this.userId = invoiceData.userId;
        this.invoiceNumber = invoiceData.invoiceNumber || this.generateInvoiceNumber();
        this.items = invoiceData.items || [];
        this.subtotal = invoiceData.subtotal || 0;
        this.discount = invoiceData.discount || 0;
        this.total = invoiceData.total || 0;
        this.createdAt = invoiceData.createdAt || new Date();
    }

    generateInvoiceNumber() {
        const date = new Date();
        return `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 9)}`;
    }

    applyDiscount(percentage) {
        this.discount = (this.subtotal * percentage) / 100;
        this.total = this.subtotal - this.discount;
    }

    applyCoupon(coupon) {
        if (coupon.type === 'percentage') {
            this.discount = (this.subtotal * coupon.value) / 100;
        } else if (coupon.type === 'fixed') {
            this.discount = coupon.value;
        }
        this.total = this.subtotal - this.discount;
    }

    toJSON() {
        return {
            id: this.id,
            invoiceNumber: this.invoiceNumber,
            orderId: this.orderId,
            userId: this.userId,
            items: this.items,
            subtotal: this.subtotal,
            discount: this.discount,
            total: this.total,
            createdAt: this.createdAt
        };
    }
}

module.exports = Invoice;