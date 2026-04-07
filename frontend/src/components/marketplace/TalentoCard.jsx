import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaStar, FaFileAlt, FaBriefcase, FaThumbsUp, FaEye, FaBookmark, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './TalentoCard.css';

/**
 * TalentoCard - Tarjeta de Egresado en Marketplace
 * 
 * Diseño tipo "directorio de empleo" (Computrabajo/LinkedIn)
 * Muestra: Badge verificado, programa, énfasis, portafolio preview, rating
 */

const TalentoCard = ({ talent, onAction }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleViewPortfolio = () => {
    // Registrar interés de la organización
    registerInterest('viewed_portfolio');
    navigate(`/perfil/${talent._id}`);
  };

  const handleSaveCandidate = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/favorites/add', {
        candidateId: talent._id
      });
      
      registerInterest('saved_candidate');
      setIsSaved(true);
      
      if (onAction) onAction('saved', talent);
    } catch (error) {
      console.error('Error guardando candidato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    setLoading(true);
    try {
      await registerInterest('invited_to_apply');
      
      // Crear notificación para el estudiante
      if (onAction) onAction('invited', talent);
      
      alert(`Invitación enviada a ${talent.name}`);
    } catch (error) {
      console.error('Error enviando invitación:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerInterest = async (action) => {
    try {
      await axiosInstance.post('/api/matchmaking/register-interest', {
        studentId: talent._id,
        action,
        metadata: {
          source: 'marketplace_search',
          deviceType: 'web'
        }
      });
    } catch (error) {
      console.error('Error registrando interés:', error);
    }
  };

  return (
    <div className="talento-card">
      {/* Header con Avatar y Badge */}
      <div className="card-header">
        <div className="avatar-section">
          <img 
            src={talent.profilePic || '/default-avatar.png'} 
            alt={talent.name}
            className="avatar"
          />
          {talent.profileStatus === 'verified' && (
            <div className="verified-badge">
              <FaCheckCircle />
              <span>Verificado</span>
            </div>
          )}
        </div>
        <div className="rating-section">
          <div className="stars">
            <FaStar className="star-filled" />
            <span>{talent.evaluations?.averageRating?.toFixed(1) || 'N/A'}</span>
          </div>
          <small>({talent.evaluations?.count || 0} eval.)</small>
        </div>
      </div>

      {/* Información Académica */}
      <div className="card-body">
        <h3 className="talent-name">{talent.name}</h3>
        
        <div className="academic-info">
          <div className="info-row">
            <FaUniversity className="icon" />
            <div className="info-text">
              <strong>{talent.academicProgramRef?.name || 'Programa no especificado'}</strong>
              <small>{talent.facultyRef?.name || ''}</small>
            </div>
          </div>
        </div>

        {/* Énfasis Pedagógicos */}
        {talent.pedagogicalEmphasis && talent.pedagogicalEmphasis.length > 0 && (
          <div className="emphasis-tags">
            {talent.pedagogicalEmphasis.slice(0, 3).map((emphasis, index) => (
              <span key={index} className="emphasis-tag">
                {emphasis}
              </span>
            ))}
            {talent.pedagogicalEmphasis.length > 3 && (
              <span className="emphasis-tag more">
                +{talent.pedagogicalEmphasis.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Preview de Portafolio */}
        {talent.portfolio && talent.portfolio.length > 0 && (
          <div className="portfolio-preview">
            <label>Portafolio Destacado:</label>
            <div className="mini-gallery">
              {talent.portfolio.slice(0, 3).map((item) => (
                <div key={item._id} className="thumbnail" title={item.title}>
                  {item.type === 'image' ? (
                    <img src={item.fileUrl} alt={item.title} />
                  ) : (
                    <div className="file-icon">
                      <FaFileAlt />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="stats-row">
          <div className="stat">
            <FaFileAlt className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{talent.portfolio?.length || 0}</span>
              <span className="stat-label">Evidencias</span>
            </div>
          </div>
          <div className="stat">
            <FaBriefcase className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{talent.experienceCount || 0}</span>
              <span className="stat-label">Prácticas</span>
            </div>
          </div>
          <div className="stat">
            <FaThumbsUp className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{talent.socialScore || 0}</span>
              <span className="stat-label">Reputación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con Acciones */}
      <div className="card-footer">
        <button 
          className="btn-action btn-primary"
          onClick={handleViewPortfolio}
        >
          <FaEye /> Ver Portafolio
        </button>
        <button 
          className={`btn-action btn-secondary ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveCandidate}
          disabled={loading || isSaved}
        >
          <FaBookmark /> {isSaved ? 'Guardado' : 'Guardar'}
        </button>
        <button 
          className="btn-action btn-success"
          onClick={handleInvite}
          disabled={loading}
        >
          <FaPaperPlane /> Invitar
        </button>
      </div>

      {/* Badge de Reputación Social (si es alto) */}
      {talent.socialScore >= 75 && (
        <div className="reputation-badge">
          ⭐ Docente Destacado
        </div>
      )}
    </div>
  );
};

export default TalentoCard;
