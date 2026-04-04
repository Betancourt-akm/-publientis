import React from 'react';
import { useSelector } from 'react-redux';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * Badge simple para mostrar estado de autenticación en el header
 * Muestra el nombre del usuario si está logueado
 */
const UserAuthBadge = () => {
  const user = useSelector(state => state.user.user);

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FaUser />
        <span>Iniciar Sesión</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Indicador Visual - Usuario Logueado */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-green-700 font-medium">
          {user.name || user.email}
        </span>
      </div>

      {/* Foto de perfil */}
      {user.profilePic && (
        <img
          src={user.profilePic}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      )}
    </div>
  );
};

export default UserAuthBadge;
