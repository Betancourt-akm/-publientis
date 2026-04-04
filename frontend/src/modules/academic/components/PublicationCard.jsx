import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH } from 'react-icons/fa';

const PublicationCard = ({ publication, onLike, showActions = true }) => {
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header del Post - Estilo Facebook */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/academic/profile/${publication.authorId?._id}`}>
            {publication.authorId?.profilePic ? (
              <img
                src={publication.authorId.profilePic}
                alt={publication.authorId.name}
                className="w-10 h-10 rounded-full hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {publication.authorId?.name?.charAt(0) || 'U'}
              </div>
            )}
          </Link>
          <div>
            <Link to={`/academic/profile/${publication.authorId?._id}`} className="font-semibold text-gray-900 hover:underline">
              {publication.authorId?.name || 'Usuario'}
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatDate(publication.createdAt || publication.date)}</span>
              <span>·</span>
              <span className={`px-2 py-0.5 rounded ${getTypeColor(publication.type)}`}>
                {getTypeLabel(publication.type)}
              </span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <FaEllipsisH className="text-gray-500" />
        </button>
      </div>

      {/* Contenido del Post */}
      <div className="px-4 pb-2">
        <Link to={`/academic/publication/${publication._id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 hover:underline">
            {publication.title}
          </h3>
        </Link>
        <p className="text-gray-800 text-sm whitespace-pre-line">
          {publication.description?.length > 200 
            ? publication.description.substring(0, 200) + '...' 
            : publication.description}
        </p>
        
        {publication.tags && publication.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {publication.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Imagen del Post */}
      {publication.featuredImage && (
        <div className="w-full">
          <img
            src={publication.featuredImage}
            alt={publication.title}
            className="w-full max-h-[500px] object-cover cursor-pointer"
            onClick={() => window.open(publication.featuredImage, '_blank')}
          />
        </div>
      )}

      {/* Estadísticas - Likes y Comentarios */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          {publication.likes?.length > 0 && (
            <>
              <div className="flex -space-x-1">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
                  <FaHeart className="text-white text-xs" />
                </div>
              </div>
              <span>{publication.likes.length}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {publication.commentsCount > 0 && <span>{publication.commentsCount} comentarios</span>}
          {publication.sharesCount > 0 && <span>{publication.sharesCount} compartidos</span>}
        </div>
      </div>

      {/* Botones de Interacción - Estilo Facebook */}
      {showActions && (
        <div className="border-t border-gray-200">
          <div className="flex items-center justify-around py-1">
            <button
              onClick={() => onLike && onLike(publication._id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                publication.likes?.includes('currentUserId') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {publication.likes?.includes('currentUserId') ? (
                <FaHeart className="text-lg" />
              ) : (
                <FaRegHeart className="text-lg" />
              )}
              <span className="font-medium text-sm">Me gusta</span>
            </button>
            
            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <FaComment className="text-lg" />
              <span className="font-medium text-sm">Comentar</span>
            </button>
            
            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <FaShare className="text-lg" />
              <span className="font-medium text-sm">Compartir</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationCard;
