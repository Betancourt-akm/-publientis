/**
 * 🎨 PÁGINA DE DEMOSTRACIÓN
 * 
 * Muestra cómo funciona el nuevo sistema de autenticación requerida
 * con modales profesionales en lugar de toasts.
 * 
 * ACCESO: /demo-auth
 */

import React, { useContext } from 'react';
import { FiShoppingCart, FiHeart, FiUser, FiCalendar, FiMessageCircle, FiLock } from 'react-icons/fi';
import useAuthRequired from '../../hooks/useAuthRequired';
import AuthRequiredModal from '../../components/auth/AuthRequiredModal';
import { Context } from '../../context';

const AuthModalDemo = () => {
  const { user } = useContext(Context);
  const { requireAuth, isAuthModalOpen, currentAction, closeModal, isAuthenticated } = useAuthRequired();

  // Simulación de acciones que requieren autenticación
  const handleCarrito = () => {
    if (!requireAuth('carrito')) return;
    alert('✅ Usuario autenticado - Agregando al carrito...');
  };

  const handleFavoritos = () => {
    if (!requireAuth('favoritos')) return;
    alert('✅ Usuario autenticado - Agregando a favoritos...');
  };

  const handlePerfil = () => {
    if (!requireAuth('perfil')) return;
    alert('✅ Usuario autenticado - Abriendo perfil...');
  };

  const handleReserva = () => {
    if (!requireAuth('reserva')) return;
    alert('✅ Usuario autenticado - Creando reserva...');
  };

  const handleChat = () => {
    if (!requireAuth('continuar')) return;
    alert('✅ Usuario autenticado - Abriendo chat...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-blue-600 rounded-full mb-4">
            <FiLock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sistema de Autenticación Profesional
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demostración del nuevo sistema que reemplaza los toasts genéricos 
            por modales elegantes y profesionales.
          </p>
        </div>

        {/* Estado actual */}
        <div className={`mb-8 p-6 rounded-xl ${
          isAuthenticated 
            ? 'bg-green-50 border-2 border-green-200' 
            : 'bg-yellow-50 border-2 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {isAuthenticated ? '✅ Usuario Autenticado' : '⚠️ Sin Sesión Activa'}
              </h3>
              <p className="text-sm text-gray-600">
                {isAuthenticated 
                  ? `Bienvenido, ${user?.name || 'Usuario'}! Puedes realizar todas las acciones.`
                  : 'Intenta hacer clic en cualquier botón para ver el modal de autenticación.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Grid de acciones */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Carrito */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Agregar al Carrito</h3>
                <p className="text-sm text-gray-500">Acción: 'carrito'</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Modal personalizado para agregar productos al carrito.
            </p>
            <button
              onClick={handleCarrito}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Agregar Producto
            </button>
          </div>

          {/* Card 2: Favoritos */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <FiHeart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Guardar Favorito</h3>
                <p className="text-sm text-gray-500">Acción: 'favoritos'</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Modal personalizado para guardar paseadores favoritos.
            </p>
            <button
              onClick={handleFavoritos}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              ❤️ Agregar a Favoritos
            </button>
          </div>

          {/* Card 3: Perfil */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiUser className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Ver Perfil</h3>
                <p className="text-sm text-gray-500">Acción: 'perfil'</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Modal personalizado para acceder al perfil de usuario.
            </p>
            <button
              onClick={handlePerfil}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Acceder al Perfil
            </button>
          </div>

          {/* Card 4: Reserva */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FiCalendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Hacer Reserva</h3>
                <p className="text-sm text-gray-500">Acción: 'reserva'</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Modal personalizado para reservar servicios de paseadores.
            </p>
            <button
              onClick={handleReserva}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              📅 Reservar Ahora
            </button>
          </div>
        </div>

        {/* Comparación */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🆚 Comparación: Toast vs Modal
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Toast Antiguo */}
            <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
              <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                ❌ Toast Genérico (Antes)
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Desaparece en 3 segundos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Mensaje genérico sin contexto</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Usuario confundido sobre qué hacer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Baja conversión a registro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Apariencia poco profesional</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-red-100 rounded text-xs text-gray-700 font-mono">
                toast.error('Debes iniciar sesión');
              </div>
            </div>

            {/* Modal Nuevo */}
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                ✅ Modal Profesional (Ahora)
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Permanece hasta que el usuario decida</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Mensaje personalizado por acción</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>CTAs claros (Login/Registro)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Alta conversión a registro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Diseño moderno y atractivo</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-green-100 rounded text-xs text-gray-700 font-mono">
                if (!requireAuth('carrito')) return;
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            💡 <strong>Tip:</strong> Si no estás logueado, haz clic en cualquier botón 
            para ver el modal en acción.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>📄 Ver documentación: <code>AUTH_REQUIRED_USAGE.md</code></span>
            <span>|</span>
            <span>📝 Ver guía: <code>MIGRATION_GUIDE.md</code></span>
          </div>
        </div>
      </div>

      {/* Modal de autenticación */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        action={currentAction}
      />
    </div>
  );
};

export default AuthModalDemo;
