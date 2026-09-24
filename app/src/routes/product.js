const express = require('express');
const router = express.Router();
const product = require('../controller/product');

router.get('/', product.list);
router.get('/new', async (req, res) => {
  return res.render('products/new-product');
});
router.post('/', product.create);

module.exports = router;