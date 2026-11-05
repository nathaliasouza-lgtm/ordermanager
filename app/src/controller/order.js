require('dotenv').config({path:'../.env'});
const Order = require('../config/models/Order');
const { Op } = require('sequelize');

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
        const {order_number, payment_date, handling_deadline, delivery_deadline, discount_percentage, shipping_fee, discount_value, payment_value, payment_method, status} = req.body;

        const order = await Order.findOne({where: {order_number: order_number}});
        const isRegistered = order !== null ? true : false

        if (!isRegistered){
            await Order.create({order_number, payment_date, handling_deadline, delivery_deadline, discount_percentage, shipping_fee, discount_value, payment_value, payment_method, status});

            return res.redirect('/order');
        }else{
           return res.status(400).json({error: 'Oops! This order is already created!'});
        }

    }catch(err){
        return res.status(500).json({error:`${err.message}`});
    }
    
}