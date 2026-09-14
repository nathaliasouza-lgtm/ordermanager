const express = require('express');
const router = express.Router();
const customer = require('../controller/customer');

router.get('/', customer.list);
router.get('/new', async (req, res) => {
  return res.render('new-customers');
});

router.post('/', customer.create);

module.exports = router;
