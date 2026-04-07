import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCheckCircle, FaUsers, FaClock, FaBriefcase, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MatchmakingDashboard.css';

/**
 * MatchmakingDashboard - Dashboard de Matches (Marketplace)
 * 
 * Corazón del sistema de matchmaking gratuito.
 * Muestra KPIs de conexiones entre egresados y organizaciones.
 * 
 * Acceso:
 * - Coordinador (DOCENTE): Solo su programa
 * - Decano (FACULTY): Toda su facultad
 * - Admin: Toda la universidad
 */

const MatchmakingDashboard = () => {
  const user = useSelector((state) => state?.user?.user);
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [followUpNote, setFollowUpNote] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axiosInstance.get('/api/matchmaking/dashboard');
      setDashboard(data.dashboard);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data } = await axiosInstance.get('/api/matchmaking/alerts');
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    }
  };

  const handleFollowUp = async (matchId, status) => {
    try {
      await axiosInstance.put(`/api/matchmaking/follow-up/${matchId}`, {
        status,
        note: followUpNote
      });
      
      setFollowUpNote('');
      setSelectedAlert(null);
      fetchAlerts();
      fetchDashboardData();
    } catch (error) {
      console.error('Error actualizando seguimiento:', error);
    }
  };

  if (loading) {
    return (
      <div className="matchmaking-dashboard loading">
        <div className="spinner"></div>
        <p>Cargando dashboard de matchmaking...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="matchmaking-dashboard error">
        <p>Error al cargar dashboard</p>
      </div>
    );
  }

  const { kpis, matchesPorAccion, matchesRecientes } = dashboard;

  return (
    <div className="matchmaking-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎯 Dashboard de Matchmaking</h1>
          <p className="subtitle">
            {user.role === 'DOCENTE' && 'Vista de Programa'}
            {user.role === 'FACULTY' && 'Vista de Facultad'}
            {(user.role === 'ADMIN' || user.role === 'OWNER') && 'Vista Universidad'}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={() => {
            fetchDashboardData();
            fetchAlerts();
          }}>
            🔄 Actualizar
          </button>
        </div>
      </header>

      {/* KPIs de Gratuidad */}
      <section className="kpi-section">
        <div className="kpi-grid">
          <div className="kpi-card success">
            <div className="kpi-icon">
              <FaCheckCircle />
            </div>
            <div className="kpi-content">
              <h3>{kpis.indiceVerificacion}%</h3>
              <p>Índice de Verificación</p>
              <small>{kpis.estudiantesVerificados} de {kpis.totalEstudiantes} verificados</small>
            </div>
          </div>

          <div className="kpi-card info">
            <div className="kpi-icon">
              <FaUsers />
            </div>
            <div className="kpi-content">
              <h3>{kpis.matchesActivos}</h3>
              <p>Matches Activos</p>
              <small>Últimos 7 días</small>
            </div>
          </div>

          <div className="kpi-card warning">
            <div className="kpi-icon">
              <FaClock />
            </div>
            <div className="kpi-content">
              <h3>{kpis.tasaRespuestaPromedio}h</h3>
              <p>Tasa de Respuesta</p>
              <small>Tiempo promedio</small>
            </div>
          </div>

          <div className="kpi-card primary">
            <div className="kpi-icon">
              <FaBriefcase />
            </div>
            <div className="kpi-content">
              <h3>{kpis.totalMatches}</h3>
              <p>Total Matches</p>
              <small>Histórico</small>
            </div>
          </div>
        </div>
      </section>

      {/* Alertas Pendientes */}
      {alerts.length > 0 && (
        <section className="alerts-section">
          <h2>
            <FaExclamationTriangle /> Alertas de Match ({alerts.length})
          </h2>
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <div key={alert._id} className={`alert-card status-${alert.followUpStatus}`}>
                <div className="alert-header">
                  <div className="organization-info">
                    <img src={alert.organization.profilePic || '/default-org.png'} alt={alert.organization.name} />
                    <div>
                      <h4>{alert.organization.name}</h4>
                      <span className="action-label">{getActionLabel(alert.action)}</span>
                    </div>
                  </div>
                  <span className="alert-time">{formatTimeAgo(alert.createdAt)}</span>
                </div>

                <div className="alert-body">
                  <div className="student-info">
                    <img src={alert.student.profilePic || '/default-avatar.png'} alt={alert.student.name} />
                    <div>
                      <h5>{alert.student.name}</h5>
                      <p>{alert.student.academicProgramRef?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="alert-footer">
                  <button className="btn-secondary" onClick={() => setSelectedAlert(alert)}>
                    Ver Detalles
                  </button>
                  <button className="btn-primary" onClick={() => handleFollowUp(alert._id, 'contacted')}>
                    Marcar Seguimiento
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tabla de Matches Recientes */}
      <section className="matches-section">
        <h2>
          <FaChartLine /> Matches Recientes
        </h2>
        <div className="table-container">
          <table className="matches-table">
            <thead>
              <tr>
                <th>Egresado</th>
                <th>Organización</th>
                <th>Programa</th>
                <th>Acción</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {matchesRecientes.map((match) => (
                <tr key={match._id}>
                  <td>
                    <div className="user-cell">
                      <img src={match.student.profilePic || '/default-avatar.png'} alt={match.student.name} />
                      <span>{match.student.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <img src={match.organization.profilePic || '/default-org.png'} alt={match.organization.name} />
                      <span>{match.organization.name}</span>
                    </div>
                  </td>
                  <td>{match.student.academicProgramRef?.name || 'N/A'}</td>
                  <td>
                    <span className={`action-badge ${match.action}`}>
                      {getActionLabel(match.action)}
                    </span>
                  </td>
                  <td>{new Date(match.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${match.followUpStatus}`}>
                      {getStatusLabel(match.followUpStatus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Gráficas de Tendencias */}
      <section className="charts-section">
        <div className="chart-container">
          <h3>Distribución por Tipo de Acción</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={matchesPorAccion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Modal de Detalles de Alerta */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Match</h3>
              <button className="btn-close" onClick={() => setSelectedAlert(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Organización</h4>
                <p><strong>Nombre:</strong> {selectedAlert.organization.name}</p>
                <p><strong>Email:</strong> {selectedAlert.organization.email}</p>
                <p><strong>Teléfono:</strong> {selectedAlert.organization.tel || 'No especificado'}</p>
              </div>
              <div className="detail-section">
                <h4>Egresado</h4>
                <p><strong>Nombre:</strong> {selectedAlert.student.name}</p>
                <p><strong>Email:</strong> {selectedAlert.student.email}</p>
                <p><strong>Programa:</strong> {selectedAlert.student.academicProgramRef?.name}</p>
              </div>
              <div className="detail-section">
                <h4>Notas de Seguimiento</h4>
                <textarea
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="Agregar nota de seguimiento..."
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedAlert(null)}>
                Cancelar
              </button>
              <button className="btn-success" onClick={() => handleFollowUp(selectedAlert._id, 'completed')}>
                Marcar Completado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getActionLabel = (action) => {
  const labels = {
    viewed_profile: 'Vio perfil',
    viewed_portfolio: 'Revisó portafolio',
    saved_candidate: 'Guardó favorito',
    invited_to_apply: 'Invitó a postular',
    contacted_directly: 'Contactó directamente',
    hired: 'Contratado'
  };
  return labels[action] || action;
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    contacted: 'Contactado',
    in_process: 'En proceso',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };
  return labels[status] || status;
};

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60
  };

  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `Hace ${interval} ${name}${interval > 1 ? 's' : ''}`;
    }
  }
  return 'Hace un momento';
};

export default MatchmakingDashboard;
