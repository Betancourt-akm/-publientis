import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaBuilding, FaMoneyBillWave, FaGraduationCap, FaLaptopHouse, FaUsers, FaEye, FaPaperPlane, FaArrowLeft, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import SEO from '../../../components/common/SEO';
import './JobDetail.css';

const TYPE_LABELS = {
  practica: 'Práctica Profesional',
  empleo: 'Empleo',
  voluntariado: 'Voluntariado',
  investigacion: 'Investigación'
};

const MODALITY_LABELS = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido'
};

const COMPENSATION_LABELS = {
  remunerada: 'Remunerada',
  no_remunerada: 'No remunerada',
  por_definir: 'Por definir'
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.user);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const result = await jobService.getOfferById(id);
        if (result.success) {
          setJob(result.data);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        alert('No se pudo cargar la oferta');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      alert('Debes iniciar sesión para postularte');
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      const result = await applicationService.apply({
        jobOfferId: id,
        coverLetter
      });
      if (result.success) {
        setApplied(true);
        setShowApplyForm(false);
        alert('¡Postulación enviada exitosamente!');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al enviar postulación';
      alert(msg);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No especificada';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="job-detail__loading">
        <div className="job-detail__spinner"></div>
        <p>Cargando oferta...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail__not-found">
        <h2>Oferta no encontrada</h2>
        <button onClick={() => navigate('/jobs')}>Ver todas las ofertas</button>
      </div>
    );
  }

  return (
    <div className="job-detail">
      <SEO
        title={`${job.title} - Oferta Laboral`}
        description={job.description?.substring(0, 160)}
      />

      <button className="job-detail__back" onClick={() => navigate('/jobs')}>
        <FaArrowLeft /> Volver a ofertas
      </button>

      <div className="job-detail__layout">
        {/* Contenido principal */}
        <main className="job-detail__main">
          <div className="job-detail__badges">
            <span className={`job-detail__type job-detail__type--${job.type}`}>
              {TYPE_LABELS[job.type]}
            </span>
            <span className="job-detail__modality">
              {job.modality === 'remoto' ? <FaLaptopHouse /> : <FaMapMarkerAlt />}
              {MODALITY_LABELS[job.modality]}
            </span>
          </div>

          <h1 className="job-detail__title">{job.title}</h1>

          <div className="job-detail__meta">
            <span><FaBuilding /> {job.organization?.name}</span>
            {job.location?.city && (
              <span><FaMapMarkerAlt /> {job.location.city}{job.location.state ? `, ${job.location.state}` : ''}</span>
            )}
            <span><FaEye /> {job.viewCount} visualizaciones</span>
            <span><FaUsers /> {job.applicationCount} postulaciones</span>
          </div>

          <section className="job-detail__section">
            <h2>Descripción</h2>
            <div className="job-detail__description">
              {job.description?.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {job.requirements?.length > 0 && (
            <section className="job-detail__section">
              <h2>Requisitos</h2>
              <ul className="job-detail__requirements">
                {job.requirements.map((req, i) => (
                  <li key={i}><FaCheckCircle className="job-detail__check" /> {req}</li>
                ))}
              </ul>
            </section>
          )}

          {job.targetFaculties?.length > 0 && (
            <section className="job-detail__section">
              <h2><FaGraduationCap /> Facultades</h2>
              <div className="job-detail__faculties">
                {job.targetFaculties.map(f => (
                  <span key={f} className="job-detail__faculty-tag">{f}</span>
                ))}
              </div>
            </section>
          )}

          {job.tags?.length > 0 && (
            <section className="job-detail__section">
              <h2>Tags</h2>
              <div className="job-detail__tags">
                {job.tags.map(tag => (
                  <span key={tag} className="job-detail__tag">#{tag}</span>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Sidebar */}
        <aside className="job-detail__sidebar">
          <div className="job-detail__info-card">
            <h3>Detalles</h3>

            <div className="job-detail__info-row">
              <span className="job-detail__info-label"><FaMoneyBillWave /> Compensación</span>
              <span className="job-detail__info-value">
                {COMPENSATION_LABELS[job.compensation?.type]}
                {job.compensation?.type === 'remunerada' && job.compensation?.amount > 0 && (
                  <strong> — ${job.compensation.amount.toLocaleString('es-CO')} {job.compensation.currency}</strong>
                )}
              </span>
            </div>

            <div className="job-detail__info-row">
              <span className="job-detail__info-label"><FaUsers /> Vacantes</span>
              <span className="job-detail__info-value">{job.slots}</span>
            </div>

            {job.duration?.value > 0 && (
              <div className="job-detail__info-row">
                <span className="job-detail__info-label"><FaClock /> Duración</span>
                <span className="job-detail__info-value">{job.duration.value} {job.duration.unit}</span>
              </div>
            )}

            {job.startDate && (
              <div className="job-detail__info-row">
                <span className="job-detail__info-label"><FaCalendarAlt /> Inicio</span>
                <span className="job-detail__info-value">{formatDate(job.startDate)}</span>
              </div>
            )}

            {job.applicationDeadline && (
              <div className="job-detail__info-row">
                <span className="job-detail__info-label"><FaClock /> Fecha límite</span>
                <span className="job-detail__info-value job-detail__info-value--deadline">
                  {formatDate(job.applicationDeadline)}
                </span>
              </div>
            )}
          </div>

          {/* Botón de postulación */}
          {applied ? (
            <div className="job-detail__applied">
              <FaCheckCircle /> Ya te postulaste a esta oferta
            </div>
          ) : showApplyForm ? (
            <div className="job-detail__apply-form">
              <h3>Postularse</h3>
              <textarea
                placeholder="Carta de presentación (opcional) — Cuéntale a la organización por qué eres ideal para este puesto..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                maxLength={3000}
                className="job-detail__cover-letter"
              />
              <div className="job-detail__apply-actions">
                <button
                  className="job-detail__apply-btn"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? 'Enviando...' : <><FaPaperPlane /> Enviar postulación</>}
                </button>
                <button
                  className="job-detail__cancel-btn"
                  onClick={() => setShowApplyForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              className="job-detail__apply-btn job-detail__apply-btn--full"
              onClick={() => setShowApplyForm(true)}
            >
              <FaPaperPlane /> Postularme
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};

export default JobDetail;
