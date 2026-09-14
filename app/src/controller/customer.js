require('dotenv').config({path:'../.env'});
const Customer = require('../config/models/Customer');
const { Op } = require('sequelize');


// Variables
const host = process.env.HOST;
const port = process.env.PORT;

exports.list = async (req, res) => {
    try{
        const { search } = req.query;
        const whereClause = {};

        if (search){
            whereClause[Op.or] = [
                {name: { [Op.like]: `%${search}%` }},
                {email: { [Op.like]: `%${search}%` }},
                {cpf: { [Op.like]: `%${search}%` }},
            ];
        }

        const customers = await Customer.findAll({where: whereClause});
        return res.status(201).json({
            message: 'Sending all customers!', 
            customers: customers
        })

    }catch(err){
        return res.status(500).json({error: err.message});
    };

}

exports.create = async (req, res) => {
    try{

        // get all information
        const {name, cpf, email, phone, zipcode, address, residence_number, neighborhood, city, state, uf } = req.body;

        const customer = await Customer.findOne({where: {cpf: cpf}});
        const isRegistered = customer !== null ? true : false

        if (!isRegistered){
            const createCustomer = await Customer.create({name, cpf, email, phone, zipcode, address, residence_number, neighborhood, city, state, uf});

            return res.status(201).json({
                message: 'Customer is successfully created!',
                customer: createCustomer.id,
                created_at: createCustomer.created_at
            });
        }else{
           return res.status(400).json({error: 'Oops! This customer is already created!'});
        }

    }catch(err){
        return res.status(500).json({error:`${err.message}`});
    }
    
}