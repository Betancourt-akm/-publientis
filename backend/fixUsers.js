const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Definir el schema de usuario
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  tel: String,
  profilePic: String,
  provider: String,
  isVerified: Boolean,
  failedLoginAttempts: Number,
  lockUntil: Date,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// Función principal
const fixUsers = async () => {
  try {
    await connectDB();

    console.log('\n🔧 Arreglando usuarios de prueba...\n');

    // Verificar estado actual
    const currentUsers = await User.find({ 
      email: { $in: ['estudiante@test.com', 'profesor@test.com'] } 
    });

    console.log('📋 Estado ANTES de la corrección:\n');
    currentUsers.forEach(user => {
      console.log(`${user.name}:`);
      console.log(`   Provider: ${user.provider || 'NO DEFINIDO ❌'}`);
      console.log(`   isVerified: ${user.isVerified !== undefined ? user.isVerified : 'NO DEFINIDO ❌'}`);
      console.log(`   failedLoginAttempts: ${user.failedLoginAttempts || 0}\n`);
    });

    // Actualizar usuarios con los campos necesarios
    const updateResult = await User.updateMany(
      { email: { $in: ['estudiante@test.com', 'profesor@test.com'] } },
      { 
        $set: {
          provider: 'local',
          isVerified: true,
          failedLoginAttempts: 0,
          lockUntil: null
        }
      }
    );

    console.log(`✅ Usuarios actualizados: ${updateResult.modifiedCount}\n`);

    // Verificar estado después
    const updatedUsers = await User.find({ 
      email: { $in: ['estudiante@test.com', 'profesor@test.com'] } 
    });

    console.log('📋 Estado DESPUÉS de la corrección:\n');
    updatedUsers.forEach(user => {
      console.log(`${user.name}:`);
      console.log(`   Provider: ${user.provider} ✅`);
      console.log(`   isVerified: ${user.isVerified} ✅`);
      console.log(`   failedLoginAttempts: ${user.failedLoginAttempts}\n`);
    });

    console.log('✅ USUARIOS LISTOS PARA USAR:\n');
    console.log('📧 estudiante@test.com');
    console.log('🔑 Test123!\n');
    console.log('📧 profesor@test.com');
    console.log('🔑 Test123!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar
fixUsers();
