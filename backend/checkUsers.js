const mongoose = require('mongoose');
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
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// Función principal
const checkUsers = async () => {
  try {
    await connectDB();

    console.log('\n🔍 Buscando usuarios de prueba...\n');

    // Buscar usuarios de prueba
    const testUsers = await User.find({ 
      email: { $in: ['estudiante@test.com', 'profesor@test.com'] } 
    });

    if (testUsers.length === 0) {
      console.log('❌ No se encontraron usuarios de prueba en la base de datos');
      console.log('   Los usuarios no fueron creados correctamente');
    } else {
      console.log(`✅ Encontrados ${testUsers.length} usuario(s):\n`);
      
      testUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Contraseña (hash): ${user.password ? 'SÍ' : 'NO'}`);
        console.log(`   Hash length: ${user.password ? user.password.length : 0}`);
        console.log(`   Teléfono: ${user.tel || 'No definido'}`);
        console.log(`   Creado: ${user.createdAt || 'No definido'}\n`);
      });
    }

    // Contar todos los usuarios
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total de usuarios en la base de datos: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar
checkUsers();
