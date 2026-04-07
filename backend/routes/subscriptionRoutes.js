const express = require('express');
const router = express.Router();
const subscriptionController = require('../controller/subscriptionController');
const { protect, authorizeRoles } = require('../middleware/auth');

// Obtener mi suscripción actual
router.get(
  '/my-subscription',
  protect,
  authorizeRoles('ORGANIZATION'),
  subscriptionController.getMySubscription
);

// Actualizar a PRO (después de pago exitoso)
router.post(
  '/upgrade-to-pro',
  protect,
  authorizeRoles('ORGANIZATION'),
  subscriptionController.upgradeToPro
);

// Cancelar suscripción (downgrade a FREE)
router.post(
  '/cancel',
  protect,
  authorizeRoles('ORGANIZATION'),
  subscriptionController.cancelSubscription
);

// Verificar estado PRO de una organización (público)
router.get(
  '/check-pro/:organizationId',
  subscriptionController.checkProStatus
);

// Estadísticas de suscripciones (Admin)
router.get(
  '/stats',
  protect,
  authorizeRoles('ADMIN', 'OWNER'),
  subscriptionController.getSubscriptionStats
);

module.exports = router;
