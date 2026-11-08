require('dotenv').config({path:'../.env'});
const jwt = require('jsonwebtoken');
const Order = require('../config/models/Order');
const Customer = require('../config/models/Customer')
const { Op } = require('sequelize');


const JWT_SECRET = process.env.SECRET_KEY

exports.list = async (req, res) => {
    try{
        const { search } = req.query;
        const whereClause = {};

        if (search){
            whereClause[Op.or] = [
                {number: { [Op.like]: `%${search}%` }}
            ];
        }

        const order = await Order.findAll({where: whereClause});
        res.render('orders/order', {order});

    }catch(err){
        return res.status(500).json({error: err.message});
    };
}

exports.create = async (req, res) => {
    try{
        // get all information
        const {order_number, customer_token, payment_date, handling_deadline, delivery_deadline, discount_percentage, shipping_fee, discount_value, payment_value, payment_method, status} = req.body;

        const order = await Order.findOne({where: {order_number: order_number}});
        const isRegistered = order !== null ? true : false

        if (!customer_token) {
            return res.status(400).send('Selecione um cliente válido.');
        }

        // 2. Descriptografa e valida o JWT
        let decoded;
        try {
            decoded = jwt.verify(customer_token, JWT_SECRET);
        } catch (err) {
            console.error('Error:', err.message);
            return res.status(400).send('Invalid or expired token.');
        }
        const realCustomerId = decoded.customer_id;

        if (!isRegistered){
            await Order.create({order_number, customer_id: realCustomerId, payment_date, handling_deadline, delivery_deadline, discount_percentage, shipping_fee, discount_value, payment_value, payment_method, status});

            return res.redirect('/order');
        }else{
           return res.status(400).json({error: 'Oops! This order is already created!'});
        }

    }catch(err){
        return res.status(500).json({error:`${err.message}`});
    }
    
}

exports.list_customers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { searchValue } = req.query;
        const whereClause = {};

        if (searchValue){
            whereClause[Op.or] = [
                {name: { [Op.like]: `%${searchValue}%` }}
            ];
        }
        

        const { count, rows } = await Customer.findAndCountAll({
            attributes: ['id', 'name', 'cpf'],
            where: whereClause,
            offset: offset,
            limit: limit,
            order: [['name', 'ASC']],
        });
        const customersWithTokens = rows.map(customer => ({
            name: customer.name,
            cpf: customer.cpf,
            // O ID real vira um JWT assinado e seguro
            token: jwt.sign({ customer_id: customer.id }, JWT_SECRET, { expiresIn: '1h' })
        }));
        
        res.json({
            data: customersWithTokens,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });
    }catch (err) {
        res.status(500).json({ error: err });
    }
}