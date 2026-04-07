import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaBriefcase, FaExclamationTriangle, FaClock, FaFileContract } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import JobApprovalTable from '../../components/admin/JobApprovalTable';
import ResponseTrafficLight from '../../components/admin/ResponseTrafficLight';
import ConvenioValidator from '../../components/admin/ConvenioValidator';
import StudentTrackingMatrix from '../../components/admin/StudentTrackingMatrix';
import './AdminControlPanel.css';

const AdminControlPanel = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('tracking'); // tracking, overview, approvals, response, convenios

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const { data } = await axiosInstance.get('/api/admin/stats/kpis');
      setKpis(data.kpis);
    } catch (error) {
      console.error('Error al cargar KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-control-panel loading">
        <div className="spinner-large"></div>
        <p>Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="admin-control-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-content">
          <h1>🎯 Tablero de Control de Vacantes</h1>
          <p className="header-subtitle">
            Gestión centralizada de vinculación laboral pedagógica
          </p>
        </div>
      </div>

      {/* KPIs Dashboard - Full Width */}
      {kpis && (
        <div className="kpis-dashboard">
          <div className="kpi-card primary">
            <div className="kpi-icon">
              <FaUserGraduate />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{kpis.vinculadosEsteMes}</span>
              <span className="kpi-label">Vinculados este Mes</span>
              <span className="kpi-trend positive">↗ Impacto directo</span>
            </div>
          </div>

          <div className="kpi-card success">
            <div className="kpi-icon">
              <FaBriefcase />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{kpis.plazasDisponibles}</span>
              <span className="kpi-label">Plazas Disponibles</span>
              <span className="kpi-trend">Activas aprobadas</span>
            </div>
          </div>

          <div className="kpi-card warning">
            <div className="kpi-icon">
              <FaExclamationTriangle />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{kpis.ofertasPendientes}</span>
              <span className="kpi-label">Requieren Aprobación</span>
              <span className="kpi-trend">Acción necesaria</span>
            </div>
          </div>

          <div className="kpi-card danger">
            <div className="kpi-icon">
              <FaClock />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{kpis.estudiantesEstancados}</span>
              <span className="kpi-label">Estudiantes Sin Respuesta</span>
              <span className="kpi-trend negative">&gt;5 días esperando</span>
            </div>
          </div>

          <div className="kpi-card alert">
            <div className="kpi-icon">
              <FaFileContract />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{kpis.conveniosPorVencer}</span>
              <span className="kpi-label">Convenios por Vencer</span>
              <span className="kpi-trend">Próximos 30 días</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="panel-navigation">
        <button
          className={`nav-tab ${activeView === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveView('tracking')}
        >
          🎯 Matriz de Seguimiento
        </button>
        <button
          className={`nav-tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          📊 Vista General
        </button>
        <button
          className={`nav-tab ${activeView === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveView('approvals')}
        >
          ✅ Aprobaciones ({kpis?.ofertasPendientes || 0})
        </button>
        <button
          className={`nav-tab ${activeView === 'response' ? 'active' : ''}`}
          onClick={() => setActiveView('response')}
        >
          🚦 Semáforo de Respuesta
        </button>
        <button
          className={`nav-tab ${activeView === 'convenios' ? 'active' : ''}`}
          onClick={() => setActiveView('convenios')}
        >
          📄 Validador de Convenios
        </button>
      </div>

      {/* Content Area - Full Width */}
      <div className="panel-content">
        {activeView === 'tracking' && (
          <div className="full-width-view">
            <StudentTrackingMatrix />
          </div>
        )}

        {activeView === 'overview' && (
          <div className="overview-layout">
            <div className="overview-section">
              <h2 className="section-title">🚨 Requiere Atención Inmediata</h2>
              <div className="overview-grid">
                <div className="compact-section">
                  <h3>Aprobaciones Pendientes</h3>
                  <JobApprovalTable />
                </div>
              </div>
            </div>

            <div className="overview-section">
              <h2 className="section-title">📈 Métricas de Calidad</h2>
              <div className="metrics-grid">
                <ResponseTrafficLight />
              </div>
            </div>
          </div>
        )}

        {activeView === 'approvals' && (
          <div className="full-width-view">
            <JobApprovalTable />
          </div>
        )}

        {activeView === 'response' && (
          <div className="full-width-view">
            <ResponseTrafficLight />
          </div>
        )}

        {activeView === 'convenios' && (
          <div className="full-width-view">
            <ConvenioValidator />
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="panel-footer">
        <p>
          💡 <strong>Tip:</strong> Este panel te permite gestionar el ciclo completo de vinculación laboral. 
          Las métricas se actualizan en tiempo real para garantizar la atención oportuna a los egresados.
        </p>
      </div>
    </div>
  );
};

export default AdminControlPanel;
