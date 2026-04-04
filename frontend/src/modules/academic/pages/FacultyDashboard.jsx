import React, { useState, useEffect } from 'react';
import academicApi from '../services/academicApi';
import Spinner from '../../../components/common/Spinner';

const FacultyDashboard = () => {
  const [pendingPublications, setPendingPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingPublications();
  }, []);

  const fetchPendingPublications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        academicApi.getPendingPublications.url,
        {
          method: academicApi.getPendingPublications.method,
          credentials: academicApi.getPendingPublications.credentials
        }
      );

      const data = await response.json();

      if (data.success) {
        setPendingPublications(data.data);
      } else {
        setError(data.message || 'Error al cargar publicaciones pendientes');
      }
    } catch (err) {
      console.error('Error fetching pending publications:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (publicationId) => {
    try {
      const endpoint = academicApi.approvePublication(publicationId);
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        credentials: endpoint.credentials,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setPendingPublications(prev =>
          prev.filter(pub => pub._id !== publicationId)
        );
        alert('Publicación aprobada exitosamente');
      } else {
        alert(data.message || 'Error al aprobar la publicación');
      }
    } catch (err) {
      console.error('Error approving publication:', err);
      alert('Error al aprobar la publicación');
    }
  };

  const handleRejectClick = (publication) => {
    setSelectedPublication(publication);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert('Debe proporcionar una razón para el rechazo');
      return;
    }

    try {
      const endpoint = academicApi.rejectPublication(selectedPublication._id);
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        credentials: endpoint.credentials,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await response.json();

      if (data.success) {
        setPendingPublications(prev =>
          prev.filter(pub => pub._id !== selectedPublication._id)
        );
        setShowRejectModal(false);
        setSelectedPublication(null);
        setRejectionReason('');
        alert('Publicación rechazada');
      } else {
        alert(data.message || 'Error al rechazar la publicación');
      }
    } catch (err) {
      console.error('Error rejecting publication:', err);
      alert('Error al rechazar la publicación');
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      ACHIEVEMENT: 'Logro',
      PAPER: 'Artículo',
      BOOK: 'Libro',
      RESEARCH_PROJECT: 'Investigación',
      INTERNSHIP: 'Práctica',
      CERTIFICATION: 'Certificación'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      ACHIEVEMENT: 'bg-green-100 text-green-800',
      PAPER: 'bg-blue-100 text-blue-800',
      BOOK: 'bg-purple-100 text-purple-800',
      RESEARCH_PROJECT: 'bg-orange-100 text-orange-800',
      INTERNSHIP: 'bg-yellow-100 text-yellow-800',
      CERTIFICATION: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Facultad
          </h1>
          <p className="text-gray-600">
            Gestión y moderación de publicaciones académicas
          </p>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Publicaciones Pendientes</p>
                  <p className="text-2xl font-bold text-blue-600">{pendingPublications.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aprobadas Este Mes</p>
                  <p className="text-2xl font-bold text-green-600">-</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-purple-600">-</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'pending'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Publicaciones Pendientes
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'students'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Estudiantes
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'announcements'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Anuncios
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              <div>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Spinner />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-800">{error}</p>
                  </div>
                ) : pendingPublications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No hay publicaciones pendientes
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Todas las publicaciones han sido revisadas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPublications.map((publication) => (
                      <div
                        key={publication._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(publication.type)}`}>
                                {getTypeLabel(publication.type)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(publication.createdAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {publication.title}
                            </h3>

                            <p className="text-gray-600 text-sm mb-3">
                              {publication.description}
                            </p>

                            <div className="flex items-center space-x-2 mb-3">
                              {publication.authorId?.profilePic ? (
                                <img
                                  src={publication.authorId.profilePic}
                                  alt={publication.authorId.name}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                  {publication.authorId?.name?.charAt(0) || 'U'}
                                </div>
                              )}
                              <span className="text-sm text-gray-700">
                                {publication.authorId?.name || 'Usuario'}
                              </span>
                            </div>

                            {publication.tags && publication.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {publication.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {publication.featuredImage && (
                            <img
                              src={publication.featuredImage}
                              alt={publication.title}
                              className="w-32 h-32 object-cover rounded ml-4"
                            />
                          )}
                        </div>

                        <div className="mt-4 flex space-x-3">
                          <button
                            onClick={() => handleApprove(publication._id)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            ✓ Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectClick(publication)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            ✗ Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Gestión de estudiantes - Próximamente</p>
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Crear anuncios - Próximamente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rechazar Publicación
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor proporciona una razón para el rechazo de "{selectedPublication?.title}"
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none"
              rows="4"
              placeholder="Razón del rechazo..."
            />
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPublication(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
