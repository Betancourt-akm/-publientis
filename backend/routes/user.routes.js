const express = require('express');
const router = express.Router();

const authToken = require('../middleware/authToken');
const userDetails = require('../controller/user/userDetails');
const allUsers = require('../controller/user/allUsers');
const updateUser = require('../controller/user/updateUser');
const setPassword = require('../controller/user/setPassword');
const updateProfilePicture = require('../controller/user/updateProfilePicture');
const testUpload = require('../controller/user/testUpload');
const { upload } = require('../controller/upload/uploadController');

// Rutas de Usuario (protegidas)
router.get('/user-details', authToken, userDetails);
router.get('/all-user', authToken, allUsers); // Corregido de /all-users para coincidir con el frontend
router.post('/update-user', authToken, updateUser);
router.post('/set-password', authToken, setPassword);

// Ruta de PRUEBA para diagnosticar upload
router.post('/test-upload', authToken, upload.single('profilePic'), testUpload);

// Ruta para actualizar foto de perfil
router.post('/update-profile-picture', authToken, upload.single('profilePic'), updateProfilePicture);

module.exports = router;
