

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

// IMPORTACIONES DE SEGURIDAD
const { applyBasicSecurity, applyAdvancedSecurity, strictCorsOptions } = require('./config/security');
const { logger, logError, requestLogger } = require('./utils/simpleLogger');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require("./config/db");
const router = require("./routes/index");
const { getPayPalAccessToken } = require("./config/paypalConfig");
const session = require('express-session');
const passport = require('./config/passport'); // Usamos la configuración que creamos
const globalErrorHandler = require('./controller/error.controller');
const { startAbandonedCartJob } = require('./jobs/abandonedCartJob');
const { startAbandonedCartAdvancedJobs } = require('./jobs/abandonedCartAdvancedJob');
const { initializeChatSocket } = require('./socket/chatSocket');

const app = express();
const server = http.createServer(app);

// Configurar Socket.io con CORS
const io = new Server(server, {
  cors: {
    origin: ['https://clickpublicidad.click', 'http://localhost:5000', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

let ACCEPTANCE_TOKEN = "";

// APLICAR SEGURIDAD BÁSICA (ANTES DE TODO)
console.log(' Aplicando seguridad básica...');
applyBasicSecurity(app);

// Middleware de logs (ahora usando Winston)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan("dev"));
}

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// SANITIZACIÓN DE DATOS
app.use(mongoSanitize()); // Prevenir inyección NoSQL
app.use(xss()); // Limpiar datos de entrada de scripts maliciosos

// CONFIGURACIÓN DE CORS SEGURA
console.log(' Configurando CORS seguro...');
if (process.env.NODE_ENV === 'production') {
  app.use(cors(strictCorsOptions));
} else {
  // En desarrollo, usar configuración más permisiva
  app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5000', 'http://localhost:3000'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  }));
}

// Configuración de Sesión y Passport
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Nombre personalizado para la cookie de sesión
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' para CORS en producción
    maxAge: 1000 * 60 * 60 * 24, // 1 día
    domain: process.env.NODE_ENV === 'production' ? '.clickpublicidad.click' : undefined
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/', (req, res) => {
  res.send(' API viva en Express!');
});

// Rutas de la API
console.log(' Registrando rutas de la API...');
app.use("/api", router);
console.log(' Rutas de la API registradas exitosamente.');

// APLICAR SEGURIDAD AVANZADA (DESPUÉS DE LAS RUTAS)
console.log(' Aplicando seguridad avanzada...');
applyAdvancedSecurity(app);

// Servir frontend en producción
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

// MANEJO SEGURO DE 404
app.all('*', (req, res, next) => {
  const err = new Error(`No se puede encontrar ${req.originalUrl} en este servidor!`);
  err.status = 'fail';
  err.statusCode = 404;
  
  // Log de seguridad para rutas no encontradas
  logger.warn('ROUTE_NOT_FOUND', {
    method: req.method,
    url: req.originalUrl,
    ip: req.clientIP || req.ip,
    userAgent: req.userAgent || req.get('User-Agent')
  });
  
  next(err);
});

// MANEJADOR GLOBAL DE ERRORES CON LOGGING
app.use(globalErrorHandler);

// Puerto y arranque del servidor
console.log(`ENV mode: ${process.env.NODE_ENV || 'development'}`);
const PORT = process.env.PORT || 8070;

// Listener de errores (una sola vez)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(` El puerto ${PORT} ya está en uso`);
  } else {
    console.error(' Error del servidor:', err);
  }
  process.exit(1);
});

async function initializeServer() {
  try {
    console.log(' Conectando a la base de datos...');
    await connectDB();
    console.log(' Conexión a la base de datos exitosa.');

    console.log(' Iniciando cron jobs...');
    startAbandonedCartJob();
    startAbandonedCartAdvancedJobs();
    console.log(' Cron jobs iniciados correctamente.');

    console.log(' Inicializando chat en tiempo real...');
    initializeChatSocket(io);
    console.log(' Chat en tiempo real inicializado.');

    console.log(' Obteniendo token de PayPal...');
    try {
      ACCEPTANCE_TOKEN = await getPayPalAccessToken();
      app.locals.ACCEPTANCE_TOKEN = ACCEPTANCE_TOKEN;
      console.log(' Token de PayPal obtenido.');
    } catch (err) {
      console.warn(' PayPal no disponible:', err.message);
    }

    server.listen(PORT, () => {
      // LOGGING DE INICIO CON INFORMACIÓN DE SEGURIDAD
      logger.info('SERVER_STARTED', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      
      console.log(` Servidor corriendo en el puerto ${PORT}`);
      console.log(" --- Diagnóstico de Seguridad ---");
      console.log(`- JWT_SECRET_KEY: ${process.env.JWT_SECRET_KEY ? ' Cargada' : ' NO CARGADA'}`);
      console.log(`- ENCRYPTION_KEY: ${process.env.ENCRYPTION_KEY ? ' Cargada' : ' NO CARGADA'}`);
      console.log(`- SENSITIVE_DATA_KEY: ${process.env.SENSITIVE_DATA_KEY ? ' Cargada' : ' NO CARGADA'}`);
      console.log(`- FRONTEND_URL: ${process.env.FRONTEND_URL || 'No definida'}`);
      console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? ' Cargada' : ' NO CARGADA'}`);
      console.log(`- PayPal Token: ${ACCEPTANCE_TOKEN ? ' Obtenido' : ' No disponible'}`);
      console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
      console.log(`- LOG_LEVEL: ${process.env.LOG_LEVEL || 'info'}`);
      console.log(" --- Seguridad Aplicada ---");
      console.log(" Rate Limiting activado");
      console.log(" Helmet headers configurados");
      console.log(" CORS seguro aplicado");
      console.log(" Sanitización de datos activa");
      console.log(" Logging de seguridad activo");
      console.log(" Cifrado de datos sensibles listo");
      console.log("-------------------------------------------");
      console.log('  Servidor iniciado correctamente con seguridad completa!');
    });

  } catch (error) {
    console.error(' Error al inicializar el servidor:', error);
    process.exit(1);
  }
}

// Inicializar el servidor
initializeServer();