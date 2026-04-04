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
});

const User = mongoose.model('User', userSchema);

// Función principal
const testLogin = async () => {
  try {
    await connectDB();

    console.log('\n🔐 Probando autenticación...\n');

    const email = 'estudiante@test.com';
    const passwordToTest = 'Test123!';

    // Buscar usuario
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario encontrado: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Hash almacenado: ${user.password.substring(0, 20)}...`);

    // Probar contraseña
    const isMatch = await bcrypt.compare(passwordToTest, user.password);

    console.log(`\n🔑 Contraseña: "${passwordToTest}"`);
    console.log(`✅ Resultado: ${isMatch ? 'CORRECTA ✓' : 'INCORRECTA ✗'}`);

    if (isMatch) {
      console.log('\n✅ El login debería funcionar con estas credenciales');
    } else {
      console.log('\n❌ La contraseña NO coincide. Recreando usuario...');
      
      // Recrear usuario con contraseña correcta
      const newHash = await bcrypt.hash(passwordToTest, 10);
      await User.updateOne(
        { email },
        { password: newHash }
      );
      
      console.log('✅ Contraseña actualizada correctamente');
      console.log('   Intenta iniciar sesión nuevamente');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar
testLogin();
