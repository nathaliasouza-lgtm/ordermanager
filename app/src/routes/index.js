const express = require('express');
const router = express.Router();
const { fn, col, Op, literal } = require('sequelize');
const { Customer, Product, Order, OrderItem } = require('../config/models');
const { syncOrderInventory } = require('../services/inventoryService');

router.get('/', async (req, res) => {
  try {
    const [
      totalCustomers,
      totalProductsSum,
      activeProductsCount,
      inactiveProductsCount,
      storageStats,
      rawOrders,
      upcomingOrders,
      topProducts,
      repeatCustomersList,
      revenueStats,
      pendingRevenueSum
    ] = await Promise.all([
      Customer.count(),
      Product.sum('storage_amt'),
      Product.count({ where: { activated: true } }),
      Product.count({ where: { activated: false } }),
      Product.findOne({
        attributes: [
          [fn('SUM', literal('storage_amt * price')), 'totalStorageValue'],
          [fn('AVG', col('price')), 'averageCost']
        ],
        raw: true
      }),
      Order.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('*')), 'count']
        ],
        group: ['status'],
        raw: true
      }),
      Order.findAll({
        where: {
          delivery_deadline: {
            [Op.ne]: null,
            [Op.gte]: new Date()
          },
          status: {
            [Op.notIn]: ['DELIVERED', 'CANCELLED']
          }
        },
        include: [{
          model: Customer,
          as: 'customers',
          attributes: ['name'],
          required: false
        }],
        order: [['delivery_deadline', 'ASC']],
        limit: 5
      }),
      OrderItem.findAll({
        attributes: [
          'product_id',
          [fn('SUM', col('OrderItem.amount')), 'totalSold']
        ],
        include: [{
          model: Product,
          as: 'products',
          attributes: ['description'],
        }],
        group: ['product_id'],
        order: [[literal('totalSold'), 'DESC']],
        limit: 5
      }),
      Order.findAll({
        attributes: [
          'customer_id',
          [fn('COUNT', col('id')), 'orderCount']
        ],
        where: {
          customer_id: { [Op.ne]: null },
          [Op.or]: [
            { status: null },
            literal("LOWER(status) NOT IN ('cancelled', 'refunded', 'failed', 'expired')")
          ]
        },
        group: ['customer_id'],
        having: literal('COUNT(*) > 1'),
        raw: true
      }),
      // Revenue & Order Financial Totals (excluding cancelled/refunded/failed/expired)
      Order.findOne({
        attributes: [
          [fn('SUM', col('payment_value')), 'totalRevenue'],
          [fn('AVG', col('payment_value')), 'averageOrderValue'],
          [fn('SUM', col('shipping_fee')), 'totalShipping'],
          [fn('SUM', col('discount_value')), 'totalDiscounts'],
          [fn('COUNT', col('id')), 'validOrdersCount']
        ],
        where: {
          [Op.or]: [
            { status: null },
            literal("LOWER(status) NOT IN ('cancelled', 'refunded', 'failed', 'expired')")
          ]
        },
        raw: true
      }),
      // Pending Payment Revenue
      Order.sum('payment_value', {
        where: literal("LOWER(status) = 'payment pending'")
      })
    ]);

    const ordersByStatus = {};
    rawOrders.forEach(item => {
      ordersByStatus[item.status] = item.count;
    });

    res.render('index', {
      totalCustomers,
      totalProductsInStorage: totalProductsSum || 0,
      activeProducts: activeProductsCount || 0,
      inactiveProducts: inactiveProductsCount || 0,
      totalStorageValue: Number(storageStats?.totalStorageValue || 0),
      averageStorageCost: Number(storageStats?.averageCost || 0),
      ordersByStatus,
      upcomingOrders,
      topProducts,
      repeatCustomersCount: repeatCustomersList.length,
      totalRevenue: Number(revenueStats?.totalRevenue || 0),
      averageOrderValue: Number(revenueStats?.averageOrderValue || 0),
      totalShipping: Number(revenueStats?.totalShipping || 0),
      totalDiscounts: Number(revenueStats?.totalDiscounts || 0),
      validOrdersCount: Number(revenueStats?.validOrdersCount || 0),
      pendingRevenue: Number(pendingRevenueSum || 0)
    });

  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

// GET full order details for the modal
router.get('/orders/:id/details', async (req, res) => {

  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customers', 
          required: false
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'products'
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.log('req param: ', req.params);
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to load order details' });
  }
});

// PATCH order status from the modal dropdown
router.patch('/orders/:id/status', express.json(), async (req, res) => {
  const t = await Order.sequelize.transaction();

  try {
    const orderId = req.params.id;
    const { status } = req.body || {};

    if (!status) {
      await t.rollback();
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    const previousStatus = order.status;

    // Adjusts product stock only if the status transition crosses deducted <-> restored
    await syncOrderInventory(order.items || [], previousStatus, status, t);

    order.status = status;
    await order.save({ transaction: t });

    await t.commit();
    res.json({ success: true, status: order.status });
  } catch (error) {
    await t.rollback();
    console.error('Error updating order status:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;