import React from 'react';
import useAuthRequired from '../hooks/useAuthRequired';
import AuthRequiredModal from './AuthRequiredModal';

/**
 * Componente HOC que proporciona funcionalidad de autenticación requerida
 * Usa este componente para envolver secciones que necesitan autenticación
 * 
 * @example
 * const MyComponent = () => {
 *   return (
 *     <WithAuthRequired>
 *       {({ requireAuth }) => (
 *         <button onClick={() => {
 *           if (!requireAuth('carrito')) return;
 *           // Tu lógica aquí
 *         }}>
 *           Agregar al Carrito
 *         </button>
 *       )}
 *     </WithAuthRequired>
 *   );
 * };
 */
const WithAuthRequired = ({ children }) => {
  const { requireAuth, isAuthModalOpen, currentAction, closeModal, isAuthenticated } = useAuthRequired();

  return (
    <>
      {typeof children === 'function' 
        ? children({ requireAuth, isAuthenticated })
        : children
      }
      
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        action={currentAction}
      />
    </>
  );
};

export default WithAuthRequired;
