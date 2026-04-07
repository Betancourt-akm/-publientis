import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaBuilding, FaUsers, FaGraduationCap, FaBriefcase, FaChartLine } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './FacultyDashboard.css';

/**
 * FacultyDashboard - Nivel 1 (Admin de Unidad)
 * 
 * Vista intermedia de una facultad específica.
 * Visualiza y gestiona programas académicos de su unidad.
 * Dashboard centrado en supervisión de convenios marco y cumplimiento de metas.
 * 
 * Principio: Solo ve datos de SU facultad, no de otras.
 */

const FacultyDashboard = () => {
  const user = useSelector((state) => state?.user?.user);
  const [faculty, setFaculty] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.faculty) {
      fetchFacultyData();
    }
  }, [user]);

  const fetchFacultyData = async () => {
    try {
      // Obtener datos de la facultad
      const { data } = await axiosInstance.get(`/api/hierarchy/full/${user.university}`);
      
      // Filtrar solo la facultad del usuario
      const userFaculty = data.hierarchy.faculties.find(f => f._id === user.faculty);
      
      if (userFaculty) {
        setFaculty(userFaculty);
        setPrograms(userFaculty.programs || []);
      }
    } catch (error) {
      console.error('Error al cargar datos de facultad:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="faculty-dashboard loading">
        <div className="spinner-large"></div>
        <p>Cargando datos de la facultad...</p>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="faculty-dashboard error">
        <p>No se encontró información de la facultad</p>
      </div>
    );
  }

  // Datos para gráficas
  const programData = programs.map(program => ({
    name: program.code,
    estudiantes: program.studentsEnrolled || 0,
    egresados: program.graduatesCount || 0
  }));

  return (
    <div className="faculty-dashboard">
      {/* Header */}
      <div className="dashboard-header level-1">
        <div className="header-content">
          <div className="header-icon">
            <FaBuilding />
          </div>
          <div className="header-info">
            <span className="level-badge">Nivel 1 - Vista de Facultad</span>
            <h1>{faculty.name}</h1>
            <p>Dashboard de Gestión Intermedia</p>
          </div>
        </div>
      </div>

      {/* KPIs de Facultad */}
      <div className="kpis-grid">
        <div className="kpi-card purple">
          <div className="kpi-icon">
            <FaGraduationCap />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{faculty.stats?.totalPrograms || programs.length}</span>
            <span className="kpi-label">Programas Académicos</span>
            <span className="kpi-trend">De esta facultad</span>
          </div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-icon">
            <FaUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{faculty.stats?.totalStudents || 0}</span>
            <span className="kpi-label">Estudiantes Activos</span>
            <span className="kpi-trend">{faculty.stats?.totalGraduates || 0} egresados</span>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-icon">
            <FaBriefcase />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{faculty.stats?.placementRate || 0}%</span>
            <span className="kpi-label">Tasa de Vinculación</span>
            <span className="kpi-trend">Promedio de la facultad</span>
          </div>
        </div>

        <div className="kpi-card info">
          <div className="kpi-icon">
            <FaChartLine />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">
              {programs.length > 0 
                ? Math.round(programs.reduce((sum, p) => sum + (p.studentsEnrolled || 0), 0) / programs.length)
                : 0}
            </span>
            <span className="kpi-label">Promedio Estudiantes/Programa</span>
            <span className="kpi-trend">Capacidad actual</span>
          </div>
        </div>
      </div>

      {/* Áreas de Conocimiento */}
      {faculty.knowledgeAreas && faculty.knowledgeAreas.length > 0 && (
        <div className="knowledge-areas-section">
          <h3>🎓 Áreas de Conocimiento</h3>
          <div className="knowledge-areas-grid">
            {faculty.knowledgeAreas.map((area, index) => (
              <div key={index} className="knowledge-area-badge">
                {area}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfica de Programas */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>📊 Estudiantes por Programa Académico</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="estudiantes" fill="#7c3aed" name="Activos" />
              <Bar dataKey="egresados" fill="#10b981" name="Egresados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Programas */}
      <div className="programs-table-section">
        <div className="section-header">
          <h3>📚 Programas Académicos de la Facultad</h3>
          <button className="action-btn primary">
            + Crear Nuevo Programa
          </button>
        </div>

        <div className="table-container">
          <table className="programs-table">
            <thead>
              <tr>
                <th>Programa</th>
                <th>Código</th>
                <th>Nivel</th>
                <th>Estudiantes</th>
                <th>Egresados</th>
                <th>Coordinador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program._id}>
                  <td className="program-name">
                    <strong>{program.name}</strong>
                  </td>
                  <td>
                    <span className="code-badge">{program.code}</span>
                  </td>
                  <td>
                    <span className="level-badge-small">{program.level}</span>
                  </td>
                  <td className="text-center">{program.studentsEnrolled || 0}</td>
                  <td className="text-center">{program.graduatesCount || 0}</td>
                  <td className="text-center">
                    {program.coordinator ? (
                      <span className="coordinator-badge">✓ Asignado</span>
                    ) : (
                      <span className="no-coordinator">Sin asignar</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn-small primary">Ver</button>
                      <button className="action-btn-small secondary">Editar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {programs.length === 0 && (
            <div className="empty-state">
              <p>No hay programas académicos registrados en esta facultad</p>
              <button className="action-btn primary">
                Crear Primer Programa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Información de Contacto */}
      {faculty.contact && (
        <div className="contact-section">
          <h3>📞 Información de Contacto</h3>
          <div className="contact-grid">
            {faculty.contact.email && (
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <span className="contact-value">{faculty.contact.email}</span>
              </div>
            )}
            {faculty.contact.phone && (
              <div className="contact-item">
                <span className="contact-label">Teléfono:</span>
                <span className="contact-value">{faculty.contact.phone}</span>
              </div>
            )}
            {faculty.contact.office && (
              <div className="contact-item">
                <span className="contact-label">Oficina:</span>
                <span className="contact-value">{faculty.contact.office}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
