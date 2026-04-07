import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaUserGraduate, FaCheckCircle, FaClock, FaBriefcase, FaCalendar, FaDownload } from 'react-icons/fa';
import EmploymentFunnel from '../../../components/charts/EmploymentFunnel';
import axiosInstance from '../../../utils/axiosInstance';
import './EmployabilityDashboard.css';

const EmployabilityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [programStats, setProgramStats] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [topInstitutions, setTopInstitutions] = useState([]);
  const [filters, setFilters] = useState({
    faculty: '',
    programId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAllData();
  }, [filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchKPIs(),
        fetchFunnel(),
        fetchProgramStats(),
        fetchTimeline(),
        fetchTopInstitutions()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIs = async () => {
    try {
      const { data } = await axiosInstance.get('/api/stats/employability/kpis');
      setKpis(data.kpis);
    } catch (error) {
      console.error('Error al obtener KPIs:', error);
    }
  };

  const fetchFunnel = async () => {
    try {
      const params = new URLSearchParams(filters);
      const { data } = await axiosInstance.get(`/api/stats/employability/employment-funnel?${params}`);
      setFunnelData(data.funnel);
    } catch (error) {
      console.error('Error al obtener embudo:', error);
    }
  };

  const fetchProgramStats = async () => {
    try {
      const params = filters.faculty ? `?faculty=${filters.faculty}` : '';
      const { data } = await axiosInstance.get(`/api/stats/employability/by-program${params}`);
      setProgramStats(data.programs);
    } catch (error) {
      console.error('Error al obtener estadísticas por programa:', error);
    }
  };

  const fetchTimeline = async () => {
    try {
      const { data } = await axiosInstance.get('/api/stats/employability/placement-timeline?months=12');
      setTimeline(data.timeline);
    } catch (error) {
      console.error('Error al obtener línea de tiempo:', error);
    }
  };

  const fetchTopInstitutions = async () => {
    try {
      const { data } = await axiosInstance.get('/api/stats/employability/top-institutions?limit=5');
      setTopInstitutions(data.institutions);
    } catch (error) {
      console.error('Error al obtener instituciones top:', error);
    }
  };

  const handleExportPDF = () => {
    // Placeholder para funcionalidad futura
    alert('Funcionalidad de exportación en desarrollo');
  };

  if (loading) {
    return (
      <div className="employability-dashboard loading">
        <div className="spinner-large"></div>
        <p>Cargando métricas de empleabilidad...</p>
      </div>
    );
  }

  return (
    <div className="employability-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <FaChartLine className="header-icon" />
          <div>
            <h1>Dashboard de Empleabilidad</h1>
            <p>Métricas y análisis para acreditación de alta calidad</p>
          </div>
        </div>
        <button className="export-button" onClick={handleExportPDF}>
          <FaDownload /> Exportar Informe
        </button>
      </div>

      {/* KPIs principales */}
      {kpis && (
        <div className="kpis-grid">
          <div className="kpi-card">
            <div className="kpi-icon students">
              <FaUserGraduate />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Estudiantes Activos</span>
              <span className="kpi-value">{kpis.totalStudents}</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon placed">
              <FaCheckCircle />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Vinculados Exitosamente</span>
              <span className="kpi-value">{kpis.totalPlaced}</span>
            </div>
          </div>

          <div className="kpi-card highlight">
            <div className="kpi-icon rate">
              <FaChartLine />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Tasa de Empleabilidad</span>
              <span className="kpi-value">{kpis.employabilityRate}%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon time">
              <FaClock />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Tiempo Promedio</span>
              <span className="kpi-value">{kpis.avgTimeToPlacement} días</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon offers">
              <FaBriefcase />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Ofertas Activas</span>
              <span className="kpi-value">{kpis.activeOffers}</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon applications">
              <FaCalendar />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Postulaciones este Mes</span>
              <span className="kpi-value">{kpis.applicationsThisMonth}</span>
            </div>
          </div>
        </div>
      )}

      {/* Embudo de conversión */}
      {funnelData && <EmploymentFunnel funnelData={funnelData} />}

      {/* Línea de tiempo de vinculaciones */}
      {timeline.length > 0 && (
        <div className="timeline-chart">
          <h3>Vinculaciones por Mes (Últimos 12 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '0.75rem'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="placements"
                name="Vinculaciones"
                stroke="#1F3C88"
                strokeWidth={2}
                dot={{ fill: '#1F3C88', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Ranking de programas académicos */}
      {programStats.length > 0 && (
        <div className="programs-ranking">
          <h3>Ranking de Programas Académicos por Empleabilidad</h3>
          <div className="programs-table">
            <div className="table-header">
              <span>Programa</span>
              <span>Facultad</span>
              <span>Total Estudiantes</span>
              <span>Vinculados</span>
              <span>Tasa</span>
              <span>Tiempo Prom.</span>
            </div>
            {programStats.map((program, index) => (
              <div key={index} className="table-row">
                <span className="program-name">
                  {index < 3 && <span className="rank-badge">{index + 1}</span>}
                  {program.program}
                </span>
                <span className="faculty-name">{program.faculty}</span>
                <span>{program.totalStudents}</span>
                <span>{program.placedStudents}</span>
                <span className={`placement-rate ${program.placementRate >= 70 ? 'high' : program.placementRate >= 50 ? 'medium' : 'low'}`}>
                  {program.placementRate}%
                </span>
                <span>{program.avgTimeToPlacement} días</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top instituciones */}
      {topInstitutions.length > 0 && (
        <div className="top-institutions">
          <h3>Instituciones con Más Contrataciones</h3>
          <div className="institutions-grid">
            {topInstitutions.map((institution, index) => (
              <div key={index} className="institution-card">
                <img
                  src={institution.profilePic || '/default-org.png'}
                  alt={institution.name}
                  className="institution-avatar"
                />
                <div className="institution-info">
                  <h4>{institution.name}</h4>
                  <p>{institution.hiredCount} egresados contratados</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nota para acreditación */}
      <div className="accreditation-note">
        <h4>📋 Uso para Acreditación</h4>
        <p>
          Estos datos proporcionan evidencia cuantitativa del seguimiento a egresados y la
          pertinencia de los programas académicos, requisitos clave para procesos de acreditación
          de alta calidad ante el CNA (Consejo Nacional de Acreditación).
        </p>
        <ul>
          <li>Tasa de empleabilidad: indicador de pertinencia del programa</li>
          <li>Tiempo de vinculación: efectividad de la formación pedagógica</li>
          <li>Seguimiento continuo: demostración de acompañamiento institucional</li>
        </ul>
      </div>
    </div>
  );
};

export default EmployabilityDashboard;
