const express = require('express');
const router = express.Router();
const userProfileController = require('../controller/userProfileController');
const { protect } = require('../middleware/auth');

// Rutas protegidas - requieren autenticación
router.put(
  '/pedagogical',
  protect,
  userProfileController.updatePedagogicalProfile
);

router.post(
  '/pedagogical/tags',
  protect,
  userProfileController.addPedagogicalTag
);

router.delete(
  '/pedagogical/tags',
  protect,
  userProfileController.removePedagogicalTag
);

router.get(
  '/pedagogical',
  protect,
  userProfileController.getPedagogicalProfile
);

router.get(
  '/pedagogical/:userId',
  protect,
  userProfileController.getPedagogicalProfile
);

router.get(
  '/match/:jobOfferId',
  protect,
  userProfileController.calculatePedagogicalMatch
);

module.exports = router;
