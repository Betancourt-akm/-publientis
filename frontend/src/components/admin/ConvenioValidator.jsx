import React, { useState, useEffect } from 'react';
import { FaFileContract, FaExclamationTriangle, FaCheckCircle, FaClock, FaBan } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './ConvenioValidator.css';

const ConvenioValidator = () => {
  const [convenios, setConvenios] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, expired, expiring_soon, active

  useEffect(() => {
    fetchConvenios();
  }, []);

  const fetchConvenios = async () => {
    try {
      const { data } = await axiosInstance.get('/api/admin/stats/convenios');
      setConvenios(data.convenios);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error al cargar convenios:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredConvenios = () => {
    if (filter === 'all') return convenios;
    return convenios.filter(c => c.convenio.status === filter);
  };

  const formatDate = (date) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="convenio-validator loading">
        <div className="spinner"></div>
        <p>Cargando estado de convenios...</p>
      </div>
    );
  }

  const filteredConvenios = getFilteredConvenios();

  return (
    <div className="convenio-validator-container">
      <div className="validator-header">
        <div className="header-title">
          <FaFileContract className="title-icon" />
          <div>
            <h3>Validador de Convenios Institucionales</h3>
            <p className="subtitle">Control de legalidad de prácticas profesionales</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="convenio-summary">
          <div className="summary-card total">
            <div className="card-icon">
              <FaFileContract />
            </div>
            <div className="card-content">
              <span className="card-value">{summary.total}</span>
              <span className="card-label">Total Instituciones</span>
            </div>
          </div>

          <div className="summary-card expired">
            <div className="card-icon">
              <FaBan />
            </div>
            <div className="card-content">
              <span className="card-value">{summary.expired}</span>
              <span className="card-label">Convenios Vencidos</span>
            </div>
          </div>

          <div className="summary-card expiring">
            <div className="card-icon">
              <FaClock />
            </div>
            <div className="card-content">
              <span className="card-value">{summary.expiringSoon}</span>
              <span className="card-label">Por Vencer (30 días)</span>
            </div>
          </div>

          <div className="summary-card active">
            <div className="card-icon">
              <FaCheckCircle />
            </div>
            <div className="card-content">
              <span className="card-value">{summary.active}</span>
              <span className="card-label">Vigentes</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({convenios.length})
        </button>
        <button
          className={`filter-tab expired ${filter === 'expired' ? 'active' : ''}`}
          onClick={() => setFilter('expired')}
        >
          Vencidos ({summary?.expired || 0})
        </button>
        <button
          className={`filter-tab expiring ${filter === 'expiring_soon' ? 'active' : ''}`}
          onClick={() => setFilter('expiring_soon')}
        >
          Por Vencer ({summary?.expiringSoon || 0})
        </button>
        <button
          className={`filter-tab active-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Vigentes ({summary?.active || 0})
        </button>
      </div>

      {/* Convenios List */}
      <div className="convenios-list">
        {filteredConvenios.length === 0 ? (
          <div className="empty-state">
            <FaCheckCircle className="empty-icon" />
            <h4>No hay convenios en esta categoría</h4>
          </div>
        ) : (
          <div className="convenios-grid">
            {filteredConvenios.map((item) => {
              const { organizationId, name, email, convenio } = item;
              const statusClass = convenio.status;

              return (
                <div key={organizationId} className={`convenio-card ${statusClass}`}>
                  <div className="card-header">
                    <div className="org-info">
                      <img
                        src={item.profilePic || '/default-org.png'}
                        alt={name}
                        className="org-logo"
                      />
                      <div>
                        <h4>{name}</h4>
                        <p className="org-email">{email}</p>
                      </div>
                    </div>
                    <div className={`status-badge ${statusClass}`}>
                      {statusClass === 'expired' && <FaBan />}
                      {statusClass === 'expiring_soon' && <FaClock />}
                      {statusClass === 'active' && <FaCheckCircle />}
                      <span>
                        {statusClass === 'expired' && 'VENCIDO'}
                        {statusClass === 'expiring_soon' && 'POR VENCER'}
                        {statusClass === 'active' && 'VIGENTE'}
                      </span>
                    </div>
                  </div>

                  <div className="card-details">
                    <div className="detail-row">
                      <span className="detail-label">Inicio:</span>
                      <span className="detail-value">{formatDate(convenio.startDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Vencimiento:</span>
                      <span className={`detail-value ${statusClass === 'expired' ? 'expired-text' : ''}`}>
                        {formatDate(convenio.expirationDate)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Días restantes:</span>
                      <span className={`detail-value days ${convenio.daysUntilExpiration < 0 ? 'negative' : ''}`}>
                        {convenio.daysUntilExpiration < 0 
                          ? `Vencido hace ${Math.abs(convenio.daysUntilExpiration)} días`
                          : `${convenio.daysUntilExpiration} días`}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer">
                    {!convenio.canPublish && (
                      <div className="blocked-notice">
                        <FaExclamationTriangle />
                        <span>Publicación de vacantes bloqueada</span>
                      </div>
                    )}
                    {convenio.status === 'expiring_soon' && (
                      <button className="renew-btn">
                        Enviar Recordatorio de Renovación
                      </button>
                    )}
                    {convenio.documentUrl && (
                      <a
                        href={convenio.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-doc-btn"
                      >
                        Ver Documento
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legal Note */}
      <div className="legal-note">
        <FaFileContract className="note-icon" />
        <div>
          <strong>Nota Legal:</strong>
          <p>
            Según la normatividad vigente, todas las instituciones deben tener un convenio 
            actualizado para recibir practicantes. Las instituciones con convenio vencido no 
            pueden publicar nuevas vacantes hasta regularizar su situación.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConvenioValidator;
