// backend/models/db/OrderModel.js
const pool = require('../../config/database');
const Order = require('../Order');

class OrderModel {
    async create(userId, orderData, cartItems) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
           
            const [orderResult] = await connection.execute(
                `INSERT INTO orders (user_id, total, shipping_address, payment_method) 
                 VALUES (?, ?, ?, ?)`,
                [userId, orderData.total, orderData.shippingAddress, orderData.paymentMethod]
            );
            
            const orderId = orderResult.insertId;
            
           
            for (const item of cartItems) {
                await connection.execute(
                    `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [orderId, item.productId, item.name, item.quantity, item.price, item.total]
                );
            }
            
            
            const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            await connection.execute(
                `INSERT INTO invoices (invoice_number, order_id, user_id, subtotal, total) 
                 VALUES (?, ?, ?, ?, ?)`,
                [invoiceNumber, orderId, userId, orderData.total, orderData.total]
            );
            
            await connection.execute(
                `INSERT INTO shipping (order_id, user_id, address) 
                 VALUES (?, ?, ?)`,
                [orderId, userId, orderData.shippingAddress]
            );
            
            await connection.commit();
            
            return this.findById(orderId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async findById(id) {
        const [orderRows] = await pool.execute(
            'SELECT * FROM orders WHERE id = ?',
            [id]
        );
        
        if (orderRows.length === 0) return null;
        
        const [items] = await pool.execute(
            'SELECT * FROM order_items WHERE order_id = ?',
            [id]
        );
        
        const orderData = {
            ...orderRows[0],
            items: items.map(item => ({
                ...item,
                price: parseFloat(item.price),
                total: parseFloat(item.total)
            }))
        };
        
        return new Order(orderData);
    }

    async findByUser(userId) {
        const [orderRows] = await pool.execute(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        const orders = [];
        for (const row of orderRows) {
            const [items] = await pool.execute(
                'SELECT * FROM order_items WHERE order_id = ?',
                [row.id]
            );
            
            orders.push(new Order({
                ...row,
                items: items.map(item => ({
                    ...item,
                    price: parseFloat(item.price),
                    total: parseFloat(item.total)
                }))
            }));
        }
        
        return orders;
    }

    async updateStatus(orderId, status) {
        await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );
        
        return this.findById(orderId);
    }

    async updatePaymentStatus(orderId, paymentStatus) {
        await pool.execute(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            [paymentStatus, orderId]
        );
        
        return this.findById(orderId);
    }

    async cancelOrder(orderId) {
        const order = await this.findById(orderId);
        
        if (order && order.status === 'En preparation') {
            await pool.execute(
                'UPDATE orders SET status = ? WHERE id = ?',
                ['Annulé', orderId]
            );
            return true;
        }
        
        return false;
    }
}

module.exports = new OrderModel();