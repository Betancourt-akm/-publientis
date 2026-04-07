const express = require('express');
const router = express.Router();
const portfolioController = require('../controller/portfolioController');
const { protect } = require('../middleware/auth');

// Obtener mi portafolio
router.get('/my-portfolio', protect, portfolioController.getMyPortfolio);

// Subir documento al portafolio
router.post('/upload', protect, portfolioController.uploadDocument);

// Eliminar documento del portafolio
router.delete('/document', protect, portfolioController.deleteDocument);

// Obtener portafolio de otro usuario (para organizaciones que revisan candidatos)
router.get('/user/:userId', protect, portfolioController.getUserPortfolio);

module.exports = router;
