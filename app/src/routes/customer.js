const express = require('express');
const router = express.Router();
const customer = require('../controller/customer');

router.get('/', customer.list);
router.get('/new', async (req, res) => {
  return res.render('customers/new-customer');
});

router.post('/', customer.create);
router.get('/:id', customer.getById);
router.patch('/:id', customer.update);

module.exports = router;
