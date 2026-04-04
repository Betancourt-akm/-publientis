const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
require('dotenv').config();

async function createAdminUser() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existe un admin
        const existingAdmin = await userModel.findOne({ 
            email: 'admin@freshface.com',
            role: 'ADMIN' 
        });

        if (existingAdmin) {
            console.log('⚠️ Ya existe un usuario admin con este email');
            console.log('Email:', existingAdmin.email);
            console.log('Nombre:', existingAdmin.name);
            console.log('Rol:', existingAdmin.role);
            process.exit(0);
        }

        // Crear hash de la contraseña
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync('admin123', salt);

        // Crear usuario admin
        const adminUser = new userModel({
            name: 'Administrador',
            email: 'admin@freshface.com',
            password: hashPassword,
            role: 'ADMIN',
            isVerified: true, // Admin ya verificado
            tel: '+57 300 123 4567'
        });

        await adminUser.save();

        console.log('🎉 Usuario administrador creado exitosamente!');
        console.log('📧 Email: admin@freshface.com');
        console.log('🔑 Contraseña: admin123');
        console.log('👤 Rol: ADMIN');
        console.log('');
        console.log('Ahora puedes iniciar sesión con estas credenciales en el frontend.');

    } catch (error) {
        console.error('❌ Error al crear usuario admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

createAdminUser();
