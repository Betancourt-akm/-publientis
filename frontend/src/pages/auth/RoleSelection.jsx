import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaHeart, FaPaw, FaGoogle, FaFacebook } from 'react-icons/fa';
import getBackendUrl from '../../utils/getBackendUrl';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const provider = searchParams.get('provider'); // 'google' o 'facebook'

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      alert('Por favor selecciona un rol');
      return;
    }

    // Redirigimos a la autenticación OAuth con el proveedor y rol seleccionados
    const backendUrl = getBackendUrl();
    const authUrl = `${backendUrl}/api/auth/${provider}?role=${selectedRole}`;
    
    window.location.href = authUrl;
  };

  const handleGoBack = () => {
    navigate('/login');
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {provider === 'google' ? (
              <FaGoogle className="text-4xl text-red-500" />
            ) : (
              <FaFacebook className="text-4xl text-blue-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Selecciona tu rol
          </h2>
          <p className="text-gray-600">
            ¿Cómo te gustaría usar MachTAI?
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Opción Dueño de Mascota */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedRole === 'OWNER'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleRoleSelection('OWNER')}
          >
            <div className="flex items-center">
              <FaHeart className="text-2xl text-blue-500 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-800">Dueño de Mascota</h3>
                <p className="text-sm text-gray-600">
                  Busco paseadores profesionales para mi mascota
                </p>
              </div>
              <div className="ml-auto">
                <div
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedRole === 'OWNER'
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedRole === 'OWNER' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Opción Paseador Profesional */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedRole === 'WALKER'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleRoleSelection('WALKER')}
          >
            <div className="flex items-center">
              <FaPaw className="text-2xl text-green-500 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-800">Paseador Profesional</h3>
                <p className="text-sm text-gray-600">
                  Quiero ofrecer servicios de cuidado de mascotas
                </p>
              </div>
              <div className="ml-auto">
                <div
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedRole === 'WALKER'
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedRole === 'WALKER' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGoBack}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${
              selectedRole
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;
