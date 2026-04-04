import { useState, useContext } from 'react';
import Context from '../context';

/**
 * Hook personalizado para verificar autenticación antes de ejecutar acciones
 * Muestra un modal elegante en lugar de toasts si el usuario no está autenticado
 * 
 * @returns {Object} { requireAuth, AuthModal, isAuthModalOpen }
 * 
 * @example
 * const { requireAuth, AuthModal } = useAuthRequired();
 * 
 * const handleAddToCart = () => {
 *   if (!requireAuth('carrito')) return;
 *   // Tu lógica aquí
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleAddToCart}>Agregar</button>
 *     {AuthModal}
 *   </>
 * );
 */
const useAuthRequired = () => {
  const { user } = useContext(Context);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState('continuar');

  /**
   * Verifica si el usuario está autenticado
   * Si no lo está, muestra el modal de autenticación
   * 
   * @param {string} action - Tipo de acción: 'carrito', 'favoritos', 'perfil', 'reserva'
   * @returns {boolean} - true si está autenticado, false si no
   */
  const requireAuth = (action = 'continuar') => {
    if (!user?._id) {
      setCurrentAction(action);
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  const closeModal = () => {
    setIsAuthModalOpen(false);
  };

  return {
    requireAuth,
    isAuthModalOpen,
    currentAction,
    closeModal,
    isAuthenticated: !!user?._id
  };
};

export default useAuthRequired;
