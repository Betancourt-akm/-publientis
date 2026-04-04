const express = require('express');
const router = express.Router();

const authToken = require('../middleware/authToken');
const {
  getMyVendorProfile,
  registerVendor,
  getMyProducts,
  createMyProduct,
  getMySalesSummary,
  getMySalesItems,
} = require('../controller/vendorController');

router.use(authToken);

router.get('/me', getMyVendorProfile);
router.post('/register', registerVendor);
router.get('/products', getMyProducts);
router.post('/products', createMyProduct);
router.get('/sales', getMySalesSummary);
router.get('/sales/items', getMySalesItems);

module.exports = router;
