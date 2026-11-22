const express = require('express');
const router = express.Router();
const order = require('../controller/order');

router.get('/', order.list);
router.get('/new', async (req, res) => {
  return res.render('orders/new-order');
});
router.get('/new/customers', order.list_customers);
router.get('/new/products', order.list_products);

router.post('/', order.create);

module.exports = router;
