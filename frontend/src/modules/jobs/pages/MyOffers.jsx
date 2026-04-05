import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaClock, FaCheckCircle, FaPause, FaBan } from 'react-icons/fa';
import jobService from '../services/jobService';
import SEO from '../../../components/common/SEO';
import './MyOffers.css';

const STATUS_CONFIG = {
  borrador: { label: 'Borrador', color: '#9ca3af', icon: <FaEdit /> },
  pendiente_aprobacion: { label: 'Pendiente', color: '#f59e0b', icon: <FaClock /> },
  activa: { label: 'Activa', color: '#10b981', icon: <FaCheckCircle /> },
  pausada: { label: 'Pausada', color: '#6b7280', icon: <FaPause /> },
  cerrada: { label: 'Cerrada', color: '#374151', icon: <FaBan /> },
  rechazada: { label: 'Rechazada', color: '#ef4444', icon: <FaBan /> }
};

const MyOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchOffers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter) params.status = filter;
      const result = await jobService.getMyOffers(params);
      if (result.success) {
        setOffers(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers(1);
  }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta oferta? Se eliminarán también todas las postulaciones asociadas.')) return;
    try {
      const result = await jobService.deleteOffer(id);
      if (result.success) {
        alert('Oferta eliminada');
        fetchOffers(pagination.page);
      }
    } catch (error) {
      alert('Error al eliminar la oferta');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="my-offers">
      <SEO title="Mis Ofertas" description="Gestiona las ofertas laborales de tu organización" />

      <div className="my-offers__header">
        <h1 className="my-offers__title"><FaBriefcase /> Mis Ofertas</h1>
        <button className="my-offers__create-btn" onClick={() => navigate('/jobs/create')}>
          <FaPlus /> Nueva Oferta
        </button>
      </div>

      <div className="my-offers__filters">
        <button className={`my-offers__filter ${!filter ? 'my-offers__filter--active' : ''}`} onClick={() => setFilter('')}>Todas</button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key} className={`my-offers__filter ${filter === key ? 'my-offers__filter--active' : ''}`}
            onClick={() => setFilter(key)} style={filter === key ? { background: cfg.color, borderColor: cfg.color } : {}}>
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="my-offers__loading"><div className="my-offers__spinner"></div><p>Cargando...</p></div>
      ) : offers.length === 0 ? (
        <div className="my-offers__empty">
          <FaBriefcase className="my-offers__empty-icon" />
          <h3>No tienes ofertas publicadas</h3>
          <p>Crea tu primera oferta para atraer talento universitario</p>
          <button onClick={() => navigate('/jobs/create')} className="my-offers__create-btn">
            <FaPlus /> Crear oferta
          </button>
        </div>
      ) : (
        <div className="my-offers__list">
          {offers.map(offer => {
            const statusCfg = STATUS_CONFIG[offer.status] || STATUS_CONFIG.borrador;
            return (
              <article key={offer._id} className="my-offers__card">
                <div className="my-offers__card-top">
                  <span className="my-offers__status" style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}>
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                  <span className="my-offers__date">Creada: {formatDate(offer.createdAt)}</span>
                </div>

                <h3 className="my-offers__card-title">{offer.title}</h3>

                {offer.rejectionReason && offer.status === 'rechazada' && (
                  <div className="my-offers__rejection">
                    Motivo: {offer.rejectionReason}
                  </div>
                )}

                <div className="my-offers__stats">
                  <span><FaEye /> {offer.viewCount} vistas</span>
                  <span><FaUsers /> {offer.applicationCount} postulaciones</span>
                  <span><FaBriefcase /> {offer.slots} vacante{offer.slots !== 1 ? 's' : ''}</span>
                </div>

                <div className="my-offers__card-actions">
                  <button className="my-offers__action-btn my-offers__action-btn--view"
                    onClick={() => navigate(`/jobs/${offer._id}`)}>
                    <FaEye /> Ver
                  </button>
                  <button className="my-offers__action-btn my-offers__action-btn--applicants"
                    onClick={() => navigate(`/jobs/${offer._id}/applicants`)}>
                    <FaUsers /> Postulantes
                  </button>
                  <button className="my-offers__action-btn my-offers__action-btn--delete"
                    onClick={() => handleDelete(offer._id)}>
                    <FaTrash />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOffers;
