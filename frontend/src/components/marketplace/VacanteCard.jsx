import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBriefcase, FaMapMarkerAlt, FaClock, FaBuilding,
  FaCheckCircle, FaExternalLinkAlt, FaHandshake, FaUsers,
  FaMoneyBillWave, FaLaptopHouse
} from 'react-icons/fa';
import './VacanteCard.css';

const TYPE_CONFIG = {
  practica:     { label: 'Práctica',     color: '#3B82F6' },
  empleo:       { label: 'Empleo',        color: '#10B981' },
  voluntariado: { label: 'Voluntariado',  color: '#F59E0B' },
  investigacion:{ label: 'Investigación', color: '#8B5CF6' },
};

const MODALITY_CONFIG = {
  presencial: { label: 'Presencial', icon: <FaBuilding /> },
  remoto:     { label: 'Remoto',     icon: <FaLaptopHouse /> },
  hibrido:    { label: 'Híbrido',    icon: <FaLaptopHouse /> },
};

const formatTimeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = { año: 31536000, mes: 2592000, semana: 604800, día: 86400, hora: 3600 };
  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) return `${interval} ${name}${interval > 1 ? 's' : ''}`;
  }
  return 'hace un momento';
};

const formatCompensation = (compensation) => {
  if (!compensation) return null;
  if (compensation.type === 'no_remunerada') return 'No remunerada';
  if (compensation.type === 'por_definir') return 'A convenir';
  if (compensation.amount > 0) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(compensation.amount);
  }
  return null;
};

const formatDuration = (duration) => {
  if (!duration || !duration.value) return null;
  const unitLabels = { dias: 'días', semanas: 'semanas', meses: 'meses' };
  return `${duration.value} ${unitLabels[duration.unit] || duration.unit}`;
};

const formatLocation = (location) => {
  if (!location) return null;
  if (typeof location === 'string') return location;
  const parts = [location.city, location.state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

const VacanteCard = ({ vacancy, onAction }) => {
  const navigate = useNavigate();

  if (!vacancy) return null;

  const type = vacancy.type || 'empleo';
  const typeConf = TYPE_CONFIG[type] || { label: type, color: '#6B7280' };
  const modalityConf = MODALITY_CONFIG[vacancy.modality];
  const compensation = formatCompensation(vacancy.compensation);
  const duration = formatDuration(vacancy.duration);
  const location = formatLocation(vacancy.location);
  const tags = vacancy.tags || [];
  const targetPrograms = vacancy.targetPrograms || [];
  const deadline = vacancy.applicationDeadline ? new Date(vacancy.applicationDeadline) : null;
  const isExpiringSoon = deadline && (deadline - new Date()) < 7 * 24 * 60 * 60 * 1000 && deadline > new Date();

  return (
    <div className="vacante-card" onClick={() => navigate(`/jobs/${vacancy._id}`)}>

      {/* Ribbon tipo */}
      <div
        className="job-type-ribbon"
        style={{ background: typeConf.color }}
      >
        {typeConf.label}
      </div>

      {/* Header organización */}
      <div className="vacancy-header">
        <div className="organization-logo">
          <img
            src={vacancy.organization?.profilePic || '/default-org.png'}
            alt={vacancy.organization?.name || 'Organización'}
            onError={e => { e.target.src = '/default-org.png'; }}
          />
        </div>
        <div className="organization-info">
          <h4 className="org-name">{vacancy.organization?.name || 'Institución / Empresa'}</h4>
          <div className="org-badges">
            {vacancy.university ? (
              <span className="convenio-badge convenio-badge--active">
                <FaHandshake /> Con convenio
              </span>
            ) : (
              <span className="convenio-badge convenio-badge--open">
                <FaCheckCircle /> Abierto a todos
              </span>
            )}
            {modalityConf && (
              <span className="org-type-badge">
                {modalityConf.icon} {modalityConf.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="vacancy-body">
        <h3 className="vacancy-title">{vacancy.title}</h3>

        {vacancy.description && (
          <p className="vacancy-description">
            {vacancy.description.length > 130
              ? `${vacancy.description.substring(0, 130)}...`
              : vacancy.description}
          </p>
        )}

        {/* Detalles clave */}
        <div className="vacancy-details">
          {location && (
            <div className="detail-item">
              <FaMapMarkerAlt className="detail-icon" />
              <span>{location}</span>
            </div>
          )}
          {duration && (
            <div className="detail-item">
              <FaClock className="detail-icon" />
              <span>{duration}</span>
            </div>
          )}
          {compensation && (
            <div className="detail-item salary">
              <FaMoneyBillWave className="detail-icon" />
              <span>{compensation}</span>
            </div>
          )}
          {vacancy.slots > 1 && (
            <div className="detail-item">
              <FaUsers className="detail-icon" />
              <span>{vacancy.slots} vacantes</span>
            </div>
          )}
        </div>

        {/* Tags y programas */}
        {(tags.length > 0 || targetPrograms.length > 0) && (
          <div className="vacancy-tags">
            {targetPrograms.slice(0, 2).map((p, i) => (
              <span key={i} className="program-tag">{typeof p === 'string' ? p : p.name}</span>
            ))}
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="emphasis-tag-small">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="vacancy-footer">
        <div className="vacancy-meta">
          {vacancy.createdAt && (
            <span className="post-date">Hace {formatTimeAgo(vacancy.createdAt)}</span>
          )}
          {vacancy.applicationCount > 0 && (
            <span className="applicants-count">{vacancy.applicationCount} postulados</span>
          )}
        </div>
        <div className="vacancy-actions">
          <button
            className="btn-apply"
            onClick={e => { e.stopPropagation(); navigate(`/jobs/${vacancy._id}`); }}
          >
            Ver oferta <FaExternalLinkAlt />
          </button>
        </div>
      </div>

      {isExpiringSoon && (
        <div className="urgent-badge">⏰ Cierra pronto</div>
      )}
    </div>
  );
};

export default VacanteCard;
