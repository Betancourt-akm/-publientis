import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaExclamationCircle, FaFilter } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './JobApprovalTable.css';

const JobApprovalTable = () => {
  const [pendingOffers, setPendingOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, title, type
  const [filterType, setFilterType] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingOffers();
  }, []);

  const fetchPendingOffers = async () => {
    try {
      const { data } = await axiosInstance.get('/api/admin/stats/pending-offers?limit=50');
      setPendingOffers(data.offers);
    } catch (error) {
      console.error('Error al cargar ofertas pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (offerId) => {
    if (!window.confirm('¿Aprobar esta vacante? Se publicará inmediatamente.')) return;

    setProcessing(true);
    try {
      await axiosInstance.put(`/api/admin/stats/approve-offer/${offerId}`, {
        action: 'approve'
      });
      
      // Remover de la lista
      setPendingOffers(prev => prev.filter(o => o._id !== offerId));
      alert('Vacante aprobada exitosamente');
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert(error.response?.data?.message || 'Error al aprobar vacante');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (offer) => {
    setSelectedOffer(offer);
    setRejectionModal(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Por favor indica el motivo del rechazo');
      return;
    }

    setProcessing(true);
    try {
      await axiosInstance.put(`/api/admin/stats/approve-offer/${selectedOffer._id}`, {
        action: 'reject',
        rejectionReason
      });
      
      setPendingOffers(prev => prev.filter(o => o._id !== selectedOffer._id));
      setRejectionModal(false);
      setRejectionReason('');
      setSelectedOffer(null);
      alert('Vacante rechazada. La institución ha sido notificada.');
    } catch (error) {
      console.error('Error al rechazar:', error);
      alert('Error al rechazar vacante');
    } finally {
      setProcessing(false);
    }
  };

  const getSortedAndFiltered = () => {
    let filtered = [...pendingOffers];

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(o => o.type === filterType);
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'type') {
        return a.type.localeCompare(b.type);
      }
      return 0;
    });

    return filtered;
  };

  const getUrgencyClass = (createdAt) => {
    const daysOld = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    if (daysOld >= 3) return 'urgent';
    if (daysOld >= 2) return 'warning';
    return 'normal';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="approval-table loading">
        <div className="spinner"></div>
        <p>Cargando vacantes pendientes...</p>
      </div>
    );
  }

  const sortedOffers = getSortedAndFiltered();

  return (
    <div className="job-approval-container">
      <div className="approval-header">
        <div className="header-info">
          <h3>📋 Aprobaciones Pendientes</h3>
          <span className="pending-count">{pendingOffers.length} vacante{pendingOffers.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="approval-controls">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">Todos los tipos</option>
              <option value="practica">Práctica</option>
              <option value="empleo">Empleo</option>
              <option value="voluntariado">Voluntariado</option>
              <option value="investigacion">Investigación</option>
            </select>
          </div>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Más reciente</option>
            <option value="title">Alfabético</option>
            <option value="type">Por tipo</option>
          </select>
        </div>
      </div>

      {sortedOffers.length === 0 ? (
        <div className="empty-state">
          <FaCheck className="empty-icon" />
          <h4>¡Todo al día!</h4>
          <p>No hay vacantes pendientes de aprobación</p>
        </div>
      ) : (
        <div className="approval-table-wrapper">
          <table className="approval-table">
            <thead>
              <tr>
                <th>Urgencia</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Institución</th>
                <th>Fecha Publicación</th>
                <th>Vacantes</th>
                <th>Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {sortedOffers.map((offer) => {
                const urgency = getUrgencyClass(offer.createdAt);
                const convenioExpired = offer.organization?.convenio?.expirationDate && 
                  new Date(offer.organization.convenio.expirationDate) < new Date();

                return (
                  <tr key={offer._id} className={`offer-row ${urgency}`}>
                    <td>
                      <div className={`urgency-badge ${urgency}`}>
                        {urgency === 'urgent' && '🔴'}
                        {urgency === 'warning' && '🟡'}
                        {urgency === 'normal' && '🟢'}
                      </div>
                    </td>
                    <td className="title-cell">
                      <strong>{offer.title}</strong>
                      {convenioExpired && (
                        <span className="warning-badge">
                          <FaExclamationCircle /> Convenio vencido
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`type-badge ${offer.type}`}>
                        {offer.type}
                      </span>
                    </td>
                    <td>
                      <div className="org-cell">
                        <img
                          src={offer.organization?.profilePic || '/default-org.png'}
                          alt={offer.organization?.name}
                          className="org-avatar"
                        />
                        <span>{offer.organization?.name}</span>
                      </div>
                    </td>
                    <td>{formatDate(offer.createdAt)}</td>
                    <td className="slots-cell">{offer.slots}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => window.open(`/jobs/${offer._id}`, '_blank')}
                          title="Ver detalle"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="action-btn approve"
                          onClick={() => handleApprove(offer._id)}
                          disabled={processing || convenioExpired}
                          title={convenioExpired ? 'Convenio vencido' : 'Aprobar'}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleReject(offer)}
                          disabled={processing}
                          title="Rechazar"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de rechazo */}
      {rejectionModal && (
        <div className="rejection-modal-overlay">
          <div className="rejection-modal">
            <h3>Rechazar Vacante</h3>
            <p className="modal-subtitle">{selectedOffer?.title}</p>

            <label>Motivo del rechazo (será enviado a la institución):</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej: La descripción no cumple con los requisitos de calidad..."
              rows="4"
            />

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setRejectionModal(false);
                  setRejectionReason('');
                  setSelectedOffer(null);
                }}
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                className="submit-reject-btn"
                onClick={submitRejection}
                disabled={processing}
              >
                {processing ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApprovalTable;
