const express = require('express');
const router = express.Router();
const {
  searchTalent,
  searchJobs,
  getAllPrograms,
  getMarketplaceStats
} = require('../controller/marketplaceSearchController');

// Todas las rutas son PÚBLICAS (el marketplace es público)
router.get('/search-talent', searchTalent);
router.get('/search-jobs', searchJobs);
router.get('/programs', getAllPrograms);
router.get('/stats', getMarketplaceStats);

module.exports = router;
