require('dotenv').config({path:'../.env'});
const Customer = require('../config/models/Customer');
const { Op } = require('sequelize');


// Variables
const host = process.env.HOST;
const port = process.env.PORT;

exports.list = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const offset = (page - 1) * limit;
        const search = (req.query.search || '').trim();
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { cpf: { [Op.like]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Customer.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['name', 'ASC']]
        });

        const totalPages = Math.max(1, Math.ceil(count / limit));

        return res.render('customers/customer', {
            customers: rows,
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
        const {name, cpf, email, phone, zipcode, address, residence_number, neighborhood, city, state, uf } = req.body;

        const customer = await Customer.findOne({where: {cpf: cpf}});
        const isRegistered = customer !== null ? true : false

        if (!isRegistered){
            await Customer.create({name, cpf, email, phone, zipcode, address, residence_number, neighborhood, city, state, uf});

            return res.redirect('/customer');

        }else{
           return res.status(400).json({error: 'Oops! This customer is already created!'});
        }

    }catch(err){
        return res.status(500).json({error:`${err.message}`});
    }
    
}

exports.getById = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }
        return res.json(customer);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            cpf,
            email,
            phone,
            zipcode,
            address,
            residence_number,
            neighborhood,
            city,
            state,
            uf
        } = req.body;

        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        const trimmedName = String(name || '').trim();
        const trimmedCpf = String(cpf || '').trim();
        const trimmedEmail = String(email || '').trim();

        if (!trimmedName || !trimmedCpf) {
            return res.status(400).json({ error: 'Name and CPF are required.' });
        }

        // Prevent duplicate CPF if CPF was changed
        if (trimmedCpf !== customer.cpf) {
            const duplicateCpf = await Customer.findOne({
                where: {
                    cpf: trimmedCpf,
                    id: { [Op.ne]: id }
                }
            });
            if (duplicateCpf) {
                return res.status(400).json({ error: 'Another customer is already registered with this CPF.' });
            }
        }

        customer.name = trimmedName;
        customer.cpf = trimmedCpf;
        customer.email = trimmedEmail;
        customer.phone = phone ? String(phone).trim() : null;
        customer.zipcode = zipcode ? String(zipcode).trim() : null;
        customer.address = address ? String(address).trim() : null;
        customer.residence_number = residence_number ? String(residence_number).trim() : null;
        customer.neighborhood = neighborhood ? String(neighborhood).trim() : null;
        customer.city = city ? String(city).trim() : null;
        customer.state = state ? String(state).trim() : null;
        customer.uf = uf ? String(uf).trim().toUpperCase() : null;

        await customer.save();

        return res.json({
            success: true,
            customer
        });
    } catch (err) {
        console.error('Error updating customer:', err);
        return res.status(500).json({ error: err.message });
    }
};