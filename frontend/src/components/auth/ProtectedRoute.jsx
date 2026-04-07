import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUserDetails } from '../../store/userSlice';
import SummaryApi from '../../common';

/**
 * Componente para proteger rutas que requieren autenticación
 * Verifica si el usuario está logueado antes de mostrar el contenido
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const [loading, setLoading] = React.useState(!user);

  const hasRequiredRole = (currentUser) => {
    if (!allowedRoles.length) return true;
    return allowedRoles.includes(currentUser?.role);
  };

  useEffect(() => {
    const verifyAuth = async () => {
      // Si ya tenemos el usuario en Redux, no hacer nada
      if (user) {
        if (!hasRequiredRole(user)) {
          navigate('/', { replace: true });
          return;
        }
        setLoading(false);
        return;
      }

      try {
        // Intentar obtener datos del usuario del backend
        const response = await fetch(SummaryApi.userDetails.url, {
          method: SummaryApi.userDetails.method,
          credentials: 'include',
        });

        const data = await response.json();

        if (data.success && data.data) {
          if (!hasRequiredRole(data.data)) {
            navigate('/', { replace: true });
            return;
          }
          // Usuario autenticado, guardar en Redux
          dispatch(setUserDetails(data.data));
          setLoading(false);
        } else {
          // No autenticado, redirigir a login silenciosamente
          // ✅ No mostrar toast molesto, la redirección es suficiente
          console.log('ℹ️ Usuario no autenticado, redirigiendo a login');
          navigate('/login', { 
            state: { from: window.location.pathname },
            replace: true 
          });
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        // ✅ No mostrar toast molesto en errores de autenticación
        console.log('ℹ️ Error de autenticación, redirigiendo a login');
        navigate('/login', { 
          state: { from: window.location.pathname },
          replace: true 
        });
      }
    };

    verifyAuth();
  }, [user, dispatch, navigate]);

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Verificando autenticación...</p>
      </div>
    );
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>;
};

export default ProtectedRoute;
