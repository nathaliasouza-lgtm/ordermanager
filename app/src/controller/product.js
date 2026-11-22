require('dotenv').config({path:'../.env'});
const Product = require('../config/models/Product');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const offset = (page - 1) * limit;
        const search = (req.query.search || '').trim();
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { sku: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['sku', 'ASC']]
        });

        const totalPages = Math.max(1, Math.ceil(count / limit));

        res.render('products/product', {
            products: rows,
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

exports.create = async (req, res) => {
    try{
        // get all information
        const {sku, description, price, storage_amt, activated, activation_date} = req.body;

        const product = await Product.findOne({where: {sku: sku}});
        const isRegistered = product !== null ? true : false

        if (!isRegistered){
            await Product.create({sku, description, price, storage_amt,activated, activation_date});

            return res.redirect('/product');
        }else{
           return res.status(400).json({error: 'Oops! This product is already created!'});
        }

    }catch(err){
        return res.status(500).json({error:`${err.message}`});
    }
    
}

exports.update = async (req, res) => {
    try {
        const { sku } = req.params;
        const { price, storage_amt, activated } = req.body;

        const product = await Product.findOne({ where: { sku } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const parsedPrice = Number(price);
        const parsedAmount = Number(storage_amt);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ error: 'Invalid unit price.' });
        }

        if (!Number.isInteger(parsedAmount) || parsedAmount < 0) {
            return res.status(400).json({ error: 'Stock amount must be a non-negative integer.' });
        }

        const nextActivated = Boolean(activated);
        const now = new Date();

        // Manage activation/deactivation timestamps automatically
        if (product.activated && !nextActivated) {
            product.deactivated_at = now;
        } else if (!product.activated && nextActivated) {
            product.deactivated_at = null;
            product.activation_date = now;
        }

        product.price = parsedPrice;
        product.storage_amt = parsedAmount;
        product.activated = nextActivated;

        await product.save();

        return res.json({
            success: true,
            product: {
                sku: product.sku,
                price: product.price,
                storage_amt: product.storage_amt,
                activated: product.activated,
                activation_date: product.activation_date,
                deactivated_at: product.deactivated_at
            }
        });
    } catch (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ error: err.message });
    }
};