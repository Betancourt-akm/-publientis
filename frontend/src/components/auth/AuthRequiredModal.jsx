import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiX } from 'react-icons/fi';

const AuthRequiredModal = ({ isOpen, onClose, action = 'esta acción' }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleSignUp = () => {
    onClose();
    navigate('/sign-up');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiLock className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Autenticación Requerida
                </h3>
                <p className="text-sm text-gray-500">
                  Necesitas una cuenta
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Para realizar {action}, debes iniciar sesión o crear una cuenta.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={handleSignUp}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
