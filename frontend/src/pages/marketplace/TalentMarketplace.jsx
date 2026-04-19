import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../../context';
import {
  FaSearch, FaSlidersH, FaTimes, FaGraduationCap, FaBuilding,
  FaHandshake, FaStar, FaCheckCircle, FaBriefcase, FaMapMarkerAlt,
  FaClock, FaUserGraduate, FaChartLine, FaArrowRight, FaUsers,
  FaBookOpen, FaLightbulb
} from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import TalentoCard from '../../components/marketplace/TalentoCard';
import VacanteCard from '../../components/marketplace/VacanteCard';
import './TalentMarketplace.css';

const TalentMarketplace = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(user?.role === 'ORGANIZATION' ? 'talent' : 'jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [featuredTalent, setFeaturedTalent] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({ totalTalent: 0, totalJobs: 0, totalOrgs: 0, verifiedTalent: 0 });
  const [contentLoading, setContentLoading] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState({ programId: '', emphasis: [], location: '', jobType: '' });

  const emphasisOptions = [
    'Inclusión', 'TIC', 'Artística', 'Ambiental', 'Bilingüe',
    'Primera Infancia', 'Matemáticas', 'Lenguaje', 'Ciencias', 'Sociales'
  ];

  useEffect(() => {
    fetchFeaturedContent();
    fetchStats();
    fetchPrograms();
  }, []);

  const fetchFeaturedContent = async () => {
    setContentLoading(true);
    try {
      const [talentRes, jobsRes] = await Promise.allSettled([
        axiosInstance.get('/api/marketplace/search-talent', { params: { limit: 6 } }),
        axiosInstance.get('/api/marketplace/search-jobs', { params: { limit: 6 } })
      ]);
      if (talentRes.status === 'fulfilled') setFeaturedTalent(talentRes.value.data.talents || []);
      if (jobsRes.status === 'fulfilled') setFeaturedJobs(jobsRes.value.data.jobs || []);
    } catch (error) {
      console.error('Error cargando contenido destacado:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axiosInstance.get('/api/marketplace/stats');
      if (data.stats) setStats(data.stats);
    } catch (error) {
      console.error('Error cargando stats:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data } = await axiosInstance.get('/api/marketplace/programs');
      setPrograms(data.programs || []);
    } catch (error) {
      setPrograms([]);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() && !filters.programId && !filters.location && filters.emphasis.length === 0 && !filters.jobType) return;
    setSearchLoading(true);
    setHasSearched(true);
    try {
      if (activeTab === 'talent') {
        const { data } = await axiosInstance.get('/api/marketplace/search-talent', {
          params: { q: searchQuery, programId: filters.programId, emphasis: filters.emphasis.join(','), location: filters.location, limit: 20 }
        });
        setSearchResults(data.talents || []);
      } else {
        const { data } = await axiosInstance.get('/api/marketplace/search-jobs', {
          params: { q: searchQuery, programId: filters.programId, location: filters.location, jobType: filters.jobType, limit: 20 }
        });
        setSearchResults(data.jobs || []);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setSearchResults([]);
    setFilters({ programId: '', emphasis: [], location: '', jobType: '' });
    setShowFilters(false);
  };

  const toggleEmphasis = (em) => {
    setFilters(prev => ({
      ...prev,
      emphasis: prev.emphasis.includes(em) ? prev.emphasis.filter(e => e !== em) : [...prev.emphasis, em]
    }));
  };

  const displayTalent = hasSearched ? searchResults : featuredTalent;
  const displayJobs = hasSearched ? searchResults : featuredJobs;

  return (
    <div className="talent-marketplace">

      {/* ── HERO ── */}
      <section className="mp-hero">
        <div className="mp-hero__inner">
          <div className="mp-hero__badge">
            <FaHandshake />
            <span>Plataforma de Vinculación Pedagógica</span>
          </div>
          <h1 className="mp-hero__title">
            El lugar donde el <span className="mp-hero__highlight">talento pedagógico</span><br />
            se encuentra con la oportunidad
          </h1>
          <p className="mp-hero__sub">
            Conectamos <strong>egresados</strong> con empresas e instituciones educativas,
            y <strong>practicantes</strong> con centros de práctica — con o sin convenio universitario.
          </p>

          {/* Search tabs */}
          <div className="mp-search">
            <div className="mp-search__tabs">
              <button
                className={`mp-search__tab ${activeTab === 'talent' ? 'active' : ''}`}
                onClick={() => { setActiveTab('talent'); setHasSearched(false); }}
              >
                <FaUserGraduate /> Buscar Talento
              </button>
              <button
                className={`mp-search__tab ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => { setActiveTab('jobs'); setHasSearched(false); }}
              >
                <FaBriefcase /> Buscar Oportunidades
              </button>
            </div>

            <form className="mp-search__bar" onSubmit={handleSearch}>
              <div className="mp-search__input-wrap">
                <FaSearch className="mp-search__icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'talent'
                      ? 'Ej: Docente de matemáticas, énfasis TIC, Medellín...'
                      : 'Ej: Práctica educación inicial, institución Antioquia...'
                  }
                  className="mp-search__input"
                />
                {(searchQuery || hasSearched) && (
                  <button type="button" className="mp-search__clear" onClick={clearSearch}>
                    <FaTimes />
                  </button>
                )}
              </div>
              <button type="submit" className="mp-search__btn">
                Buscar
              </button>
              <button
                type="button"
                className={`mp-search__filter-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaSlidersH />
              </button>
            </form>

            {showFilters && (
              <div className="mp-filters">
                <div className="mp-filters__grid">
                  <div className="mp-filters__group">
                    <label>Programa Académico</label>
                    <select value={filters.programId} onChange={e => setFilters({ ...filters, programId: e.target.value })}>
                      <option value="">Todos los programas</option>
                      {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="mp-filters__group">
                    <label>Ciudad / Ubicación</label>
                    <input type="text" placeholder="Ej: Medellín" value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} />
                  </div>
                  {activeTab === 'jobs' && (
                    <div className="mp-filters__group">
                      <label>Tipo de Vinculación</label>
                      <select value={filters.jobType} onChange={e => setFilters({ ...filters, jobType: e.target.value })}>
                        <option value="">Todos</option>
                        <option value="practica">Práctica Pedagógica</option>
                        <option value="empleo">Empleo Docente</option>
                        <option value="freelance">Freelance / Tutoría</option>
                        <option value="temporal">Temporal / Suplencia</option>
                      </select>
                    </div>
                  )}
                </div>
                {activeTab === 'talent' && (
                  <div className="mp-filters__emphasis">
                    <label>Énfasis Pedagógico</label>
                    <div className="mp-filters__chips">
                      {emphasisOptions.map(em => (
                        <button
                          key={em} type="button"
                          className={`mp-chip ${filters.emphasis.includes(em) ? 'active' : ''}`}
                          onClick={() => toggleEmphasis(em)}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button className="mp-filters__apply" onClick={handleSearch}>
                  Aplicar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="mp-stats">
        <div className="mp-stats__inner">
          <div className="mp-stats__item">
            <FaUserGraduate className="mp-stats__icon" />
            <div>
              <strong>{stats.totalTalent || 0}+</strong>
              <span>Egresados y Practicantes</span>
            </div>
          </div>
          <div className="mp-stats__divider" />
          <div className="mp-stats__item">
            <FaBriefcase className="mp-stats__icon" />
            <div>
              <strong>{stats.totalJobs || 0}</strong>
              <span>Oportunidades Activas</span>
            </div>
          </div>
          <div className="mp-stats__divider" />
          <div className="mp-stats__item">
            <FaBuilding className="mp-stats__icon" />
            <div>
              <strong>{stats.totalOrgs || 0}</strong>
              <span>Instituciones y Empresas</span>
            </div>
          </div>
          <div className="mp-stats__divider" />
          <div className="mp-stats__item">
            <FaCheckCircle className="mp-stats__icon mp-stats__icon--green" />
            <div>
              <strong>100% Gratuito</strong>
              <span>Para todos sin excepción</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="mp-content">

        {/* TALENT SECTION */}
        <section className="mp-section">
          <div className="mp-section__header">
            <div>
              <h2 className="mp-section__title">
                <FaUserGraduate className="mp-section__title-icon" />
                {hasSearched && activeTab === 'talent' ? `${searchResults.length} resultado(s) — Talento` : 'Talento Disponible'}
              </h2>
              <p className="mp-section__sub">
                Egresados y practicantes listos para vincularse con tu institución
              </p>
            </div>
            {!hasSearched && (
              <Link to="/jobs" className="mp-section__link">
                Ver todos <FaArrowRight />
              </Link>
            )}
          </div>

          {contentLoading && !hasSearched ? (
            <div className="mp-loading">
              <div className="mp-spinner" /><span>Cargando talento...</span>
            </div>
          ) : searchLoading && hasSearched && activeTab === 'talent' ? (
            <div className="mp-loading">
              <div className="mp-spinner" /><span>Buscando...</span>
            </div>
          ) : displayTalent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTalent.map(talent => (
                <TalentoCard key={talent._id} talent={talent} />
              ))}
            </div>
          ) : (
            <div className="mp-empty">
              <FaUserGraduate className="mp-empty__icon" />
              <p>{hasSearched ? 'No se encontraron perfiles con esos criterios.' : 'Aún no hay perfiles disponibles. ¡Sé el primero en registrarte!'}</p>
              {!user && <Link to="/sign-up?role=STUDENT" className="mp-empty__cta">Crear mi Perfil</Link>}
            </div>
          )}
        </section>

        {/* OPPORTUNITIES SECTION */}
        <section className="mp-section">
          <div className="mp-section__header">
            <div>
              <h2 className="mp-section__title">
                <FaBriefcase className="mp-section__title-icon mp-section__title-icon--green" />
                {hasSearched && activeTab === 'jobs' ? `${searchResults.length} resultado(s) — Oportunidades` : 'Oportunidades de Vinculación'}
              </h2>
              <p className="mp-section__sub">
                Prácticas pedagógicas y empleos docentes — con y sin convenio universitario
              </p>
            </div>
            {!hasSearched && (
              <Link to="/jobs" className="mp-section__link">
                Ver todas <FaArrowRight />
              </Link>
            )}
          </div>

          {contentLoading && !hasSearched ? (
            <div className="mp-loading">
              <div className="mp-spinner" /><span>Cargando oportunidades...</span>
            </div>
          ) : searchLoading && hasSearched && activeTab === 'jobs' ? (
            <div className="mp-loading">
              <div className="mp-spinner" /><span>Buscando...</span>
            </div>
          ) : displayJobs.length > 0 ? (
            <div className="mp-grid mp-grid--jobs">
              {displayJobs.map(vacancy => (
                <VacanteCard key={vacancy._id} vacancy={vacancy} />
              ))}
            </div>
          ) : (
            <div className="mp-empty">
              <FaBriefcase className="mp-empty__icon" />
              <p>{hasSearched ? 'No se encontraron oportunidades con esos criterios.' : 'Aún no hay oportunidades publicadas.'}</p>
              {(user?.role === 'ORGANIZATION' || !user) && (
                <Link to={user ? '/jobs/create' : '/sign-up?role=ORGANIZATION'} className="mp-empty__cta">
                  {user ? 'Publicar Oportunidad' : 'Registrar mi Institución'}
                </Link>
              )}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="mp-how">
          <h2 className="mp-how__title">¿Cómo funciona Publientis?</h2>
          <div className="mp-how__grid">
            <div className="mp-how__card">
              <div className="mp-how__step mp-how__step--blue">1</div>
              <FaUserGraduate className="mp-how__icon" />
              <h3>Crea tu Perfil</h3>
              <p>Sube tu portafolio pedagógico, certificaciones y experiencias. Tu facultad puede verificarte.</p>
            </div>
            <div className="mp-how__arrow" />
            <div className="mp-how__card">
              <div className="mp-how__step mp-how__step--indigo">2</div>
              <FaSearch className="mp-how__icon" />
              <h3>Conecta</h3>
              <p>Instituciones te encuentran, o tú encuentras prácticas y empleos que se adaptan a tu perfil.</p>
            </div>
            <div className="mp-how__arrow" />
            <div className="mp-how__card">
              <div className="mp-how__step mp-how__step--green">3</div>
              <FaHandshake className="mp-how__icon" />
              <h3>Vincúlate</h3>
              <p>Postúlate, recibe invitaciones y construye tu carrera docente con respaldo institucional.</p>
            </div>
          </div>
        </section>

        {/* FOR WHOM SECTION */}
        <section className="mp-forwho">
          <h2 className="mp-forwho__title">Un espacio para todos en el ecosistema educativo</h2>
          <div className="mp-forwho__grid">
            <div className="mp-forwho__card mp-forwho__card--blue">
              <FaGraduationCap className="mp-forwho__icon" />
              <h3>Egresados</h3>
              <ul>
                <li><FaCheckCircle /> Publica tu portafolio pedagógico</li>
                <li><FaCheckCircle /> Obtén verificación institucional</li>
                <li><FaCheckCircle /> Recibe invitaciones directas</li>
                <li><FaCheckCircle /> Descarga tu CV pedagógico en PDF</li>
              </ul>
              <Link to="/sign-up?role=STUDENT" className="mp-forwho__btn mp-forwho__btn--white">
                Registrar mi perfil <FaArrowRight />
              </Link>
            </div>

            <div className="mp-forwho__card mp-forwho__card--teal">
              <FaBookOpen className="mp-forwho__icon" />
              <h3>Practicantes</h3>
              <ul>
                <li><FaCheckCircle /> Encuentra centros de práctica</li>
                <li><FaCheckCircle /> Con o sin convenio universitario</li>
                <li><FaCheckCircle /> Filtra por nivel educativo</li>
                <li><FaCheckCircle /> Gestiona tu proceso de práctica</li>
              </ul>
              <Link to="/jobs?type=practica" className="mp-forwho__btn mp-forwho__btn--white">
                Buscar práctica <FaArrowRight />
              </Link>
            </div>

            <div className="mp-forwho__card mp-forwho__card--green">
              <FaBuilding className="mp-forwho__icon" />
              <h3>Instituciones y Empresas</h3>
              <ul>
                <li><FaCheckCircle /> Accede a talento verificado</li>
                <li><FaCheckCircle /> Publica con o sin convenio</li>
                <li><FaCheckCircle /> Guarda candidatos favoritos</li>
                <li><FaCheckCircle /> Evalúa el desempeño post-práctica</li>
              </ul>
              <Link to="/sign-up?role=ORGANIZATION" className="mp-forwho__btn mp-forwho__btn--white">
                Publicar oportunidad <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* COMMUNITY HINT */}
        <section className="mp-community">
          <div className="mp-community__inner">
            <FaUsers className="mp-community__icon" />
            <div>
              <h3>Además, una comunidad académica activa</h3>
              <p>Comparte publicaciones, proyectos, investigaciones y conecta con colegas docentes.</p>
            </div>
            <Link to={user ? '/comunidad' : '/sign-up'} className="mp-community__btn">
              <FaLightbulb /> Explorar Comunidad
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default TalentMarketplace;
