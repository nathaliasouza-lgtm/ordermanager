const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

class Product extends Model{

}

Product.init(
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
        allowNull: true
    },
    activation_date:{
        type: DataTypes.DATE,
        allowNull: true,
    },
    deactivation_date:{
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

module.exports = Product;