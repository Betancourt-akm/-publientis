import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Context } from '../../../context';
import academicApi from '../services/academicApi';
import { FaArrowLeft, FaHeart, FaRegHeart, FaExternalLinkAlt, FaPaperclip } from 'react-icons/fa';

const getTypeLabel = (type) => {
  const labels = {
    ACHIEVEMENT: 'Logro',
    PAPER: 'Artículo',
    BOOK: 'Libro',
    RESEARCH_PROJECT: 'Investigación',
    INTERNSHIP: 'Práctica',
    CERTIFICATION: 'Certificación'
  };
  return labels[type] || type || 'Publicación';
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

const PublicationPage = () => {
  const { pubId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(Context);

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (!pubId) return;
    fetchPublication();
  }, [pubId]);

  const fetchPublication = async () => {
    try {
      setLoading(true);
      const endpoint = academicApi.getPublicationById(pubId);
      const res = await fetch(endpoint.url, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        setPublication(data.data);
        const likes = data.data.likes || [];
        setLikeCount(likes.length);
        setLiked(user ? likes.includes(user._id || user.id) : false);
      } else {
        setError('Publicación no encontrada.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar la publicación.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const endpoint = academicApi.toggleLike(pubId);
      const res = await fetch(endpoint.url, { method: endpoint.method, credentials: endpoint.credentials });
      const data = await res.json();
      if (data.success) {
        setLiked(data.data.hasLiked);
        setLikeCount(prev => data.data.hasLiked ? prev + 1 : prev - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <p>{error || 'Publicación no encontrada.'}</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:underline">
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  const author = publication.authorId;
  const formatDate = (d) => new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <FaArrowLeft /> Volver
        </button>

        {/* Publication card */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          {/* Author header */}
          <div className="p-5 flex items-center gap-3 border-b border-gray-100">
            <Link to={`/academic/profile/${author?._id}`}>
              {author?.profilePic ? (
                <img src={author.profilePic} alt={author.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {author?.name?.charAt(0) || 'U'}
                </div>
              )}
            </Link>
            <div>
              <Link to={`/academic/profile/${author?._id}`} className="font-semibold text-gray-900 hover:underline">
                {author?.name || 'Usuario'}
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>{formatDate(publication.createdAt || publication.date)}</span>
                {publication.type && (
                  <>
                    <span>·</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${getTypeColor(publication.type)}`}>
                      {getTypeLabel(publication.type)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h1 className="text-xl font-bold text-gray-900 mb-3">{publication.title}</h1>

            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {publication.description}
            </p>

            {/* Tags */}
            {publication.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {publication.tags.map((tag, i) => (
                  <span key={i} className="text-blue-600 text-sm">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Featured image */}
          {publication.featuredImage && (
            <img
              src={publication.featuredImage}
              alt={publication.title}
              className="w-full max-h-[500px] object-cover cursor-pointer"
              onClick={() => window.open(publication.featuredImage, '_blank')}
            />
          )}

          {/* External links */}
          {publication.externalLinks?.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-2">Enlaces</p>
              <div className="flex flex-col gap-1">
                {publication.externalLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url || link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 text-sm hover:underline"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    {link.label || link.url || link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {publication.attachments?.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-2">Archivos adjuntos</p>
              <div className="flex flex-col gap-1">
                {publication.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url || att}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-700 text-sm hover:underline"
                  >
                    <FaPaperclip className="text-xs text-gray-400" />
                    {att.name || att.url || `Archivo ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {likeCount > 0 && (
            <div className="px-5 py-2 border-t border-gray-100 text-sm text-gray-500">
              {likeCount} {likeCount === 1 ? 'me gusta' : 'me gusta'}
            </div>
          )}

          {/* Like action */}
          <div className="border-t border-gray-200 px-5 py-3 flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                liked ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {liked ? <FaHeart /> : <FaRegHeart />}
              {liked ? 'Te gusta' : 'Me gusta'}
            </button>

            <Link
              to={`/academic/profile/${author?._id}`}
              className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Ver perfil del autor
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicationPage;
