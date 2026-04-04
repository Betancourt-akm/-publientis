import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import uploadImage from '../../helpers/uploadImage';

const ReviewForm = ({ productId, productName, onSuccess }) => {
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkCanReview();
  }, [productId]);

  const checkCanReview = async () => {
    try {
      const response = await fetch(
        SummaryApi.canUserReview.url.replace(':productId', productId),
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setCanReview(data.canReview);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es muy grande. Máximo 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadImage(file, 'reviews');
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, {
          url: result.url,
          publicId: result.publicId || '',
          caption: ''
        }]
      }));
      
      toast.success('Imagen agregada');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.comment.length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(SummaryApi.createReview.url, {
        method: SummaryApi.createReview.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          ...formData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('¡Gracias por tu reseña!');
        setFormData({ rating: 5, title: '', comment: '', images: [] });
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || 'Error al crear reseña');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando...</div>;
  }

  if (!canReview) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-gray-700">
          Debes comprar este producto para dejar una reseña.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">Escribe una reseña</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Calificación */}
        <div className="mb-6">
          <label className="block font-medium mb-2">Calificación *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                {star <= formData.rating ? (
                  <FaStar className="text-yellow-500" />
                ) : (
                  <FaRegStar className="text-gray-300" />
                )}
              </button>
            ))}
            <span className="ml-2 text-gray-600 self-center">
              {formData.rating === 5 ? 'Excelente' :
               formData.rating === 4 ? 'Muy bueno' :
               formData.rating === 3 ? 'Bueno' :
               formData.rating === 2 ? 'Regular' : 'Malo'}
            </span>
          </div>
        </div>

        {/* Título */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Resume tu experiencia"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            maxLength={100}
          />
        </div>

        {/* Comentario */}
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Tu reseña * (mínimo 10 caracteres)
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="¿Qué te gustó o no te gustó? ¿Para qué usaste este producto?"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={5}
            required
            minLength={10}
            maxLength={2000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.comment.length}/2000 caracteres
          </p>
        </div>

        {/* Imágenes */}
        <div className="mb-6">
          <label className="block font-medium mb-2">
            Agregar fotos (opcional)
          </label>
          
          {formData.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.images.length < 5 && (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
              <FaCloudUploadAlt className="text-xl" />
              <span>{uploadingImage ? 'Subiendo...' : 'Subir imagen'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Máximo 5 imágenes. Cada una de máximo 5MB.
          </p>
        </div>

        {/* Botón enviar */}
        <button
          type="submit"
          disabled={submitting || !formData.title || formData.comment.length < 10}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {submitting ? 'Enviando...' : 'Publicar reseña'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
