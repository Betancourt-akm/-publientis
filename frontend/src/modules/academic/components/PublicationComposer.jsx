import React, { useState, useRef, useContext } from 'react';
import { Context } from '../../../context';
import axiosInstance from '../../../utils/axiosInstance';
import {
  FaImage, FaVideo, FaTimes, FaSpinner, FaTrophy, FaBookOpen,
  FaBook, FaFlask, FaBriefcase, FaCertificate, FaChevronDown,
} from 'react-icons/fa';

const TYPES = [
  { value: 'ACHIEVEMENT',      label: 'Logro',          icon: FaTrophy,      color: 'bg-green-100 text-green-700 border-green-300'  },
  { value: 'PAPER',            label: 'Artículo',        icon: FaBookOpen,    color: 'bg-blue-100 text-blue-700 border-blue-300'    },
  { value: 'BOOK',             label: 'Libro',           icon: FaBook,        color: 'bg-purple-100 text-purple-700 border-purple-300'},
  { value: 'RESEARCH_PROJECT', label: 'Investigación',   icon: FaFlask,       color: 'bg-orange-100 text-orange-700 border-orange-300'},
  { value: 'INTERNSHIP',       label: 'Práctica',        icon: FaBriefcase,   color: 'bg-yellow-100 text-yellow-700 border-yellow-300'},
  { value: 'CERTIFICATION',    label: 'Certificación',   icon: FaCertificate, color: 'bg-pink-100 text-pink-700 border-pink-300'    },
];

const PublicationComposer = ({ onPublished }) => {
  const { user } = useContext(Context);
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState('ACHIEVEMENT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const imageInputRef = useRef(null);

  const selectedType = TYPES.find(t => t.value === type);
  const TypeIcon = selectedType?.icon;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('La imagen no puede superar 10 MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const reset = () => {
    setExpanded(false);
    setType('ACHIEVEMENT');
    setTitle('');
    setDescription('');
    setTags('');
    setImageFile(null);
    setImagePreview(null);
    setVideoUrl('');
    setShowVideo(false);
    setError('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) { setError('Escribe algo antes de publicar'); return; }
    setError('');
    setSubmitting(true);

    try {
      let featuredImage = '';

      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('image', imageFile);
        fd.append('folder', 'publications');
        const { data: upData } = await axiosInstance.post('/api/upload/image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        featuredImage = upData?.data?.url || upData?.url || '';
        setUploading(false);
      }

      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);

      const { data } = await axiosInstance.post('/api/academic/publications', {
        title: title.trim() || description.trim().slice(0, 80),
        description: description.trim(),
        type,
        featuredImage,
        videoUrl: videoUrl.trim(),
        tags: tagsArray,
        date: new Date().toISOString().split('T')[0],
      });

      if (data.success) {
        onPublished && onPublished(data.data);
        reset();
      } else {
        throw new Error(data.message || 'Error al publicar');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al publicar');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!user?._id) return null;

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      {!expanded ? (
        /* ── COLLAPSED ── */
        <div className="p-4">
          <div className="flex gap-3 items-center">
            {user.profilePic
              ? <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shrink-0">{user.name?.charAt(0)}</div>
            }
            <button
              onClick={() => setExpanded(true)}
              className="flex-1 text-left bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2.5 text-gray-500 transition-colors"
            >
              ¿Qué quieres compartir, {user.name?.split(' ')[0]}?
            </button>
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex">
            <button onClick={() => { setExpanded(true); setTimeout(() => imageInputRef.current?.click(), 100); }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex-1 justify-center">
              <FaImage className="text-green-500 text-lg" />
              <span className="font-medium text-gray-600 text-sm">Foto</span>
            </button>
            <button onClick={() => { setExpanded(true); setShowVideo(true); }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex-1 justify-center">
              <FaVideo className="text-blue-500 text-lg" />
              <span className="font-medium text-gray-600 text-sm">Video</span>
            </button>
            <button onClick={() => setExpanded(true)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex-1 justify-center">
              <FaChevronDown className="text-gray-500 text-lg" />
              <span className="font-medium text-gray-600 text-sm">Más</span>
            </button>
          </div>
        </div>
      ) : (
        /* ── EXPANDED ── */
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Author row */}
          <div className="flex items-center gap-3">
            {user.profilePic
              ? <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">{user.name?.charAt(0)}</div>
            }
            <div>
              <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
              {/* Type badge */}
              <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${selectedType?.color}`}>
                {TypeIcon && <TypeIcon className="text-[10px]" />}
                {selectedType?.label}
              </div>
            </div>
            <button type="button" onClick={reset} className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          {/* Type selector */}
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => {
              const TIcon = t.icon;
              return (
                <button key={t.value} type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    type === t.value ? t.color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <TIcon className="text-[11px]" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Title (optional) */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Título (opcional)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            maxLength={2000}
            placeholder={`¿Qué quieres compartir sobre tu ${selectedType?.label.toLowerCase()}?`}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 -mt-3 text-right">{description.length}/2000</p>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
              <button type="button" onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors">
                <FaTimes className="text-sm" />
              </button>
            </div>
          )}

          {/* Video URL */}
          {showVideo && (
            <div className="flex items-center gap-2">
              <FaVideo className="text-blue-500 shrink-0" />
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="URL del video (YouTube, Vimeo, Drive...)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button type="button" onClick={() => { setShowVideo(false); setVideoUrl(''); }}
                className="p-2 hover:bg-gray-100 rounded-full">
                <FaTimes className="text-gray-400 text-sm" />
              </button>
            </div>
          )}

          {/* Tags */}
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Etiquetas: python, investigación, IA... (separadas por coma)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Error */}
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {/* Actions row */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex gap-1">
              {/* Hidden file input */}
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <button type="button" onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 text-sm">
                <FaImage className="text-green-500 text-base" /> Foto
              </button>
              {!showVideo && (
                <button type="button" onClick={() => setShowVideo(true)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 text-sm">
                  <FaVideo className="text-blue-500 text-base" /> Video
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={reset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={submitting || !description.trim()}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting ? <><FaSpinner className="animate-spin" /> {uploading ? 'Subiendo...' : 'Publicando...'}</> : 'Publicar'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default PublicationComposer;
