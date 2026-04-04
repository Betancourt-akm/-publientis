const express = require('express');
const router = express.Router();
const authToken = require('../../../middleware/authToken');
const {
  getAcademicProfile,
  updateAcademicProfile,
  getMyAcademicProfile,
  deleteAcademicProfile
} = require('../controllers/profileController');

// Obtener mi perfil académico (requiere autenticación)
router.get('/me', authToken, getMyAcademicProfile);

// Obtener perfil académico por userId (público si isPublic=true)
router.get('/:userId', getAcademicProfile);

// Actualizar perfil académico (solo el dueño o ADMIN)
router.put('/:userId', authToken, updateAcademicProfile);

// Eliminar perfil académico (solo el dueño o ADMIN)
router.delete('/:userId', authToken, deleteAcademicProfile);

module.exports = router;
