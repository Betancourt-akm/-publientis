// Health Check Controller para verificar el estado del servidor

const healthCheck = (req, res) => {
  try {
    const healthData = {
      success: true,
      message: "Servidor Sako Pets funcionando correctamente",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 8070,
      services: {
        database: "Connected", // TODO: Verificar conexión real
        paypal: process.env.PAYPAL_CLIENT_ID ? "Configured" : "Not configured",
        security: "Active"
      },
      version: "1.0.0"
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en health check",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

const serverInfo = (req, res) => {
  try {
    const info = {
      success: true,
      message: "Información del servidor Sako Pets",
      server: {
        name: "Sako Pets Backend",
        description: "API para plataforma de cuidado de mascotas",
        version: "1.0.0",
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 8070,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      features: {
        authentication: "JWT + OAuth",
        security: "Rate limiting, CORS, Helmet, Input validation",
        database: "MongoDB",
        payments: "PayPal",
        logging: "Simple Logger"
      },
      endpoints: {
        auth: "/api/auth/*",
        users: "/api/users/*",
        walkers: "/api/walkers/*",
        bookings: "/api/bookings/*",
        health: "/api/health"
      }
    };

    res.status(200).json(info);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo información del servidor",
      error: error.message
    });
  }
};

module.exports = {
  healthCheck,
  serverInfo
};
