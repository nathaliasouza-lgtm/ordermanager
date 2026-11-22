const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

class OrderItem extends Model {

    static associate(models) {
        this.belongsTo(models.Order, {
            foreignKey: 'order_id', // Mesmo nome da coluna
            as: 'orders'
        });

        this.belongsTo(models.Product, {
            foreignKey: 'product_id',
            targetKey: 'id',
            as: 'products'
        });
}

}

OrderItem.init({

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },

    // Links this item to the order
    order_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    // Links this item to the product
    product_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }

}, {
    sequelize,
    modelName: 'OrderItem',
    paranoid: true,
    timestamps: true
});

module.exports = OrderItem;