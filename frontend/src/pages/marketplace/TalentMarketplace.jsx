import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../context';
import { FaSearch, FaFilter, FaSlidersH, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import TalentoCard from '../../components/marketplace/TalentoCard';
import VacanteCard from '../../components/marketplace/VacanteCard';
import './TalentMarketplace.css';

/**
 * TalentMarketplace - Nuevo Home Page
 * 
 * Marketplace-First: Buscador dual (Talento / Empleo)
 * Red Social: Secundaria en sidebar
 */

const TalentMarketplace = () => {
  const { user } = useContext(Context);
  const [searchMode, setSearchMode] = useState(user?.role === 'ORGANIZATION' ? 'talent' : 'jobs');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '',
    programId: '',
    emphasis: [],
    location: '',
    jobType: '',
    minRating: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [stats, setStats] = useState({ totalTalent: 0, totalJobs: 0, totalOrgs: 0, verifiedTalent: 0 });
  
  const emphasisOptions = [
    'Inclusión', 'TIC', 'Artística', 'Ambiental', 'Bilingüe', 
    'Primera Infancia', 'Matemáticas', 'Lenguaje', 'Ciencias', 'Sociales'
  ];

  useEffect(() => {
    fetchPrograms();
    fetchStats();
    performSearch();
  }, [searchMode]);

  const fetchPrograms = async () => {
    try {
      const { data } = await axiosInstance.get('/api/marketplace/programs');
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Error cargando programas:', error);
      setPrograms([]);
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

  const performSearch = async () => {
    setLoading(true);
    try {
      if (searchMode === 'talent') {
        const { data } = await axiosInstance.get('/api/marketplace/search-talent', {
          params: {
            q: filters.searchQuery,
            programId: filters.programId,
            emphasis: filters.emphasis.join(','),
            location: filters.location,
            minRating: filters.minRating,
            limit: 20
          }
        });
        setResults(data.talents || []);
      } else {
        const { data } = await axiosInstance.get('/api/marketplace/search-jobs', {
          params: {
            q: filters.searchQuery,
            programId: filters.programId,
            location: filters.location,
            jobType: filters.jobType,
            limit: 20
          }
        });
        setResults(data.jobs || []);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const toggleEmphasis = (emphasis) => {
    setFilters(prev => ({
      ...prev,
      emphasis: prev.emphasis.includes(emphasis)
        ? prev.emphasis.filter(e => e !== emphasis)
        : [...prev.emphasis, emphasis]
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      programId: '',
      emphasis: [],
      location: '',
      jobType: '',
      minRating: 0
    });
  };

  return (
    <div className="talent-marketplace">
      {/* Hero con Buscador Dual */}
      <section className="search-hero">
        <div className="hero-content">
          <h1>🎯 Marketplace de Talento Pedagógico</h1>
          <p className="hero-subtitle">
            {searchMode === 'talent' 
              ? 'Encuentra egresados verificados por sus facultades' 
              : 'Descubre oportunidades de prácticas y empleo'}
          </p>

          {/* Tabs de Modo de Búsqueda */}
          <div className="search-mode-tabs">
            <button 
              className={`tab ${searchMode === 'talent' ? 'active' : ''}`}
              onClick={() => setSearchMode('talent')}
            >
              👥 Buscar Talento
            </button>
            <button 
              className={`tab ${searchMode === 'jobs' ? 'active' : ''}`}
              onClick={() => setSearchMode('jobs')}
            >
              💼 Buscar Empleo
            </button>
          </div>

          {/* Barra de Búsqueda */}
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input 
                type="text"
                placeholder={searchMode === 'talent' 
                  ? 'Ej: Docente de matemáticas con énfasis TIC'
                  : 'Ej: Práctica en educación inicial'}
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-search">
              Buscar
            </button>
            <button 
              type="button" 
              className="btn-filters"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaSlidersH /> Filtros
            </button>
          </form>

          {/* Panel de Filtros Avanzados */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filters-header">
                <h3>Filtros Avanzados</h3>
                <button className="btn-clear" onClick={clearFilters}>
                  <FaTimes /> Limpiar
                </button>
              </div>

              <div className="filters-grid">
                {/* Programa Académico */}
                <div className="filter-group">
                  <label>Programa Académico</label>
                  <select 
                    value={filters.programId}
                    onChange={(e) => setFilters({ ...filters, programId: e.target.value })}
                  >
                    <option value="">Todos los programas</option>
                    {programs.map(program => (
                      <option key={program._id} value={program._id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ubicación */}
                <div className="filter-group">
                  <label>Ubicación</label>
                  <input 
                    type="text"
                    placeholder="Ciudad"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>

                {/* Tipo de Vacante (solo en modo jobs) */}
                {searchMode === 'jobs' && (
                  <div className="filter-group">
                    <label>Tipo de Vacante</label>
                    <select 
                      value={filters.jobType}
                      onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                    >
                      <option value="">Todos</option>
                      <option value="practica">Práctica</option>
                      <option value="empleo">Empleo</option>
                      <option value="freelance">Freelance</option>
                      <option value="temporal">Temporal</option>
                    </select>
                  </div>
                )}

                {/* Rating Mínimo (solo en modo talent) */}
                {searchMode === 'talent' && (
                  <div className="filter-group">
                    <label>Rating Mínimo</label>
                    <input 
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={filters.minRating}
                      onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                    />
                    <span className="rating-value">⭐ {filters.minRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Énfasis Pedagógicos (solo en modo talent) */}
              {searchMode === 'talent' && (
                <div className="filter-group full-width">
                  <label>Énfasis Pedagógico</label>
                  <div className="emphasis-chips">
                    {emphasisOptions.map(emphasis => (
                      <button
                        key={emphasis}
                        type="button"
                        className={`chip ${filters.emphasis.includes(emphasis) ? 'active' : ''}`}
                        onClick={() => toggleEmphasis(emphasis)}
                      >
                        {emphasis}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-apply-filters" onClick={performSearch}>
                Aplicar Filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Indicadores de Confianza con Stats Reales */}
      <section className="trust-indicators">
        <div className="trust-item">
          <div className="trust-icon">🎓</div>
          <h3>{stats.totalTalent}+ Egresados</h3>
          <p>Docentes en formación registrados</p>
        </div>
        <div className="trust-item">
          <div className="trust-icon">�</div>
          <h3>{stats.totalJobs} Oportunidades</h3>
          <p>Vacantes activas disponibles</p>
        </div>
        <div className="trust-item">
          <div className="trust-icon">🏢</div>
          <h3>{stats.totalOrgs} Instituciones</h3>
          <p>Organizaciones educativas</p>
        </div>
        <div className="trust-item">
          <div className="trust-icon">🤝</div>
          <h3>100% Gratuito</h3>
          <p>Sin costos para nadie</p>
        </div>
      </section>

      {/* Resultados */}
      <section className="results-section">
        <div className="results-header">
          <h2>
            {loading ? 'Buscando...' : `${results.length} resultados encontrados`}
          </h2>
          {results.length > 0 && (
            <div className="sort-controls">
              <label>Ordenar por:</label>
              <select>
                <option value="relevance">Relevancia</option>
                <option value="rating">Rating</option>
                <option value="recent">Más recientes</option>
                {searchMode === 'talent' && <option value="socialScore">Reputación Social</option>}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando resultados...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="results-grid">
            {searchMode === 'talent' ? (
              results.map(talent => (
                <TalentoCard key={talent._id} talent={talent} />
              ))
            ) : (
              results.map(vacancy => (
                <VacanteCard key={vacancy._id} vacancy={vacancy} />
              ))
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">{searchMode === 'talent' ? '🎓' : '�'}</div>
            <h3>{filters.searchQuery ? 'No se encontraron resultados' : 'Bienvenido al Marketplace de Talento'}</h3>
            <p>
              {filters.searchQuery 
                ? 'Intenta ajustar tus filtros de búsqueda'
                : searchMode === 'talent'
                  ? 'Usa el buscador para encontrar egresados por nombre, programa o énfasis pedagógico'
                  : 'Explora las oportunidades de prácticas y empleo disponibles'
              }
            </p>
            {!user && (
              <div style={{marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
                <a href="/sign-up" style={{padding: '10px 24px', background: '#1F3C88', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600}}>Registrarme Gratis</a>
                <a href="/login" style={{padding: '10px 24px', border: '2px solid #1F3C88', color: '#1F3C88', borderRadius: '8px', textDecoration: 'none', fontWeight: 600}}>Iniciar Sesión</a>
              </div>
            )}
          </div>
        )}
      </section>

      {/* CTA por Rol (si no está logueado) */}
      {!user && (
        <section className="cta-section">
          <div className="cta-cards">
            <div className="cta-card">
              <div className="cta-icon">🎓</div>
              <h3>¿Eres Egresado?</h3>
              <p>Crea tu portafolio y obtén tu certificación institucional</p>
              <a href="/sign-up?role=STUDENT" className="cta-button">
                Registrarme Gratis
              </a>
            </div>
            <div className="cta-card">
              <div className="cta-icon">🏢</div>
              <h3>¿Representas una Institución?</h3>
              <p>Encuentra docentes en formación pre-certificados</p>
              <a href="/sign-up?role=ORGANIZATION" className="cta-button">
                Explorar Talento
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TalentMarketplace;
