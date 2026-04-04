const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // Eliminar las opciones deprecadas
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Terminar el proceso si la conexión falla
  }
}

mongoose.connection.on('error', err => {
  console.error(`Error de conexión con MongoDB: ${err.message}`);
  process.exit(1);
});

module.exports = connectDB;

