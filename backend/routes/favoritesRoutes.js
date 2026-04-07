const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  saveCandidate,
  removeSavedCandidate,
  getSavedCandidates,
  updateCandidateNotes,
  checkIfSaved,
  getSavedStats
} = require('../controller/favoritesController');

// Todas las rutas requieren autenticación y rol de organización (o admin)
router.use(protect);
router.use(authorizeRoles('ORGANIZATION', 'ADMIN', 'OWNER'));

// Obtener todos los candidatos guardados (con filtros opcionales)
router.get('/', getSavedCandidates);

// Obtener estadísticas de guardados
router.get('/stats', getSavedStats);

// Verificar si un candidato está guardado
router.get('/check/:candidateId', checkIfSaved);

// Guardar un candidato
router.post('/save', saveCandidate);

// Actualizar notas de un candidato guardado
router.put('/:candidateId/notes', updateCandidateNotes);

// Remover candidato de guardados
router.delete('/:candidateId', removeSavedCandidate);

module.exports = router;
