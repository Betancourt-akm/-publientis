import React, { useState } from 'react';
import { FaStar, FaRegStar, FaCheckCircle, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './EvaluationForm.css';

const EvaluationForm = ({ application, evaluatorType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    overall: 0,
    professionalism: 0,
    pedagogicalSkills: 0, // solo para estudiantes
    workEnvironment: 0, // solo para instituciones
    support: 0,
    wouldRecommend: false,
    strengths: '',
    areasForImprovement: '',
    comments: '',
    isPublic: false
  });

  const [hoveredRating, setHoveredRating] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isStudent = evaluatorType === 'student';

  const handleRatingChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (formData.overall === 0 || formData.professionalism === 0 || formData.support === 0) {
      setError('Por favor completa todas las calificaciones obligatorias');
      return;
    }

    if (isStudent && formData.workEnvironment === 0) {
      setError('Por favor califica el ambiente de trabajo');
      return;
    }

    if (!isStudent && formData.pedagogicalSkills === 0) {
      setError('Por favor califica las habilidades profesionales');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await axiosInstance.post('/api/evaluations/submit', {
        applicationId: application._id,
        ratings: {
          overall: formData.overall,
          professionalism: formData.professionalism,
          ...(isStudent ? { workEnvironment: formData.workEnvironment } : { pedagogicalSkills: formData.pedagogicalSkills }),
          support: formData.support,
          wouldRecommend: formData.wouldRecommend
        },
        strengths: formData.strengths,
        areasForImprovement: formData.areasForImprovement,
        comments: formData.comments,
        isPublic: formData.isPublic
      });

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Error al enviar evaluación:', err);
      setError(err.response?.data?.message || 'Error al enviar la evaluación');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (field, label, currentValue) => {
    return (
      <div className="rating-field">
        <label className="rating-label">{label}</label>
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="star-button"
              onClick={() => handleRatingChange(field, star)}
              onMouseEnter={() => setHoveredRating({ ...hoveredRating, [field]: star })}
              onMouseLeave={() => setHoveredRating({ ...hoveredRating, [field]: 0 })}
            >
              {(hoveredRating[field] || currentValue) >= star ? (
                <FaStar className="star-icon filled" />
              ) : (
                <FaRegStar className="star-icon empty" />
              )}
            </button>
          ))}
          <span className="rating-value">
            {currentValue > 0 ? `${currentValue}/5` : 'Sin calificar'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="evaluation-form-modal">
      <div className="evaluation-form-container">
        <button className="close-modal-button" onClick={onClose} disabled={submitting}>
          <FaTimes />
        </button>

        <div className="form-header">
          <h2>Evaluar {isStudent ? 'Institución' : 'Estudiante'}</h2>
          <p className="form-subtitle">
            {application?.jobOffer?.title || 'Práctica Profesional'}
          </p>
          <p className="evaluation-info">
            Tu evaluación ayuda a mejorar la calidad de las prácticas pedagógicas
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="evaluation-form">
          <div className="ratings-section">
            <h3>Calificaciones</h3>
            
            {renderStars('overall', 'Calificación General *', formData.overall)}
            {renderStars('professionalism', 'Profesionalismo *', formData.professionalism)}
            
            {isStudent ? (
              renderStars('workEnvironment', 'Ambiente de Trabajo *', formData.workEnvironment)
            ) : (
              renderStars('pedagogicalSkills', 'Habilidades Profesionales *', formData.pedagogicalSkills)
            )}
            
            {renderStars('support', 'Apoyo y Acompañamiento *', formData.support)}

            <div className="recommendation-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.wouldRecommend}
                  onChange={(e) => setFormData({ ...formData, wouldRecommend: e.target.checked })}
                />
                <span>¿Recomendarías esta {isStudent ? 'institución' : 'experiencia'}?</span>
              </label>
            </div>
          </div>

          <div className="feedback-section">
            <h3>Retroalimentación Cualitativa</h3>

            <div className="form-group">
              <label>Fortalezas Destacadas</label>
              <textarea
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                placeholder="¿Qué aspectos positivos destacarías?"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Áreas de Mejora</label>
              <textarea
                value={formData.areasForImprovement}
                onChange={(e) => setFormData({ ...formData, areasForImprovement: e.target.value })}
                placeholder="¿Qué se podría mejorar?"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Comentarios Adicionales</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Otros comentarios que desees agregar..."
                rows="4"
              />
            </div>

            <div className="visibility-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                />
                <span>Permitir mostrar esta evaluación en el perfil público</span>
              </label>
              <p className="visibility-note">
                Las evaluaciones públicas ayudan a otros a conocer tu desempeño
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>Enviando...</>
              ) : (
                <>
                  <FaCheckCircle /> Enviar Evaluación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm;
