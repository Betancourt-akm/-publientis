const express = require('express');
const router = express.Router();
const academicProgramController = require('../controller/academicProgramController');
const { protect, authorizeRoles } = require('../middleware/auth');

// Rutas públicas
router.get('/', academicProgramController.getAllPrograms);
router.get('/:id', academicProgramController.getProgramById);
router.get('/:id/stats', academicProgramController.getProgramStats);

// Rutas protegidas - Solo admin y facultad
router.post(
  '/',
  protect,
  authorizeRoles('ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'),
  academicProgramController.createProgram
);

router.put(
  '/:id',
  protect,
  authorizeRoles('ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'),
  academicProgramController.updateProgram
);

router.post(
  '/:id/approvers',
  protect,
  authorizeRoles('ADMIN', 'OWNER', 'FACULTY'),
  academicProgramController.addApprover
);

router.patch(
  '/:id/deactivate',
  protect,
  authorizeRoles('ADMIN', 'OWNER'),
  academicProgramController.deactivateProgram
);

module.exports = router;
