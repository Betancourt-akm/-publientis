import { useEffect, useCallback, useContext } from 'react';
import { Context } from '../../context';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * Componente para gestionar la sesión del usuario
 * - Detecta actividad del usuario
 * - Muestra advertencia antes de que expire la sesión
 * - Redirige al login cuando la sesión expira
 */
const SessionManager = () => {
  const { user, logout } = useContext(Context);
  const navigate = useNavigate();

  // Tiempo de inactividad antes de advertir (minutos)
  const WARNING_TIME = 25; // Advertir 25 minutos después de la última actividad
  const SESSION_TIMEOUT = 30; // Cerrar sesión a los 30 minutos de inactividad

  const handleUserActivity = useCallback(() => {
    if (!user) return;

    // Guardar timestamp de última actividad
    localStorage.setItem('lastActivity', Date.now().toString());
  }, [user]);

  const checkInactivity = useCallback(() => {
    if (!user) return;

    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) {
      localStorage.setItem('lastActivity', Date.now().toString());
      return;
    }

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    const minutesInactive = Math.floor(timeSinceLastActivity / 60000);

    // Advertir al usuario
    if (minutesInactive >= WARNING_TIME && minutesInactive < SESSION_TIMEOUT) {
      const remainingMinutes = SESSION_TIMEOUT - minutesInactive;
      
      toast.warning(
        `⚠️ Tu sesión expirará en ${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''} por inactividad. Haz clic en cualquier lugar para mantenerla activa.`,
        {
          toastId: 'session-warning',
          autoClose: false,
          closeOnClick: true,
          onClick: handleUserActivity
        }
      );
    }

    // Cerrar sesión automáticamente
    if (minutesInactive >= SESSION_TIMEOUT) {
      toast.dismiss('session-warning');
      toast.info('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.', {
        autoClose: 5000
      });
      
      logout();
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  }, [user, logout, navigate, handleUserActivity]);

  useEffect(() => {
    if (!user) return;

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Verificar inactividad cada minuto
    const inactivityInterval = setInterval(checkInactivity, 60000);

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(inactivityInterval);
    };
  }, [user, handleUserActivity, checkInactivity]);

  return null; // Este componente no renderiza nada
};

export default SessionManager;
