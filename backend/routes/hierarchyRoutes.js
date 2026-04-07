const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  getUniversities,
  getFacultiesByUniversity,
  getProgramsByFaculty,
  getFullHierarchy,
  createUniversity,
  createFaculty,
  createProgram,
  addProfessorsToProgram
} = require('../controller/hierarchyController');

/**
 * Rutas de Jerarquía Académica
 * Universidad → Facultad → Programa Académico
 * 
 * Cascading Select para registro y navegación adaptativa
 */

// Rutas públicas (para Cascading Select en registro)
router.get('/universities', getUniversities);
router.get('/faculties/:universityId', getFacultiesByUniversity);
router.get('/programs/:facultyId', getProgramsByFaculty);

// Rutas protegidas
router.get('/full/:universityId', protect, getFullHierarchy);

// Creación de entidades (Admin only)
router.post('/university', protect, authorizeRoles('ADMIN', 'OWNER'), createUniversity);
router.post('/faculty', protect, authorizeRoles('ADMIN', 'OWNER', 'FACULTY'), createFaculty);
router.post('/program', protect, authorizeRoles('ADMIN', 'OWNER', 'FACULTY'), createProgram);

// Vincular profesores a programa
router.put(
  '/program/:programId/professors',
  protect,
  authorizeRoles('ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'),
  addProfessorsToProgram
);

module.exports = router;
