const express = require('express');
const router = express.Router();
const { createMatch, getMatchesByStatus, acceptMatch, rejectMatch, completeMatch } = require('../controller/logic/matchController');
const authToken = require('../middleware/authToken');

// Crear un nuevo emparejamiento
router.post('/create', authToken, createMatch);

// Obtener emparejamientos por estado
router.get('/:status?', authToken, getMatchesByStatus);

// Aceptar un emparejamiento
router.put('/accept/:matchId', authToken, acceptMatch);

// Rechazar un emparejamiento
router.put('/reject/:matchId', authToken, rejectMatch);

// Completar un emparejamiento
router.put('/complete/:matchId', authToken, completeMatch);

module.exports = router;
