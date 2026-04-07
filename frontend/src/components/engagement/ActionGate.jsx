import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EngagementModal from './EngagementModal';

/**
 * ActionGate - Higher Order Component para Progressive Engagement
 * 
 * Intercepta acciones críticas y muestra un modal de conversión si el usuario
 * no está autenticado, implementando el principio de Progressive Engagement
 * de Unger & Chandler.
 * 
 * Uso:
 * <ActionGate
 *   action="view_profile"
 *   onProceed={() => navigate(`/profile/${id}`)}
 * >
 *   <button>Ver Detalles</button>
 * </ActionGate>
 */

const ActionGate = ({ 
  children, 
  action, 
  onProceed, 
  customMessage,
  disabled = false 
}) => {
  const user = useSelector(state => state?.user?.user);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const isAuthenticated = !!user;

  const handleClick = (e) => {
    // Si está deshabilitado, no hacer nada
    if (disabled) return;

    // Si está autenticado, ejecutar la acción directamente
    if (isAuthenticated) {
      if (onProceed) {
        onProceed(e);
      }
      return;
    }

    // Si NO está autenticado, interceptar y mostrar modal
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleRegister = () => {
    setShowModal(false);
    // Guardar la acción pendiente en localStorage para continuar después del registro
    if (action && onProceed) {
      localStorage.setItem('pendingAction', JSON.stringify({
        action,
        timestamp: Date.now()
      }));
    }
    navigate('/sign-up');
  };

  const handleLogin = () => {
    setShowModal(false);
    if (action && onProceed) {
      localStorage.setItem('pendingAction', JSON.stringify({
        action,
        timestamp: Date.now()
      }));
    }
    navigate('/login');
  };

  const handleClose = () => {
    setShowModal(false);
  };

  // Determinar el tipo de acción para personalizar el mensaje
  const getActionType = () => {
    switch(action) {
      case 'view_profile':
      case 'view_portfolio':
        return 'view';
      case 'apply_job':
      case 'contact':
        return 'apply';
      case 'save_candidate':
        return 'save';
      case 'download_cv':
        return 'download';
      default:
        return 'interact';
    }
  };

  return (
    <>
      {/* Wrappear el children con onClick interceptor */}
      <div 
        onClick={handleClick}
        style={{ display: 'inline-block', cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {children}
      </div>

      {/* Modal de Conversión */}
      {showModal && (
        <EngagementModal
          actionType={getActionType()}
          customMessage={customMessage}
          onRegister={handleRegister}
          onLogin={handleLogin}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default ActionGate;
