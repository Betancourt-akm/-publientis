import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../context';
import academicApi from '../services/academicApi';

const CreatePublication = () => {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'ACHIEVEMENT',
    category: '',
    date: new Date().toISOString().split('T')[0],
    featuredImage: '',
    tags: '',
    externalLinks: [{ url: '', label: '' }]
  });

  const publicationTypes = [
    { value: 'ACHIEVEMENT', label: 'Logro Académico' },
    { value: 'PAPER', label: 'Artículo Científico' },
    { value: 'BOOK', label: 'Libro/Capítulo' },
    { value: 'RESEARCH_PROJECT', label: 'Proyecto de Investigación' },
    { value: 'INTERNSHIP', label: 'Práctica Profesional' },
    { value: 'CERTIFICATION', label: 'Certificación' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...formData.externalLinks];
    newLinks[index][field] = value;
    setFormData(prev => ({
      ...prev,
      externalLinks: newLinks
    }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      externalLinks: [...prev.externalLinks, { url: '', label: '' }]
    }));
  };

  const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.title.trim()) {
        throw new Error('El título es requerido');
      }
      if (!formData.description.trim()) {
        throw new Error('La descripción es requerida');
      }

      // Preparar datos
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const validLinks = formData.externalLinks.filter(
        link => link.url.trim() && link.label.trim()
      );

      const publicationData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        category: formData.category.trim(),
        date: formData.date,
        featuredImage: formData.featuredImage.trim(),
        tags: tagsArray,
        externalLinks: validLinks
      };

      const response = await fetch(academicApi.createPublication.url, {
        method: academicApi.createPublication.method,
        credentials: academicApi.createPublication.credentials,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publicationData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Publicación creada exitosamente y visible en el feed.');
        navigate('/academic/feed');
      } else {
        throw new Error(data.message || 'Error al crear la publicación');
      }
    } catch (err) {
      console.error('Error creating publication:', err);
      setError(err.message || 'Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  // Verificar que el usuario sea STUDENT o ADMIN
  if (!user || (user.role !== 'STUDENT' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-4">
            Solo los estudiantes pueden crear publicaciones.
          </p>
          <button
            onClick={() => navigate('/academic/feed')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver al Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nueva Publicación Académica
            </h1>
            <p className="text-gray-600">
              Comparte tus logros, investigaciones y proyectos con la comunidad académica
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Publicación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Publicación *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {publicationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="Ej: Desarrollo de Sistema de Reconocimiento Facial con IA"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/200 caracteres
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={6}
                placeholder="Describe tu proyecto, logro o investigación en detalle..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/2000 caracteres
              </p>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Ej: Inteligencia Artificial, Desarrollo Web, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Imagen Destacada */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imagen Destacada (URL)
              </label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL de una imagen de Cloudinary o externa
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Etiquetas
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Python, Machine Learning, TensorFlow (separadas por comas)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa las etiquetas con comas
              </p>
            </div>

            {/* Enlaces Externos */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enlaces Externos
              </label>
              <div className="space-y-3">
                {formData.externalLinks.map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Etiqueta (ej: GitHub, Paper, Demo)"
                      value={link.label}
                      onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.externalLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLink}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Agregar enlace
              </button>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/academic/feed')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>✓ Publicación inmediata:</strong> Tu publicación será visible en el feed académico inmediatamente después de crearla. Comparte tus logros con la comunidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePublication;
