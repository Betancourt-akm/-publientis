// routes/form.routes.js
const express = require('express');
const router = express.Router();

// Importar controlador
const { formController } = require('../controller/email/formController');

// POST /api/forma
router.post('/', formController);

module.exports = router;
