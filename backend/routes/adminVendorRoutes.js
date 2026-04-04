const express = require('express');
const router = express.Router();

const authToken = require('../middleware/authToken');
const adminRole = require('../middleware/adminRole');

const {
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getPendingVendorProducts,
  approveVendorProduct,
  rejectVendorProduct,
} = require('../controller/adminVendorController');

router.use(authToken);
router.use(adminRole);

router.get('/pending', getPendingVendors);
router.patch('/:vendorId/approve', approveVendor);
router.patch('/:vendorId/reject', rejectVendor);

router.get('/products/pending', getPendingVendorProducts);
router.patch('/products/:productId/approve', approveVendorProduct);
router.patch('/products/:productId/reject', rejectVendorProduct);

module.exports = router;
