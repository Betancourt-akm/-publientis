import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaBuilding, FaGraduationCap, FaCheckCircle, FaBookmark, FaExternalLinkAlt } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './VacanteCard.css';

/**
 * VacanteCard - Tarjeta de Vacante en Marketplace
 * 
 * Diseño para estudiantes/egresados que buscan empleo/práctica
 */

const VacanteCard = ({ vacancy, onAction }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApply = () => {
    navigate(`/jobs/${vacancy._id}`);
  };

  const handleSaveVacancy = async () => {
    setLoading(true);
    try {
      // Guardar vacante favorita
      await axiosInstance.post('/api/favorites/save-job', {
        jobOfferId: vacancy._id
      });
      
      setIsSaved(true);
      if (onAction) onAction('saved', vacancy);
    } catch (error) {
      console.error('Error guardando vacante:', error);
    } finally {
      setLoading(false);
    }
  };

  const getJobTypeLabel = (type) => {
    const labels = {
      'practica': 'Práctica',
      'empleo': 'Empleo',
      'freelance': 'Freelance',
      'temporal': 'Temporal'
    };
    return labels[type] || type;
  };

  const getEducationalLevelLabel = (level) => {
    const labels = {
      'Inicial': 'Educación Inicial',
      'Primaria': 'Educación Primaria',
      'Secundaria': 'Educación Secundaria',
      'Superior': 'Educación Superior'
    };
    return labels[level] || level;
  };

  return (
    <div className="vacante-card">
      {/* Ribbon con tipo de vacante */}
      <div className={`job-type-ribbon ${vacancy.jobType || 'empleo'}`}>
        {getJobTypeLabel(vacancy.jobType || 'empleo')}
      </div>

      {/* Header con logo de organización */}
      <div className="vacancy-header">
        <div className="organization-logo">
          <img 
            src={vacancy.organization?.profilePic || '/default-org.png'} 
            alt={vacancy.organization?.name || 'Organización'}
          />
        </div>
        <div className="organization-info">
          <h4>{vacancy.organization?.name || 'Organización'}</h4>
          {vacancy.organization?.convenio?.status === 'active' && (
            <span className="convenio-badge">
              <FaCheckCircle /> Convenio Activo
            </span>
          )}
        </div>
      </div>

      {/* Título y descripción */}
      <div className="vacancy-body">
        <h3 className="vacancy-title">{vacancy.title}</h3>
        
        <p className="vacancy-description">
          {vacancy.description?.length > 150 
            ? `${vacancy.description.substring(0, 150)}...` 
            : vacancy.description}
        </p>

        {/* Detalles clave */}
        <div className="vacancy-details">
          <div className="detail-item">
            <FaGraduationCap className="detail-icon" />
            <span>{getEducationalLevelLabel(vacancy.educationalLevel)}</span>
          </div>
          
          <div className="detail-item">
            <FaMapMarkerAlt className="detail-icon" />
            <span>{vacancy.location || 'Ubicación flexible'}</span>
          </div>
          
          <div className="detail-item">
            <FaClock className="detail-icon" />
            <span>{vacancy.duration || 'Duración variable'}</span>
          </div>

          {vacancy.salary && (
            <div className="detail-item salary">
              <FaBriefcase className="detail-icon" />
              <span>{vacancy.salary}</span>
            </div>
          )}
        </div>

        {/* Programas académicos objetivo */}
        {vacancy.targetPrograms && vacancy.targetPrograms.length > 0 && (
          <div className="target-programs">
            <label>Dirigido a:</label>
            <div className="program-tags">
              {vacancy.targetPrograms.slice(0, 2).map((program) => (
                <span key={program._id} className="program-tag">
                  {program.name}
                </span>
              ))}
              {vacancy.targetPrograms.length > 2 && (
                <span className="program-tag more">
                  +{vacancy.targetPrograms.length - 2} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Énfasis requeridos */}
        {vacancy.requiredEmphasis && vacancy.requiredEmphasis.length > 0 && (
          <div className="required-emphasis">
            <label>Énfasis buscados:</label>
            <div className="emphasis-tags-small">
              {vacancy.requiredEmphasis.map((emphasis, index) => (
                <span key={index} className="emphasis-tag-small">
                  {emphasis}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="vacancy-footer">
        <div className="vacancy-meta">
          <span className="post-date">
            Publicado hace {formatTimeAgo(vacancy.createdAt)}
          </span>
          {vacancy.applicantsCount > 0 && (
            <span className="applicants-count">
              {vacancy.applicantsCount} postulados
            </span>
          )}
        </div>
        
        <div className="vacancy-actions">
          <button 
            className={`btn-save ${isSaved ? 'saved' : ''}`}
            onClick={handleSaveVacancy}
            disabled={loading || isSaved}
          >
            <FaBookmark /> {isSaved ? 'Guardado' : 'Guardar'}
          </button>
          <button 
            className="btn-apply"
            onClick={handleApply}
          >
            Postularme <FaExternalLinkAlt />
          </button>
        </div>
      </div>

      {/* Badge de urgente si aplica */}
      {vacancy.isUrgent && (
        <div className="urgent-badge">
          🔥 Urgente
        </div>
      )}
    </div>
  );
};

// Helper function
const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600
  };

  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `${interval} ${name}${interval > 1 ? 's' : ''}`;
    }
  }
  return 'unos minutos';
};

export default VacanteCard;
