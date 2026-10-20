const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

class OrderItem extends Model{

}

OrderItem.init(
{
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_price:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    total_price:{
        type: DataTypes.DECIMAL,
        allowNull: false
    }
},
    {
        sequelize,
        modelName: 'OrderItem',
        paranoid: true,
        timestamps: true
    }
);

module.exports = OrderItem;