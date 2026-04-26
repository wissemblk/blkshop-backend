// backend/models/Stock.js
class Stock {
    constructor(stockData) {
        // Vérifier que stockData existe
        if (!stockData) {
            console.error('❌ stockData est undefined ou null');
            stockData = {};
        }

        this.id = stockData.id || null;
        this.productId = stockData.product_id || stockData.productId || null;
        this.quantity = stockData.quantity || 0;
        this.lowStockThreshold = stockData.low_stock_threshold || stockData.lowStockThreshold || 5;
        this.updatedAt = stockData.updated_at || stockData.updatedAt || new Date();
    }

    addQuantity(amount) {
        this.quantity += amount;
        return this.quantity;
    }

    removeQuantity(amount) {
        if (this.quantity >= amount) {
            this.quantity -= amount;
            return true;
        }
        return false;
    }

    isLowStock() {
        return this.quantity <= this.lowStockThreshold;
    }

    checkAvailability(requestedQuantity) {
        return this.quantity >= requestedQuantity;
    }

    toJSON() {
        return {
            id: this.id,
            productId: this.productId,
            quantity: this.quantity,
            lowStockThreshold: this.lowStockThreshold,
            isLowStock: this.isLowStock(),
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Stock;