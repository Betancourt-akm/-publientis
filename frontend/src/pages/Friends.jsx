import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../context';
import axiosInstance from '../utils/axiosInstance';
import { FaUserPlus, FaCheck, FaTimes, FaSearch, FaUserFriends, FaClock } from 'react-icons/fa';

const Friends = () => {
  const { user } = useContext(Context);
  const [activeTab, setActiveTab] = useState('friends'); // friends, facultyMates, requests, search
  const [friends, setFriends] = useState([]);
  const [facultyMates, setFacultyMates] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const response = await axiosInstance.get('/friends/list');
      if (response.data.success) {
        // Separar compañeros de facultad de amigos de otras facultades
        const allFriends = response.data.data;
        const faculty = allFriends.filter(f => f.isFacultyMate);
        const others = allFriends.filter(f => !f.isFacultyMate);
        
        setFacultyMates(faculty);
        setFriends(others);
      }
    } catch (error) {
      console.error('Error obteniendo amigos:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axiosInstance.get('/friends/requests/pending');
      if (response.data.success) {
        setPendingRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error obteniendo solicitudes:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/friends/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      console.error('Error buscando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const response = await axiosInstance.post(`/friends/request/${userId}`);
      if (response.data.success) {
        // Actualizar búsqueda para reflejar el cambio
        handleSearch();
      }
    } catch (error) {
      console.error('Error enviando solicitud:', error);
    }
  };

  const acceptRequest = async (friendshipId) => {
    try {
      const response = await axiosInstance.put(`/friends/requests/${friendshipId}/accept`);
      if (response.data.success) {
        fetchPendingRequests();
        fetchFriends();
      }
    } catch (error) {
      console.error('Error aceptando solicitud:', error);
    }
  };

  const rejectRequest = async (friendshipId) => {
    try {
      const response = await axiosInstance.put(`/friends/requests/${friendshipId}/reject`);
      if (response.data.success) {
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
    }
  };

  const removeFriend = async (friendshipId) => {
    if (!window.confirm('¿Estás seguro de eliminar este amigo?')) return;
    
    try {
      const response = await axiosInstance.delete(`/friends/${friendshipId}`);
      if (response.data.success) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error eliminando amigo:', error);
    }
  };

  const renderFriendButton = (friendUser) => {
    const { friendshipStatus, _id, friendshipId } = friendUser;

    if (friendshipStatus === 'accepted') {
      return (
        <button
          onClick={() => removeFriend(friendshipId)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
        >
          <FaUserFriends className="inline mr-2" />
          Amigos
        </button>
      );
    }

    if (friendshipStatus === 'pending') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
        >
          <FaClock className="inline mr-2" />
          Pendiente
        </button>
      );
    }

    return (
      <button
        onClick={() => sendFriendRequest(_id)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <FaUserPlus className="inline mr-2" />
        Agregar
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-14">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Amigos</h1>
          <p className="text-gray-600">Gestiona tus amistades y conexiones académicas</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('facultyMates')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'facultyMates'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaUserFriends className="inline mr-2" />
              Mi Facultad ({facultyMates.length})
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaUserFriends className="inline mr-2" />
              Otras Facultades ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaClock className="inline mr-2" />
              Solicitudes ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaSearch className="inline mr-2" />
              Buscar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Compañeros de Facultad */}
          {activeTab === 'facultyMates' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Compañeros de mi facultad</h2>
              <p className="text-sm text-gray-500 mb-4">Todos los miembros de tu facultad son automáticamente tus amigos</p>
              {facultyMates.length === 0 ? (
                <div className="text-center py-12">
                  <FaUserFriends className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes compañeros de facultad aún</p>
                  <p className="text-sm text-gray-400 mt-2">Actualiza tu perfil para seleccionar tu facultad</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facultyMates.map((mate) => (
                    <div key={mate._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        {mate.profilePic ? (
                          <img src={mate.profilePic} alt={mate.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                            {mate.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{mate.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{mate.role?.toLowerCase()}</p>
                          <p className="text-xs text-blue-600">{mate.faculty}</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded text-center">
                        Compañero de facultad
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Amigos de Otras Facultades */}
          {activeTab === 'friends' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Amigos de otras facultades</h2>
              <p className="text-sm text-gray-500 mb-4">Estos amigos han aceptado tu solicitud</p>
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <FaUserFriends className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aún no tienes amigos de otras facultades</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buscar amigos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <div key={friend._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        {friend.profilePic ? (
                          <img src={friend.profilePic} alt={friend.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                            {friend.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{friend.role?.toLowerCase()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFriend(friend.friendshipId)}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Eliminar amigo
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Solicitudes Pendientes */}
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Solicitudes de amistad</h2>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes solicitudes pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {request.requester.profilePic ? (
                          <img src={request.requester.profilePic} alt={request.requester.name} className="w-14 h-14 rounded-full object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                            {request.requester.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.requester.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{request.requester.role?.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(request._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaCheck className="inline mr-1" />
                          Aceptar
                        </button>
                        <button
                          onClick={() => rejectRequest(request._id)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <FaTimes className="inline mr-1" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Buscar */}
          {activeTab === 'search' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Buscar personas de otras facultades</h2>
              <p className="text-sm text-gray-500 mb-4">Solo puedes buscar usuarios que no pertenecen a tu facultad</p>
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Buscar por nombre o email..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    <FaSearch className="inline" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Buscando...</p>
                </div>
              ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron resultados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((searchUser) => (
                    <div key={searchUser._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {searchUser.profilePic ? (
                          <img src={searchUser.profilePic} alt={searchUser.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                            {searchUser.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{searchUser.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{searchUser.role?.toLowerCase()}</p>
                        </div>
                      </div>
                      {renderFriendButton(searchUser)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
