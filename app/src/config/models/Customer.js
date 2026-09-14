const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

class Customer extends Model{
    //Checks the CPF
    async isValid(cpf) {
        var validCPF = false;
        return await validCPF;
        
    }
}

Customer.init(
{
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false

    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    cpf: {
        type: DataTypes.STRING(14),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(12),
        allowNull: false
    },
    zipcode:{
        type: DataTypes.STRING(8),
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    residence_number: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: 'SN'
    },
    neighborhood: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    state: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    uf: {
        type: DataTypes.STRING(2),
        allowNull: false
    },
},
    {
        sequelize,
        modelName: 'Customer',
        paranoid: true,
        timestamps: true
    }
);

module.exports = Customer;