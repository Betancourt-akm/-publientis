const express = require('express');
const router = express.Router();

// Importar rutas de los módulos académicos
const profileRoutes = require('./profile.routes');
const publicationRoutes = require('./publication.routes');

// Montar rutas con sus prefijos
router.use('/profile', profileRoutes);
router.use('/publications', publicationRoutes);

module.exports = router;
