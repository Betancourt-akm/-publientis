import React, { useEffect, useContext, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Context } from '../../context';

/**
 * Página de éxito OAuth optimizada para plataforma de profesores.
 * - Solo obtiene datos de usuario (sin carrito)
 * - Flujo simplificado y rápido
 * - Mejor UX con menos pasos
 */
const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUserDetails } = useContext(Context);
  const [status, setStatus] = useState('Procesando autenticación...');
  const [error, setError] = useState(null);
  
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (!hasProcessed.current) {
        hasProcessed.current = true;

        try {
          setStatus('Verificando autenticación...');
          
          console.log('✅ OAuth Success - Cookie JWT establecida por el backend');
          console.log('✅ URL actual:', window.location.href);
          
          // Ya no necesitamos el token de la URL, está en la cookie httpOnly
          setStatus('Obteniendo perfil de usuario...');
          await fetchUserDetails();
          
          setStatus('¡Bienvenido! Accediendo a la plataforma...');
          toast.success('¡Inicio de sesión exitoso!');
          
          // Navegación más rápida para mejor UX
          setTimeout(() => {
            navigate('/');
          }, 800);

        } catch (error) {
          console.error('Error durante el proceso de OAuth:', error);
          setError(error.message || 'Error desconocido');
          setStatus('Error en la autenticación');
          
          toast.error(`Error: ${error.message || 'No se pudo completar la autenticación'}`);
          
          // Redirigir después de mostrar el error
          setTimeout(() => {
            navigate('/login?error=oauth_failed');
          }, 3000);
        }
      }
    };

    handleAuth();
  // El 'ref' no se incluye en el array de dependencias porque no queremos que el efecto se dispare cuando cambie.
  }, [location, navigate, fetchUserDetails]);

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
      <div className='text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4'>
        <div className='mb-4'>
          {error ? (
            <div className='text-red-500 text-6xl mb-4'>❌</div>
          ) : (
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          )}
        </div>
        
        <h2 className={`text-xl font-semibold mb-2 ${
          error ? 'text-red-600' : 'text-gray-800'
        }`}>
          {error ? 'Error de Autenticación' : 'Autenticando...'}
        </h2>
        
        <p className={`text-sm ${
          error ? 'text-red-500' : 'text-gray-600'
        }`}>
          {status}
        </p>
        
        {error && (
          <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700'>
            <strong>Detalles del error:</strong><br />
            {error}
          </div>
        )}
        
        {error && (
          <p className='text-xs text-gray-500 mt-4'>
            Serás redirigido al login en unos segundos...
          </p>
        )}
      </div>
    </div>
  );
};

export default OAuthSuccess;