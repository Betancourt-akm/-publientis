/**
 * Determina la URL base del backend dinámicamente.
 *
 * - En desarrollo (localhost): usa http://localhost:8070
 * - En producción: usa el mismo origen del navegador (nginx hace proxy de /api/).
 * - Si REACT_APP_BACKEND_URL está definida, la usa directamente.
 */
const getBackendUrl = () => {
  // Si la variable de entorno está definida y no es localhost en producción, usarla
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl && envUrl !== 'http://localhost:8070') {
    return envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }

  // Detección automática por entorno del navegador
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isDevelopment) {
    return 'http://localhost:8070';
  }

  // En producción, usar el mismo origen (nginx hace proxy de /api/)
  return window.location.origin;
};

export default getBackendUrl;
