import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaBuilding, FaMapMarkerAlt, FaEye, FaClock, FaUsers } from 'react-icons/fa';
import jobService from '../services/jobService';
import SEO from '../../../components/common/SEO';
import './JobApprovalPanel.css';

const TYPE_LABELS = {
  practica: 'Práctica',
  empleo: 'Empleo',
  voluntariado: 'Voluntariado',
  investigacion: 'Investigación'
};

const JobApprovalPanel = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchPending = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await jobService.getPendingOffers({ page, limit: 10 });
      if (result.success) {
        setOffers(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching pending offers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending(1);
  }, [fetchPending]);

  const handleApprove = async (id) => {
    if (!window.confirm('¿Aprobar esta oferta? Se publicará inmediatamente para los estudiantes.')) return;
    try {
      const result = await jobService.approveOffer(id);
      if (result.success) {
        alert('Oferta aprobada y publicada');
        fetchPending(pagination.page);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al aprobar');
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert('Debe proporcionar una razón para el rechazo');
      return;
    }
    try {
      const result = await jobService.rejectOffer(id, rejectReason);
      if (result.success) {
        alert('Oferta rechazada');
        setRejectingId(null);
        setRejectReason('');
        fetchPending(pagination.page);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al rechazar');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="approval-panel">
      <SEO title="Aprobación de Ofertas" description="Panel de aprobación de ofertas laborales para la universidad" />

      <header className="approval-panel__header">
        <h1 className="approval-panel__title"><FaGraduationCap /> Aprobación de Ofertas</h1>
        <p className="approval-panel__subtitle">
          Revisa y aprueba las ofertas de organizaciones antes de publicarlas a los estudiantes
        </p>
        <div className="approval-panel__counter">
          <FaClock /> {pagination.total} oferta{pagination.total !== 1 ? 's' : ''} pendiente{pagination.total !== 1 ? 's' : ''}
        </div>
      </header>

      {loading ? (
        <div className="approval-panel__loading"><div className="approval-panel__spinner"></div><p>Cargando ofertas pendientes...</p></div>
      ) : offers.length === 0 ? (
        <div className="approval-panel__empty">
          <FaCheckCircle className="approval-panel__empty-icon" />
          <h3>No hay ofertas pendientes de aprobación</h3>
          <p>Todas las ofertas han sido revisadas</p>
        </div>
      ) : (
        <div className="approval-panel__list">
          {offers.map(offer => (
            <article key={offer._id} className="approval-panel__card">
              <div className="approval-panel__card-top">
                <div>
                  <span className={`approval-panel__type approval-panel__type--${offer.type}`}>
                    {TYPE_LABELS[offer.type]}
                  </span>
                  <span className="approval-panel__date">Creada: {formatDate(offer.createdAt)}</span>
                </div>
              </div>

              <h3 className="approval-panel__card-title"
                onClick={() => setExpandedId(expandedId === offer._id ? null : offer._id)}
                style={{ cursor: 'pointer' }}
              >
                {offer.title}
              </h3>

              <div className="approval-panel__card-meta">
                {offer.organization?.name && <span><FaBuilding /> {offer.organization.name}</span>}
                {offer.location?.city && <span><FaMapMarkerAlt /> {offer.location.city}</span>}
                <span><FaUsers /> {offer.slots} vacante{offer.slots !== 1 ? 's' : ''}</span>
              </div>

              {/* Descripción expandible */}
              {expandedId === offer._id && (
                <div className="approval-panel__expanded">
                  <div className="approval-panel__description">
                    <strong>Descripción:</strong>
                    {offer.description?.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>

                  {offer.requirements?.length > 0 && (
                    <div className="approval-panel__requirements">
                      <strong>Requisitos:</strong>
                      <ul>{offer.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
                    </div>
                  )}

                  {offer.targetFaculties?.length > 0 && (
                    <div className="approval-panel__faculties">
                      <strong>Facultades:</strong>
                      <div className="approval-panel__faculty-tags">
                        {offer.targetFaculties.map(f => <span key={f} className="approval-panel__faculty-tag">{f}</span>)}
                      </div>
                    </div>
                  )}

                  {offer.compensation && (
                    <div className="approval-panel__comp">
                      <strong>Compensación:</strong> {offer.compensation.type}
                      {offer.compensation.type === 'remunerada' && offer.compensation.amount > 0 && (
                        <> — ${offer.compensation.amount.toLocaleString('es-CO')} {offer.compensation.currency}</>
                      )}
                    </div>
                  )}

                  <button className="approval-panel__view-full" onClick={() => navigate(`/jobs/${offer._id}`)}>
                    <FaEye /> Ver detalle completo
                  </button>
                </div>
              )}

              {/* Botones de acción */}
              {rejectingId === offer._id ? (
                <div className="approval-panel__reject-form">
                  <textarea
                    placeholder="Razón del rechazo (obligatorio)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="approval-panel__reject-textarea"
                  />
                  <div className="approval-panel__reject-actions">
                    <button className="approval-panel__confirm-reject" onClick={() => handleReject(offer._id)}>
                      <FaTimesCircle /> Confirmar rechazo
                    </button>
                    <button className="approval-panel__cancel-reject" onClick={() => { setRejectingId(null); setRejectReason(''); }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="approval-panel__actions">
                  <button className="approval-panel__approve-btn" onClick={() => handleApprove(offer._id)}>
                    <FaCheckCircle /> Aprobar
                  </button>
                  <button className="approval-panel__reject-btn" onClick={() => setRejectingId(offer._id)}>
                    <FaTimesCircle /> Rechazar
                  </button>
                  <button className="approval-panel__expand-btn"
                    onClick={() => setExpandedId(expandedId === offer._id ? null : offer._id)}>
                    {expandedId === offer._id ? 'Contraer' : 'Ver más'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="approval-panel__pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button key={page}
              className={`approval-panel__page-btn ${page === pagination.page ? 'approval-panel__page-btn--active' : ''}`}
              onClick={() => fetchPending(page)}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApprovalPanel;
