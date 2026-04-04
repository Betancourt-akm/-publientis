const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/test/create-walker
 * Crear un usuario de prueba con rol WALKER
 */
router.post('/create-walker', async (req, res) => {
  try {
    // Verificar si ya existe un usuario de prueba
    const existingUser = await User.findOne({ email: 'walker.test@sakopets.com' });
    
    if (existingUser) {
      // Si ya existe, generar token y devolver datos
      const token = jwt.sign(
        { id: existingUser._id, email: existingUser.email, role: existingUser.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Usuario de prueba ya existe',
        data: {
          user: {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            profilePic: existingUser.profilePic
          },
          token
        }
      });
    }

    // Crear nuevo usuario de prueba
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const testUser = new User({
      name: 'Walker de Prueba',
      email: 'walker.test@sakopets.com',
      password: hashedPassword,
      role: 'WALKER',
      profilePic: '',
      metadata: {
        profileStatus: 'PENDING',
        isPublished: false,
        fullName: 'Walker de Prueba',
        phone: '3001234567',
        city: 'Medellín',
        neighborhood: 'El Poblado'
      }
    });

    await testUser.save();

    // Generar token
    const token = jwt.sign(
      { id: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Usuario de prueba WALKER creado exitosamente',
      data: {
        user: {
          _id: testUser._id,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
          profilePic: testUser.profilePic
        },
        token
      }
    });

  } catch (error) {
    console.error('Error creando usuario de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
