const express = require('express');
const router = express.Router();
const order = require('../controller/order');

router.get('/', order.list);
router.get('/new', async (req, res) => {
  return res.render('orders/new-order');
});

router.post('/', order.create);

module.exports = router;
