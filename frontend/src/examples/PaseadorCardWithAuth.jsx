/**
 * EJEMPLO DE USO: Card de Paseador con Sistema de Autenticación Profesional
 * 
 * Este es un ejemplo de cómo integrar el sistema de autenticación requerida
 * en un componente real como una tarjeta de paseador.
 * 
 * Reemplaza los toasts genéricos por modales profesionales.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiMapPin, FiStar, FiClock, FiEye, FiMessageCircle } from 'react-icons/fi';
import { FaDog } from 'react-icons/fa';
import useAuthRequired from '../hooks/useAuthRequired';
import AuthRequiredModal from '../components/AuthRequiredModal';

const PaseadorCardWithAuth = ({ walker }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { requireAuth, isAuthModalOpen, currentAction, closeModal } = useAuthRequired();

  // ✅ EJEMPLO 1: Agregar a Favoritos
  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Evitar que el click se propague al card
    
    // Verificar autenticación con mensaje personalizado
    if (!requireAuth('favoritos')) return;
    
    // Usuario autenticado - ejecutar lógica
    try {
      setIsFavorite(!isFavorite);
      console.log('Toggling favorite for walker:', walker.id);
      // TODO: Llamar a tu API aquí
      // await fetch('/api/favorites', { method: 'POST', body: JSON.stringify({ walkerId: walker.id }) });
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  // ✅ EJEMPLO 2: Reservar Servicio
  const handleReserve = (e) => {
    e.stopPropagation();
    
    // Verificar autenticación con mensaje personalizado
    if (!requireAuth('reserva')) return;
    
    // Usuario autenticado - ir a página de reserva
    navigate(`/reservar/${walker.id}`);
  };

  // ✅ EJEMPLO 3: Chat con Paseador
  const handleChat = (e) => {
    e.stopPropagation();
    
    // Podrías crear un tipo de acción personalizado
    if (!requireAuth('chat')) return;
    
    // Abrir chat
    console.log('Abriendo chat con:', walker.name);
  };

  // ✅ EJEMPLO 4: Ver Perfil (No requiere auth)
  const handleViewProfile = () => {
    navigate(`/paseadores/${walker.id}`);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header con imagen */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
          <img
            src={walker.photo}
            alt={walker.name}
            className="w-full h-full object-cover"
          />
          
          {/* Botón de favorito flotante */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Nombre y rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800">{walker.name}</h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
              <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold text-gray-700">{walker.rating}</span>
            </div>
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <FiMapPin className="w-4 h-4" />
            <span>{walker.zone}</span>
          </div>

          {/* Experiencia y precio */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiClock className="w-4 h-4" />
              <span>{walker.experience}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Desde</p>
              <p className="text-lg font-bold text-blue-600">
                ${walker.basePrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Servicios */}
          <div className="flex flex-wrap gap-2 mb-4">
            {walker.services.slice(0, 3).map((service, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                {service}
              </span>
            ))}
            {walker.services.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{walker.services.length - 3}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FaDog className="w-4 h-4" />
              <span>{walker.completedWalks} paseos</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-2">
            {/* Ver perfil - No requiere auth */}
            <button
              onClick={handleViewProfile}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <FiEye className="w-4 h-4" />
              <span className="text-sm font-medium">Ver perfil</span>
            </button>

            {/* Reservar - Requiere auth */}
            <button
              onClick={handleReserve}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">Reservar</span>
            </button>
          </div>

          {/* Botón de chat - Requiere auth */}
          <button
            onClick={handleChat}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg transition-colors"
          >
            <FiMessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Contactar</span>
          </button>
        </div>
      </div>

      {/* Modal de autenticación - Se muestra automáticamente cuando sea necesario */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        action={currentAction}
      />
    </>
  );
};

export default PaseadorCardWithAuth;
