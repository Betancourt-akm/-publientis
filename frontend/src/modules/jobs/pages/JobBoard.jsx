import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaSearch, FaFilter, FaBuilding, FaMoneyBillWave, FaGraduationCap, FaLaptopHouse } from 'react-icons/fa';
import jobService from '../services/jobService';
import SEO from '../../../components/common/SEO';
import './JobBoard.css';

const TYPE_LABELS = {
  practica: 'Práctica',
  empleo: 'Empleo',
  voluntariado: 'Voluntariado',
  investigacion: 'Investigación'
};

const MODALITY_LABELS = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido'
};

const FACULTIES = [
  'Ingeniería', 'Medicina', 'Derecho', 'Administración', 'Educación',
  'Ciencias', 'Artes', 'Arquitectura', 'Psicología', 'Comunicación'
];

const JobBoard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [faculty, setFaculty] = useState(searchParams.get('faculty') || '');
  const [modality, setModality] = useState(searchParams.get('modality') || '');

  const fetchJobs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (type) params.type = type;
      if (faculty) params.faculty = faculty;
      if (modality) params.modality = modality;

      const result = await jobService.getActiveOffers(params);
      if (result.success) {
        setJobs(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [search, type, faculty, modality]);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    if (faculty) params.set('faculty', faculty);
    if (modality) params.set('modality', modality);
    setSearchParams(params);
    fetchJobs(1);
  };

  const clearFilters = () => {
    setSearch('');
    setType('');
    setFaculty('');
    setModality('');
    setSearchParams({});
  };

  const getTypeIcon = (jobType) => {
    switch (jobType) {
      case 'practica': return <FaGraduationCap />;
      case 'empleo': return <FaBriefcase />;
      case 'voluntariado': return <FaBuilding />;
      case 'investigacion': return <FaSearch />;
      default: return <FaBriefcase />;
    }
  };

  const getModalityIcon = (mod) => {
    switch (mod) {
      case 'remoto': return <FaLaptopHouse />;
      default: return <FaMapMarkerAlt />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Vencida';
    if (days === 0) return 'Último día';
    if (days === 1) return '1 día restante';
    return `${days} días restantes`;
  };

  return (
    <div className="job-board">
      <SEO
        title="Ofertas Laborales"
        description="Encuentra prácticas profesionales, empleos y oportunidades de vinculación laboral para estudiantes universitarios"
      />

      <header className="job-board__header">
        <h1 className="job-board__title">
          <FaBriefcase /> Ofertas de Vinculación
        </h1>
        <p className="job-board__subtitle">
          Encuentra prácticas, empleos y oportunidades alineadas con tu perfil profesional
        </p>
      </header>

      {/* Barra de búsqueda */}
      <form className="job-board__search" onSubmit={handleSearch}>
        <div className="job-board__search-input-wrapper">
          <FaSearch className="job-board__search-icon" />
          <input
            type="text"
            placeholder="Buscar por título, descripción, habilidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="job-board__search-input"
          />
        </div>
        <button type="submit" className="job-board__search-btn">Buscar</button>
        <button
          type="button"
          className="job-board__filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> Filtros
        </button>
      </form>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="job-board__filters">
          <div className="job-board__filter-group">
            <label>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Todos</option>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="job-board__filter-group">
            <label>Facultad</label>
            <select value={faculty} onChange={(e) => setFaculty(e.target.value)}>
              <option value="">Todas</option>
              {FACULTIES.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="job-board__filter-group">
            <label>Modalidad</label>
            <select value={modality} onChange={(e) => setModality(e.target.value)}>
              <option value="">Todas</option>
              {Object.entries(MODALITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <button className="job-board__clear-filters" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Resultados */}
      <div className="job-board__results-info">
        <span>{pagination.total} oferta{pagination.total !== 1 ? 's' : ''} encontrada{pagination.total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="job-board__loading">
          <div className="job-board__spinner"></div>
          <p>Cargando ofertas...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="job-board__empty">
          <FaBriefcase className="job-board__empty-icon" />
          <h3>No hay ofertas disponibles</h3>
          <p>Intenta cambiar los filtros o vuelve más tarde</p>
        </div>
      ) : (
        <div className="job-board__grid">
          {jobs.map((job) => (
            <article
              key={job._id}
              className="job-card"
              onClick={() => navigate(`/jobs/${job._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/jobs/${job._id}`)}
            >
              <div className="job-card__header">
                <span className={`job-card__type job-card__type--${job.type}`}>
                  {getTypeIcon(job.type)} {TYPE_LABELS[job.type]}
                </span>
                <span className="job-card__modality">
                  {getModalityIcon(job.modality)} {MODALITY_LABELS[job.modality]}
                </span>
              </div>

              <h3 className="job-card__title">{job.title}</h3>

              <div className="job-card__org">
                <FaBuilding />
                <span>{job.organization?.name || 'Organización'}</span>
              </div>

              {job.location?.city && (
                <div className="job-card__location">
                  <FaMapMarkerAlt />
                  <span>{job.location.city}{job.location.state ? `, ${job.location.state}` : ''}</span>
                </div>
              )}

              {job.compensation?.type === 'remunerada' && job.compensation.amount > 0 && (
                <div className="job-card__compensation">
                  <FaMoneyBillWave />
                  <span>${job.compensation.amount.toLocaleString('es-CO')} {job.compensation.currency}</span>
                </div>
              )}

              <p className="job-card__description">
                {job.description?.substring(0, 120)}...
              </p>

              {job.targetFaculties?.length > 0 && (
                <div className="job-card__faculties">
                  {job.targetFaculties.slice(0, 3).map(f => (
                    <span key={f} className="job-card__faculty-tag">{f}</span>
                  ))}
                  {job.targetFaculties.length > 3 && (
                    <span className="job-card__faculty-tag">+{job.targetFaculties.length - 3}</span>
                  )}
                </div>
              )}

              <div className="job-card__footer">
                {job.applicationDeadline && (
                  <span className="job-card__deadline">
                    <FaClock /> {getDaysRemaining(job.applicationDeadline)}
                  </span>
                )}
                <span className="job-card__slots">
                  {job.slots} vacante{job.slots !== 1 ? 's' : ''}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="job-board__pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`job-board__page-btn ${page === pagination.page ? 'job-board__page-btn--active' : ''}`}
              onClick={() => fetchJobs(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobBoard;
