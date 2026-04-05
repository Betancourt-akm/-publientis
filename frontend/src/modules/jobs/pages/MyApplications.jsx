import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaUndo, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import applicationService from '../services/applicationService';
import SEO from '../../../components/common/SEO';
import './MyApplications.css';

const STATUS_CONFIG = {
  postulado: { label: 'Postulado', color: '#6366f1', icon: <FaClock /> },
  en_revision: { label: 'En revisión', color: '#f59e0b', icon: <FaEye /> },
  preseleccionado: { label: 'Preseleccionado', color: '#8b5cf6', icon: <FaCheckCircle /> },
  entrevista: { label: 'Entrevista', color: '#3b82f6', icon: <FaBriefcase /> },
  aceptado: { label: 'Aceptado', color: '#10b981', icon: <FaCheckCircle /> },
  rechazado: { label: 'Rechazado', color: '#ef4444', icon: <FaTimesCircle /> },
  retirado: { label: 'Retirado', color: '#9ca3af', icon: <FaUndo /> }
};

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchApplications = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter) params.status = filter;

      const result = await applicationService.getMyApplications(params);
      if (result.success) {
        setApplications(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1);
  }, [filter]);

  const handleWithdraw = async (id) => {
    if (!window.confirm('¿Estás seguro de retirar esta postulación?')) return;
    try {
      const result = await applicationService.withdraw(id);
      if (result.success) {
        alert('Postulación retirada');
        fetchApplications(pagination.page);
      }
    } catch (error) {
      alert('Error al retirar la postulación');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="my-apps">
      <SEO title="Mis Postulaciones" description="Seguimiento de tus postulaciones a ofertas laborales" />

      <h1 className="my-apps__title"><FaBriefcase /> Mis Postulaciones</h1>

      <div className="my-apps__filters">
        <button className={`my-apps__filter ${!filter ? 'my-apps__filter--active' : ''}`} onClick={() => setFilter('')}>Todas</button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key} className={`my-apps__filter ${filter === key ? 'my-apps__filter--active' : ''}`}
            onClick={() => setFilter(key)} style={filter === key ? { background: cfg.color, borderColor: cfg.color } : {}}>
            {cfg.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="my-apps__loading">
          <div className="my-apps__spinner"></div>
          <p>Cargando postulaciones...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="my-apps__empty">
          <FaBriefcase className="my-apps__empty-icon" />
          <h3>No tienes postulaciones</h3>
          <p>Explora las ofertas disponibles y postúlate</p>
          <button onClick={() => navigate('/jobs')} className="my-apps__explore-btn">Ver ofertas</button>
        </div>
      ) : (
        <div className="my-apps__list">
          {applications.map(app => {
            const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.postulado;
            const job = app.jobOffer;

            return (
              <article key={app._id} className="my-apps__card">
                <div className="my-apps__card-header">
                  <span className="my-apps__status" style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}>
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                  <span className="my-apps__date">{formatDate(app.createdAt)}</span>
                </div>

                <h3 className="my-apps__job-title" onClick={() => navigate(`/jobs/${job?._id}`)}>
                  {job?.title || 'Oferta no disponible'}
                </h3>

                <div className="my-apps__job-meta">
                  {job?.organization?.name && (
                    <span><FaBuilding /> {job.organization.name}</span>
                  )}
                  {job?.location?.city && (
                    <span><FaMapMarkerAlt /> {job.location.city}</span>
                  )}
                </div>

                {app.interviewDate && (
                  <div className="my-apps__interview">
                    <FaClock /> Entrevista: {formatDate(app.interviewDate)}
                    {app.interviewLocation && ` — ${app.interviewLocation}`}
                  </div>
                )}

                <div className="my-apps__card-actions">
                  <button className="my-apps__view-btn" onClick={() => navigate(`/jobs/${job?._id}`)}>
                    <FaEye /> Ver oferta
                  </button>
                  {!['aceptado', 'rechazado', 'retirado'].includes(app.status) && (
                    <button className="my-apps__withdraw-btn" onClick={() => handleWithdraw(app._id)}>
                      <FaUndo /> Retirar
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="my-apps__pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button key={page}
              className={`my-apps__page-btn ${page === pagination.page ? 'my-apps__page-btn--active' : ''}`}
              onClick={() => fetchApplications(page)}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
