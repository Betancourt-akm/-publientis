import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH, FaEdit, FaTrash, FaTimes, FaSpinner, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { Context } from '../../../context';
import axiosInstance from '../../../utils/axiosInstance';

const PublicationCard = ({ publication, onLike, onDelete, onUpdate, showActions = true }) => {
  const { user } = useContext(Context);
  const currentUserId = user?._id || user?.id;
  const isAuthor = currentUserId && publication.authorId?._id && String(currentUserId) === String(publication.authorId._id);

  const [isSaved, setIsSaved] = useState(
    currentUserId && publication.saves?.map(String).includes(String(currentUserId))
  );
  const [savesCount, setSavesCount] = useState(publication.saves?.length || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: publication.title || '',
    description: publication.description || '',
    type: publication.type || 'ACHIEVEMENT',
    tags: (publication.tags || []).join(', ')
  });
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data } = await axiosInstance.delete(`/api/academic/publications/${publication._id}`);
      if (data.success) {
        onDelete && onDelete(publication._id);
      }
    } catch (err) {
      console.error('Error al eliminar publicación:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      const tagsArray = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const { data } = await axiosInstance.put(`/api/academic/publications/${publication._id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        type: editForm.type,
        tags: tagsArray
      });
      if (data.success) {
        // Si la publicación volvió a PENDING (organización editó), removerla del feed
        if (data.data.status === 'PENDING') {
          onDelete && onDelete(publication._id);
          alert(data.message || 'Publicación actualizada. Será visible una vez re-aprobada por la facultad.');
        } else {
          onUpdate && onUpdate(data.data);
        }
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Error al editar publicación:', err);
    } finally {
      setEditing(false);
    }
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
        {isAuthor && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaEllipsisH className="text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 w-44">
                <button
                  onClick={() => { setShowMenu(false); setShowEditModal(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaEdit className="text-blue-500" /> Editar publicación
                </button>
                <button
                  onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FaTrash className="text-red-500" /> Eliminar publicación
                </button>
              </div>
            )}
          </div>
        )}
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
                currentUserId && publication.likes?.map(String).includes(String(currentUserId)) ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {currentUserId && publication.likes?.map(String).includes(String(currentUserId)) ? (
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
            
            <button
              onClick={async () => {
                if (!currentUserId) return;
                try {
                  const { data } = await axiosInstance.post(`/api/academic/publications/${publication._id}/save`);
                  if (data.success) {
                    setIsSaved(data.data.hasSaved);
                    setSavesCount(data.data.savesCount);
                  }
                } catch (err) { console.error('Error al guardar:', err); }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                isSaved ? 'text-yellow-600' : 'text-gray-600'
              }`}
            >
              {isSaved ? <FaBookmark className="text-lg" /> : <FaRegBookmark className="text-lg" />}
              <span className="font-medium text-sm">Guardar</span>
            </button>
          </div>
        </div>
      )}
      {/* Modal de Confirmación para Eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar publicación</h3>
            <p className="text-gray-600 text-sm mb-5">¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <FaSpinner className="animate-spin" />}
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Editar publicación</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="ACHIEVEMENT">Logro</option>
                  <option value="PAPER">Artículo</option>
                  <option value="BOOK">Libro</option>
                  <option value="RESEARCH_PROJECT">Investigación</option>
                  <option value="INTERNSHIP">Práctica</option>
                  <option value="CERTIFICATION">Certificación</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="ej: investigación, ciencia, educación"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {editing && <FaSpinner className="animate-spin" />}
                  {editing ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationCard;
