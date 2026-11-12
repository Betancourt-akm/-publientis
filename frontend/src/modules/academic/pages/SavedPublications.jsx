import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaBookmark, FaArrowLeft } from 'react-icons/fa';
import { Context } from '../../../context';
import axiosInstance from '../../../utils/axiosInstance';
import PublicationCard from '../components/PublicationCard';
import academicApi from '../services/academicApi';

const SavedPublications = () => {
  const { user } = useContext(Context);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    fetchSaved();
  }, [user]);

  const fetchSaved = async () => {
    try {
      const res = await fetch(academicApi.getSavedPublications.url, {
        method: academicApi.getSavedPublications.method,
        credentials: academicApi.getSavedPublications.credentials
      });
      const data = await res.json();
      if (data.success) setPublications(data.data || []);
    } catch (err) {
      console.error('Error obteniendo guardados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (publicationId) => {
    try {
      const endpoint = academicApi.toggleLike(publicationId);
      const res = await fetch(endpoint.url, { method: endpoint.method, credentials: endpoint.credentials });
      const data = await res.json();
      if (data.success) {
        setPublications(prev => prev.map(p => {
          if (p._id === publicationId) {
            const userId = user._id || user.id;
            const hasLiked = data.data.hasLiked;
            return {
              ...p,
              likes: hasLiked
                ? [...(p.likes || []), userId]
                : (p.likes || []).filter(id => String(id) !== String(userId))
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleUnsave = (publicationId) => {
    setPublications(prev => prev.filter(p => p._id !== publicationId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/comunidad" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <FaArrowLeft className="text-gray-600" />
          </Link>
          <div className="flex items-center gap-2">
            <FaBookmark className="text-yellow-600 text-xl" />
            <h1 className="text-2xl font-bold text-gray-900">Publicaciones guardadas</h1>
          </div>
        </div>

        {publications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <FaBookmark className="text-5xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Sin publicaciones guardadas</h2>
            <p className="text-gray-500 text-sm mb-4">
              Guarda publicaciones que te interesen desde el feed para verlas después aquí.
            </p>
            <Link
              to="/comunidad"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Ir al feed
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{publications.length} publicación{publications.length !== 1 ? 'es' : ''} guardada{publications.length !== 1 ? 's' : ''}</p>
            {publications.map(pub => (
              <PublicationCard
                key={pub._id}
                publication={pub}
                onLike={handleLike}
                onDelete={handleUnsave}
                onUpdate={(updated) => setPublications(prev => prev.map(p => p._id === updated._id ? updated : p))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPublications;
