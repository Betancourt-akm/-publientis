import axios from 'axios';

// Creamos una instancia de Axios con la URL base del backend
const rawBaseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8070';
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
const axiosInstance = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true, // ✅ CRÍTICO: Envía cookies automáticamente
});

// ✅ YA NO NECESITAMOS INTERCEPTOR PARA TOKEN
// El token está en una cookie httpOnly que el navegador envía automáticamente
// withCredentials: true hace que todas las peticiones incluyan las cookies

console.log('✅ AxiosInstance configurado con cookies httpOnly');


// ✅ Interceptor de respuestas para manejar errores de autenticación globalmente
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios Error:', error.response || error);
    
    // Manejar errores de token expirado o inválido
    if (error.response) {
      const { status, data } = error.response;
      
      // 401: No autenticado o token expirado
      // 403: Token inválido o sin permisos
      if (status === 401 || status === 403) {
        // ⚠️ NO procesar si estamos en proceso de logout
        const isLoggingOut = sessionStorage.getItem('loggingOut');
        if (isLoggingOut) {
          console.log('🚫 Ya estamos cerrando sesión, ignorar error 401/403');
          return Promise.reject(error);
        }
        
        // ✅ CAMBIO: No mostrar toast molesto, es normal no estar autenticado
        // Los componentes individuales manejarán la autenticación con el modal elegante
        console.log('ℹ️ Error 401/403 - Usuario no autenticado (normal si no ha iniciado sesión)');
        
        // Solo redirigir si es un 403 (prohibido) y estamos intentando acceder a algo
        // NO redirigir en 401 porque es normal que requests fallen si no estás logueado
        if (status === 403 && !window.location.pathname.includes('/login')) {
          // Guardar la URL actual para redirigir después del login
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== '/' && currentPath !== '/login') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
