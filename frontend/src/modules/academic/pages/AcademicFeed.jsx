import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../../../context';
import PublicationCard from '../components/PublicationCard';
import academicApi from '../services/academicApi';
import Spinner from '../../../components/common/Spinner';
import MessagesPanel from '../../../components/chat/MessagesPanel';
import axiosInstance from '../../../utils/axiosInstance';
import { FaGraduationCap, FaUserFriends, FaBook, FaLightbulb, FaBriefcase, FaUsers, FaCertificate, FaFlask } from 'react-icons/fa';
import SEO from '../../../components/SEO';
import PublicationComposer from '../components/PublicationComposer';

const AcademicFeed = () => {
  const { user } = useContext(Context);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const publicationTypes = [
    { value: '', label: 'Todos' },
    { value: 'ACHIEVEMENT', label: 'Logros' },
    { value: 'PAPER', label: 'Artículos' },
    { value: 'BOOK', label: 'Libros' },
    { value: 'RESEARCH_PROJECT', label: 'Investigaciones' },
    { value: 'INTERNSHIP', label: 'Prácticas' },
    { value: 'CERTIFICATION', label: 'Certificaciones' }
  ];

  useEffect(() => {
    fetchPublications();
    if (user?._id) {
      fetchAvailableUsers();
    }
  }, [selectedType, page, user]);

  const fetchAvailableUsers = async () => {
    try {
      // Obtener solo amigos confirmados
      const response = await axiosInstance.get('/friends/list');
      if (response.data.success) {
        setAvailableUsers(response.data.data);
      }
    } catch (err) {
      console.error('Error obteniendo amigos:', err);
    }
  };

  const fetchPublications = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      if (selectedType) {
        queryParams.append('type', selectedType);
      }

      const response = await fetch(
        `${academicApi.getPublicationFeed.url}?${queryParams}`,
        {
          method: academicApi.getPublicationFeed.method
        }
      );

      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setPublications(data.data);
        } else {
          setPublications(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      } else {
        setError(data.message || 'Error al cargar publicaciones');
      }
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setPage(1);
    setPublications([]);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleLike = async (publicationId) => {
    try {
      const endpoint = academicApi.toggleLike(publicationId);
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        credentials: endpoint.credentials
      });

      const data = await response.json();

      if (data.success) {
        setPublications(prev =>
          prev.map(pub =>
            pub._id === publicationId
              ? { ...pub, likes: data.data.hasLiked 
                  ? [...(pub.likes || []), 'currentUserId'] 
                  : pub.likes.filter(id => id !== 'currentUserId') }
              : pub
          )
        );
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SEO
        title="Feed Académico"
        description="Explora publicaciones académicas, investigaciones y logros de la comunidad universitaria en Publientis."
        url="https://publientis.online"
      />
      <div className="flex max-w-[1920px] mx-auto">
        {/* Sidebar Izquierdo - Estilo Facebook */}
        <div className="hidden lg:block w-[280px] xl:w-[320px] fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            <Link to="/perfil" className="flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors">
              <img src={user?.profilePic || '/default-avatar.png'} alt={user?.name} className="w-9 h-9 rounded-full" />
              <span className="font-medium text-gray-900">{user?.name || 'Usuario'}</span>
            </Link>
            
            <Link to="/" className="flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors">
              <FaGraduationCap className="w-9 h-9 p-2 bg-gray-300 rounded-full text-blue-600" />
              <span className="font-medium text-gray-900">Feed Académico</span>
            </Link>
            
            <Link to="/friends" className="flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors">
              <FaUserFriends className="w-9 h-9 p-2 bg-gray-300 rounded-full text-blue-600" />
              <span className="font-medium text-gray-900">Amigos</span>
            </Link>
            
            <button onClick={() => handleTypeFilter('RESEARCH_PROJECT')} className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors text-left">
              <FaFlask className="w-9 h-9 p-2 bg-gray-300 rounded-full text-purple-600" />
              <span className="font-medium text-gray-900">Investigaciones</span>
            </button>
            
            <button onClick={() => handleTypeFilter('BOOK')} className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors text-left">
              <FaBook className="w-9 h-9 p-2 bg-gray-300 rounded-full text-green-600" />
              <span className="font-medium text-gray-900">Libros</span>
            </button>
            
            <button onClick={() => handleTypeFilter('CERTIFICATION')} className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors text-left">
              <FaCertificate className="w-9 h-9 p-2 bg-gray-300 rounded-full text-yellow-600" />
              <span className="font-medium text-gray-900">Certificaciones</span>
            </button>
            
            <button onClick={() => handleTypeFilter('INTERNSHIP')} className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors text-left">
              <FaBriefcase className="w-9 h-9 p-2 bg-gray-300 rounded-full text-orange-600" />
              <span className="font-medium text-gray-900">Prácticas</span>
            </button>
            
            <button onClick={() => handleTypeFilter('')} className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors text-left">
              <FaUsers className="w-9 h-9 p-2 bg-gray-300 rounded-full text-indigo-600" />
              <span className="font-medium text-gray-900">Ver Todo</span>
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="px-2 text-xs text-gray-500">Filtros rápidos</p>
            <div className="mt-2 space-y-1">
              {publicationTypes.filter(t => t.value).slice(0, 3).map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeFilter(type.value)}
                  className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido Central - Feed */}
        <div className="flex-1 lg:ml-[280px] xl:ml-[320px] lg:mr-[280px] xl:mr-[320px] min-h-screen">
          <div className="max-w-[680px] mx-auto py-4 px-4">

            {/* ── Compositor inline de publicaciones ── */}
            {user?._id && (
              <PublicationComposer
                onPublished={(newPub) => setPublications(prev => [newPub, ...prev])}
              />
            )}

            {/* Filtros en chips */}
            <div className="bg-white rounded-lg shadow mb-4 p-3">
              <div className="flex flex-wrap gap-2">
                {publicationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeFilter(type.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedType === type.value
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed de Publicaciones */}
            {loading && page === 1 ? (
              <div className="flex justify-center items-center py-20">
                <Spinner />
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => fetchPublications()}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            ) : publications.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay publicaciones</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedType ? 'Cambia el filtro para ver más contenido' : 'Sé el primero en publicar'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {publications.map((publication) => (
                    <PublicationCard
                      key={publication._id}
                      publication={publication}
                      onLike={handleLike}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="w-full py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow"
                    >
                      {loading ? 'Cargando...' : 'Ver más publicaciones'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar Derecho - Contactos */}
        <div className="hidden lg:block w-[280px] xl:w-[320px] fixed right-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto py-4 px-2">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-gray-500 font-semibold text-sm">Amigos Conectados</h3>
                <Link to="/friends" className="text-xs text-blue-600 hover:underline">Ver todos</Link>
              </div>
              <div className="space-y-1">
                {availableUsers.slice(0, 10).map((contact) => (
                  <div 
                    key={contact._id}
                    onClick={() => setSelectedChat(contact)}
                    className="flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      {contact.profilePic ? (
                        <img 
                          src={contact.profilePic} 
                          alt={contact.name} 
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {contact.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{contact.role?.toLowerCase()}</p>
                    </div>
                  </div>
                ))}
                {availableUsers.length === 0 && (
                  <p className="text-xs text-gray-500 px-2 py-4 text-center">No hay contactos disponibles</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Mensajes */}
      {selectedChat && (
        <MessagesPanel 
          otherUser={selectedChat} 
          onClose={() => setSelectedChat(null)} 
        />
      )}
    </div>
  );
};

export default AcademicFeed;
