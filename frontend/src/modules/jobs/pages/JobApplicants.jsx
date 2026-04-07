import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUsers, FaArrowLeft, FaEye, FaEnvelope, FaPhone, FaUser, FaBriefcase, FaCalendarAlt } from 'react-icons/fa';
import applicationService from '../services/applicationService';
import jobService from '../services/jobService';
import SEO from '../../../components/common/SEO';
import './JobApplicants.css';

const STATUS_CONFIG = {
  postulado: { label: 'Postulado', color: '#6366f1', next: ['en_revision', 'rechazado'] },
  en_revision: { label: 'En revisión', color: '#f59e0b', next: ['preseleccionado', 'rechazado'] },
  preseleccionado: { label: 'Preseleccionado', color: '#8b5cf6', next: ['entrevista', 'rechazado'] },
  entrevista: { label: 'Entrevista', color: '#3b82f6', next: ['aceptado', 'rechazado'] },
  aceptado: { label: 'Aceptado', color: '#10b981', next: [] },
  rechazado: { label: 'Rechazado', color: '#ef4444', next: [] },
  retirado: { label: 'Retirado', color: '#9ca3af', next: [] }
};

const JobApplicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');

  const fetchJob = useCallback(async () => {
    try {
      const result = await jobService.getOfferById(id);
      if (result.success) setJob(result.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    }
  }, [id]);

  const fetchApplications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter) params.status = filter;

      const result = await applicationService.getApplicationsForJob(id, params);
      if (result.success) {
        setApplications(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [id, filter]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  const handleStatusChange = async (appId, newStatus) => {
    const payload = { status: newStatus, notes: statusNote };
    if (newStatus === 'entrevista') {
      if (interviewDate) payload.interviewDate = interviewDate;
      if (interviewLocation) payload.interviewLocation = interviewLocation;
    }

    try {
      const result = await applicationService.updateStatus(appId, payload);
      if (result.success) {
        alert(`Estado actualizado a: ${STATUS_CONFIG[newStatus]?.label}`);
        setSelectedApp(null);
        setStatusNote('');
        setInterviewDate('');
        setInterviewLocation('');
        fetchApplications(pagination.page);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="job-applicants">
      <SEO title={`Postulantes - ${job?.title || 'Oferta'}`} description="Gestiona los postulantes de tu oferta laboral" />

      <button className="job-applicants__back" onClick={() => navigate('/jobs/my-offers')}>
        <FaArrowLeft /> Volver a mis ofertas
      </button>

      {job && (
        <div className="job-applicants__header">
          <h1 className="job-applicants__title"><FaUsers /> Postulantes</h1>
          <p className="job-applicants__job-name">{job.title}</p>
          <div className="job-applicants__stats-row">
            <span><FaUsers /> {job.applicationCount} postulaciones</span>
            <span><FaBriefcase /> {job.slots} vacante{job.slots !== 1 ? 's' : ''}</span>
            <span><FaEye /> {job.viewCount} vistas</span>
          </div>
        </div>
      )}

      <div className="job-applicants__filters">
        <button className={`job-applicants__filter ${!filter ? 'job-applicants__filter--active' : ''}`} onClick={() => setFilter('')}>
          Todos
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key}
            className={`job-applicants__filter ${filter === key ? 'job-applicants__filter--active' : ''}`}
            onClick={() => setFilter(key)}
            style={filter === key ? { background: cfg.color, borderColor: cfg.color } : {}}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="job-applicants__loading"><div className="job-applicants__spinner"></div><p>Cargando postulantes...</p></div>
      ) : applications.length === 0 ? (
        <div className="job-applicants__empty">
          <FaUsers className="job-applicants__empty-icon" />
          <h3>No hay postulaciones {filter ? `con estado "${STATUS_CONFIG[filter]?.label}"` : ''}</h3>
        </div>
      ) : (
        <div className="job-applicants__list">
          {applications.map(app => {
            const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.postulado;
            const applicant = app.applicant;

            return (
              <article key={app._id} className="job-applicants__card">
                <div className="job-applicants__card-top">
                  <div className="job-applicants__applicant-info">
                    {applicant?.profilePic ? (
                      <img src={applicant.profilePic} alt={applicant.name} className="job-applicants__avatar" />
                    ) : (
                      <div className="job-applicants__avatar-placeholder"><FaUser /></div>
                    )}
                    <div>
                      <h3 className="job-applicants__applicant-name">{applicant?.name || 'Sin nombre'}</h3>
                      <div className="job-applicants__applicant-meta">
                        {applicant?.email && <span><FaEnvelope /> {applicant.email}</span>}
                        {applicant?.tel && <span><FaPhone /> {applicant.tel}</span>}
                        {applicant?.faculty && <span><FaBriefcase /> {applicant.faculty}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="job-applicants__card-right">
                    <span className="job-applicants__status" style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}>
                      {statusCfg.label}
                    </span>
                    <span className="job-applicants__date">{formatDate(app.createdAt)}</span>
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="job-applicants__cover-letter">
                    <strong>Carta de presentación:</strong>
                    <p>{app.coverLetter.substring(0, 300)}{app.coverLetter.length > 300 ? '...' : ''}</p>
                  </div>
                )}

                {app.interviewDate && (
                  <div className="job-applicants__interview-info">
                    <FaCalendarAlt /> Entrevista: {formatDate(app.interviewDate)}
                    {app.interviewLocation && ` — ${app.interviewLocation}`}
                  </div>
                )}

                {/* Acciones de cambio de estado */}
                {selectedApp === app._id ? (
                  <div className="job-applicants__action-panel">
                    <h4>Cambiar estado</h4>
                    <div className="job-applicants__action-buttons">
                      {statusCfg.next.map(nextStatus => (
                        <button key={nextStatus}
                          className="job-applicants__status-btn"
                          style={{ background: STATUS_CONFIG[nextStatus].color }}
                          onClick={() => handleStatusChange(app._id, nextStatus)}
                        >
                          {STATUS_CONFIG[nextStatus].label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      placeholder="Notas (opcional)"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="job-applicants__note-input"
                      rows={2}
                    />

                    {statusCfg.next.includes('entrevista') && (
                      <div className="job-applicants__interview-fields">
                        <input type="datetime-local" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)}
                          placeholder="Fecha entrevista" className="job-applicants__field-input" />
                        <input type="text" value={interviewLocation} onChange={(e) => setInterviewLocation(e.target.value)}
                          placeholder="Ubicación entrevista" className="job-applicants__field-input" />
                      </div>
                    )}

                    <button className="job-applicants__cancel-action" onClick={() => { setSelectedApp(null); setStatusNote(''); }}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  statusCfg.next.length > 0 && (
                    <div className="job-applicants__card-actions">
                      <button className="job-applicants__manage-btn" onClick={() => setSelectedApp(app._id)}>
                        Gestionar
                      </button>
                    </div>
                  )
                )}
              </article>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="job-applicants__pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button key={page}
              className={`job-applicants__page-btn ${page === pagination.page ? 'job-applicants__page-btn--active' : ''}`}
              onClick={() => fetchApplications(page)}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
