require('dotenv').config({ path: '../.env' });

const jwt = require('jsonwebtoken');
const Order = require('../config/models/Order');
const Customer = require('../config/models/Customer');
const { Product, OrderItem } = require('../config/models');
const { syncOrderInventory } = require('../services/inventoryService');

const { Op } = require('sequelize');

const JWT_SECRET = process.env.SECRET_KEY;


// LIST ORDERS
exports.list = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const offset = (page - 1) * limit;
        const search = (req.query.search || '').trim();
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { order_number: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['id', 'DESC']]
        });

        const totalPages = Math.max(1, Math.ceil(count / limit));

        return res.render('orders/order', {
            order: rows,
            currentPage: page,
            totalPages,
            totalItems: count,
            limit,
            search
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// CREATE ORDER
exports.create = async (req, res) => {
    let transaction;
    try {
        const {
            order_number,
            customer_token,
            payment_date,
            handling_deadline,
            delivery_deadline,
            discount_percentage,
            shipping_fee,
            discount_value,
            payment_value,
            payment_method,
            status
        } = req.body;

        let products = req.body.products;

        if (products && !Array.isArray(products)) {
            products = Object.values(products);
        }

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).send('Select at least one product.');
        }

        const existingOrder = await Order.findOne({
            where: { order_number }
        });

        if (existingOrder) {
            return res.status(400).json({
                error: 'Oops! This order is already created!'
            });
        }

        if (!customer_token) {
            return res.status(400).send('Selecione um cliente válido.');
        }

        let decoded;

        try {
            decoded = jwt.verify(customer_token, JWT_SECRET);
        } catch (err) {
            return res.status(400).send('Invalid or expired token.');
        }

        transaction = await Order.sequelize.transaction();

        const order = await Order.create({
            order_number,
            customer_id: decoded.customer_id,
            payment_date,
            handling_deadline,
            delivery_deadline,
            discount_percentage,
            shipping_fee,
            discount_value,
            payment_value,
            payment_method,
            status
        }, { transaction });

        const orderItems = [];

        for (const product of products) {
            const sku = String(
                product.product_sku || product.sku || ''
            ).trim();

            const amount = Number(product.amount);

            if (!sku || !Number.isInteger(amount) || amount <= 0) {
                throw new Error('Invalid product information.');
            }

            const productRecord = await Product.findOne({
                where: { sku },
                transaction
            });

            if (!productRecord) {
                throw new Error(`Product ${sku} was not found.`);
            }

            const unitPrice = Number(productRecord.price);

            if (!Number.isFinite(unitPrice) || unitPrice < 0) {
                throw new Error(`Invalid price for product ${sku}.`);
            }

            orderItems.push({
                order_id: order.id,
                product_id: productRecord.id,
                amount,
                unit_price: unitPrice,
                total_price: amount * unitPrice
            });
        }

        await OrderItem.bulkCreate(orderItems, { transaction });

        // Decreases product storage_amt if status is new, shipping, handling, or delivered
        // Does not change stock if status is failed, expired, payment pending, refunded, returned, or cancelled
        await syncOrderInventory(orderItems, null, status, transaction);

        await transaction.commit();

        return res.redirect('/order');

    } catch (err) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }

        console.error('Error creating order and order items:', err);

        return res.status(500).json({
            error: err.message
        });
    }
};

// LIST CUSTOMERS
exports.list_customers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { searchValue } = req.query;

        const whereClause = {};

        if (searchValue) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        const { count, rows } = await Customer.findAndCountAll({
            attributes: ['id', 'name', 'cpf'],
            where: whereClause,
            offset,
            limit,
            order: [['name', 'ASC']]
        });

        const customersWithTokens = rows.map(customer => ({
            name: customer.name,
            cpf: customer.cpf,
            token: jwt.sign(
                { customer_id: customer.id },
                JWT_SECRET,
                { expiresIn: '1h' }
            )
        }));

        return res.json({
            data: customersWithTokens,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// LIST PRODUCTS
exports.list_products = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { searchValue } = req.query;

        const whereClause = {
            activated: true
        };

        if (searchValue) {
            whereClause[Op.or] = [
                { sku: { [Op.like]: `%${searchValue}%` } },
                { description: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        const { count, rows } = await Product.findAndCountAll({
            attributes: ['sku', 'description', 'storage_amt', 'price'],
            where: whereClause,
            offset,
            limit,
            order: [['sku', 'ASC']]
        });

        return res.json({
            data: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};