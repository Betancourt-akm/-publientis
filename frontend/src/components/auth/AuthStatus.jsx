import React from 'react';
import { useSelector } from 'react-redux';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

/**
 * Componente simple para mostrar el estado de autenticación
 * Útil para debugging - muestra si el usuario está logueado
 */
const AuthStatus = () => {
  const user = useSelector(state => state.user.user);

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 rounded-lg shadow-lg p-3 z-50 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        {user ? (
          <>
            <FaCheckCircle className="text-green-500 text-xl" />
            <span className="font-semibold text-green-700">Autenticado</span>
          </>
        ) : (
          <>
            <FaTimesCircle className="text-red-500 text-xl" />
            <span className="font-semibold text-red-700">No Autenticado</span>
          </>
        )}
      </div>
      
      {user && (
        <div className="text-sm text-gray-600">
          <p><strong>Usuario:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role}</p>
        </div>
      )}
      
      {!user && (
        <p className="text-sm text-gray-600">
          No hay usuario en el estado de Redux
        </p>
      )}
    </div>
  );
};

export default AuthStatus;
