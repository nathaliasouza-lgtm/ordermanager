const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

class Product extends Model{
    //Checks if the price is negative
    async checkPrice(price) {
        
    }
    //Check if the product amount is negative
    async checkStorage(amount){

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
    sku:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    price:{
        type: DataTypes.DECIMAL(5,2)
    },
    storage_amt:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    activated:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    activated_at:{
        type: DataTypes.DATE,
        allowNull: true
    },
    deactivated_at:{
        type: DataTypes.DATE,
        allowNull: true
    }
    
},
    {
        sequelize,
        modelName: 'Product',
        timestamps: true
    }
);

module.exports = Customer;