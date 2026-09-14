const express = require('express');
const router = express.Router();
const customer = require('../controller/customer');

router.get('/', customer.list);
router.post('/', customer.create);

module.exports = router;
