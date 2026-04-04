const express = require('express');
const walkerDashboardRoutes = require('./routes/walkerDashboard.routes');

const app = express();
const PORT = 3001;

// Middleware básico
app.use(express.json());

// Registrar las rutas del walker dashboard
console.log('🧪 Registrando rutas de walker dashboard para prueba...');
app.use('/api/walker', walkerDashboardRoutes);

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Test server working!' });
});

// Listar todas las rutas registradas
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`📍 Ruta registrada: ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    console.log(`📁 Router registrado en: ${middleware.regexp}`);
    if (middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(`  📍 Sub-ruta: ${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🧪 Servidor de prueba corriendo en puerto ${PORT}`);
  console.log(`🔗 Prueba: http://localhost:${PORT}/test`);
  console.log(`🔗 Walker profile: http://localhost:${PORT}/api/walker/test`);
});
