const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadMultipleImages, deleteImage } = require('../controller/upload/uploadController');
const authToken = require('../middleware/authToken');

// Rutas para subida de imágenes
router.post('/image', authToken, upload.single('image'), uploadImage);
router.post('/images', authToken, upload.array('images', 10), uploadMultipleImages);
router.delete('/image', authToken, deleteImage);

module.exports = router;
