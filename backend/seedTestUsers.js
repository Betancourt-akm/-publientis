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

// Definir el schema de usuario (simplificado)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'STUDENT' },
  profilePic: String,
  tel: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Función principal
const seedUsers = async () => {
  try {
    await connectDB();

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Usuarios de prueba
    const testUsers = [
      {
        name: 'Juan Pérez',
        email: 'estudiante@test.com',
        password: hashedPassword,
        role: 'STUDENT',
        tel: '3001234567',
        profilePic: ''
      },
      {
        name: 'Dra. María Profesora',
        email: 'profesor@test.com',
        password: hashedPassword,
        role: 'FACULTY',
        tel: '3009876543',
        profilePic: ''
      }
    ];

    // Eliminar usuarios de prueba existentes
    await User.deleteMany({ email: { $in: ['estudiante@test.com', 'profesor@test.com'] } });
    console.log('🗑️  Usuarios de prueba anteriores eliminados');

    // Insertar nuevos usuarios
    const result = await User.insertMany(testUsers);
    
    console.log('\n✅ Usuarios de prueba creados exitosamente:\n');
    console.log('📚 ESTUDIANTE:');
    console.log('   Email: estudiante@test.com');
    console.log('   Contraseña: Test123!');
    console.log('   Rol: STUDENT\n');
    
    console.log('👨‍🏫 PROFESOR/FACULTAD:');
    console.log('   Email: profesor@test.com');
    console.log('   Contraseña: Test123!');
    console.log('   Rol: FACULTY\n');
    
    console.log(`Total usuarios creados: ${result.length}`);

  } catch (error) {
    console.error('❌ Error creando usuarios:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar
seedUsers();
