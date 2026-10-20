const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

class Order extends Model{

}

Order.init(
{
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    number: {
        type: DataTypes.STRING(40),
        allowNull: false
    },
    payment_date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    handling_deadline:{
        type: DataTypes.DATE,
        allowNull: false
    },
    delivery_deadline:{
        type: DataTypes.DATE,
        allowNull: false
    },
    discount_percentage:{
        type: DataTypes.DECIMAL,
        allowNull: true 
    },
    discount_value:{
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    shipping_fee:{
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    payment_value:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    payment_method:{
        type: DataTypes.STRING(60),
        allowNull: false,
        comment:"Credit Card, Debit Card, Bank Transfer"
    },
    order_status:{
        type: DataTypes.STRING(40),
        allowNull: false,
        comment: "NEW, CANCELLED, SHIPPING, HANDLING, DELIVERED, PAYMENT PENDING, REFUNDED, RETURNED, EXPIRED, FAILED"
    }
},
    {
        sequelize,
        modelName: 'Order',
        paranoid: true,
        timestamps: true
    }
);

module.exports = Order;