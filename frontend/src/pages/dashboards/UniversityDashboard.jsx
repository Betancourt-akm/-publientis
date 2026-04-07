import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FaUniversity,
  FaUsers,
  FaGraduationCap,
  FaBriefcase,
  FaBuilding,
  FaChartLine,
  FaFileContract
} from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './UniversityDashboard.css';

/**
 * UniversityDashboard - Nivel 0 (Super Admin)
 * 
 * Vista macro de toda la instancia de Publientis.
 * Controla estadísticas globales, rendimiento de facultades, convenios activos.
 * 
 * Basado en principios de:
 * - Interfaz Adaptativa (López Jaquero)
 * - Aplicaciones Basadas en Tareas (Unger & Chandler)
 */

const UniversityDashboard = () => {
  const user = useSelector((state) => state?.user?.user);
  const [hierarchy, setHierarchy] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.university) {
      fetchUniversityData();
    }
  }, [user]);

  const fetchUniversityData = async () => {
    try {
      const { data } = await axiosInstance.get(`/api/hierarchy/full/${user.university}`);
      setHierarchy(data.hierarchy);
      setStats(data.hierarchy.university.stats);
    } catch (error) {
      console.error('Error al cargar datos de universidad:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="university-dashboard loading">
        <div className="spinner-large"></div>
        <p>Cargando vista macro de la universidad...</p>
      </div>
    );
  }

  if (!hierarchy) {
    return (
      <div className="university-dashboard error">
        <p>No se pudo cargar la información de la universidad</p>
      </div>
    );
  }

  const COLORS = ['#1F3C88', '#7c3aed', '#10b981', '#f59e0b', '#dc2626'];

  // Datos para gráficas
  const facultyData = hierarchy.faculties.map(faculty => ({
    name: faculty.code,
    estudiantes: faculty.stats.totalStudents,
    egresados: faculty.stats.totalGraduates,
    programas: faculty.stats.totalPrograms,
    vinculacion: faculty.stats.placementRate
  }));

  const placementData = hierarchy.faculties.map(faculty => ({
    name: faculty.code,
    value: faculty.stats.placementRate
  }));

  return (
    <div className="university-dashboard">
      {/* Header */}
      <div className="dashboard-header level-0">
        <div className="header-content">
          <div className="header-icon">
            <FaUniversity />
          </div>
          <div className="header-info">
            <span className="level-badge">Nivel 0 - Vista Macro</span>
            <h1>{hierarchy.university.name}</h1>
            <p>Dashboard de Super Administración</p>
          </div>
        </div>
      </div>

      {/* KPIs Globales */}
      <div className="kpis-grid">
        <div className="kpi-card primary">
          <div className="kpi-icon">
            <FaBuilding />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats?.totalFaculties || 0}</span>
            <span className="kpi-label">Facultades Activas</span>
            <span className="kpi-trend">Total en la universidad</span>
          </div>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-icon">
            <FaGraduationCap />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats?.totalPrograms || 0}</span>
            <span className="kpi-label">Programas Académicos</span>
            <span className="kpi-trend">Todos los niveles</span>
          </div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-icon">
            <FaUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats?.totalStudents || 0}</span>
            <span className="kpi-label">Estudiantes Activos</span>
            <span className="kpi-trend">{stats?.totalGraduates || 0} egresados</span>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-icon">
            <FaBriefcase />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats?.placementRate || 0}%</span>
            <span className="kpi-label">Tasa Global de Vinculación</span>
            <span className="kpi-trend">Todas las facultades</span>
          </div>
        </div>

        <div className="kpi-card info">
          <div className="kpi-icon">
            <FaFileContract />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats?.activeConvenios || 0}</span>
            <span className="kpi-label">Convenios Activos</span>
            <span className="kpi-trend">Instituciones aliadas</span>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="charts-grid">
        {/* Rendimiento por Facultad */}
        <div className="chart-card">
          <h3>📊 Rendimiento por Facultad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={facultyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="estudiantes" fill="#1F3C88" name="Estudiantes" />
              <Bar dataKey="egresados" fill="#10b981" name="Egresados" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tasa de Vinculación */}
        <div className="chart-card">
          <h3>🎯 Tasa de Vinculación por Facultad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={placementData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {placementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Facultades */}
      <div className="faculties-table-section">
        <h3>🏛️ Gestión de Facultades</h3>
        <div className="table-container">
          <table className="faculties-table">
            <thead>
              <tr>
                <th>Facultad</th>
                <th>Código</th>
                <th>Programas</th>
                <th>Estudiantes</th>
                <th>Egresados</th>
                <th>Vinculación %</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {hierarchy.faculties.map(faculty => (
                <tr key={faculty._id}>
                  <td className="faculty-name">
                    <strong>{faculty.name}</strong>
                  </td>
                  <td>
                    <span className="code-badge">{faculty.code}</span>
                  </td>
                  <td className="text-center">{faculty.programs.length}</td>
                  <td className="text-center">{faculty.stats.totalStudents}</td>
                  <td className="text-center">{faculty.stats.totalGraduates}</td>
                  <td className="text-center">
                    <span className={`placement-badge ${faculty.stats.placementRate >= 70 ? 'high' : faculty.stats.placementRate >= 40 ? 'medium' : 'low'}`}>
                      {faculty.stats.placementRate}%
                    </span>
                  </td>
                  <td>
                    <button className="action-btn-small">Ver Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Programas por Facultad */}
      <div className="programs-overview">
        <h3>📚 Programas Académicos por Facultad</h3>
        <div className="programs-grid">
          {hierarchy.faculties.map(faculty => (
            <div key={faculty._id} className="faculty-programs-card">
              <div className="faculty-header">
                <h4>{faculty.name}</h4>
                <span className="programs-count">{faculty.programs.length} programas</span>
              </div>
              <div className="programs-list">
                {faculty.programs.map(program => (
                  <div key={program._id} className="program-item">
                    <div className="program-info">
                      <span className="program-name">{program.name}</span>
                      <span className="program-level">{program.level}</span>
                    </div>
                    <div className="program-stats">
                      <span className="stat-badge">
                        {program.studentsEnrolled} estudiantes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UniversityDashboard;
