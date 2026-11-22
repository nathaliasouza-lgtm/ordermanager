const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

class Order extends Model{
    // creates a relationship one-to-many with OrderItem and one to one association with Customer
    static associate(models){
      
        this.hasMany(models.OrderItem, {
            foreignKey: 'order_id',
            as: 'items'            
        });
        this.belongsTo(models.Customer, {
            foreignKey: 'customer_id',
            as: 'customers'
        });
    }
}

Order.init(
{
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    order_number: {
        type: DataTypes.STRING(40),
        allowNull: false
    },
    customer_id: {
        type: DataTypes.UUID, 
        allowNull: true,
        references: {
        model: 'customers',
        key: 'id'
        }
    },
    payment_date:{
        type: DataTypes.DATE,
        allowNull: false,
        comment:'The moment the order is completed and payment is confirmed.'
    },
    handling_deadline:{
        type: DataTypes.DATE,
        allowNull: false,
        comment:"Deadline to prepare the products to be sent. Normally, 03 days after payment is confirmed"
    },
    delivery_deadline:{
        type: DataTypes.DATE,
        allowNull: false,
        comment:'Deadline to the order arrive to customer\'s address after the handling deadline.'
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
        allowNull: true,
        comment:"Total payment after discount (when applicable)"
    },
    payment_method:{
        type: DataTypes.STRING(60),
        allowNull: false,
        comment:"Credit Card, Debit Card, Bank Transfer"
    },
    status:{
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