require('dotenv').config({path:'../.env'});
const Product = require('../config/models/Product');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
    try{
        const { search } = req.query;
        const whereClause = {};

        if (search){
            whereClause[Op.or] = [
                {sku: { [Op.like]: `%${search}%` }},
                {description: { [Op.like]: `%${search}%` }},
            ];
        }

        const products = await Product.findAll({where: whereClause});
        res.render('products/product', {products});

    }catch(err){
        return res.status(500).json({error: err.message});
    };
}

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