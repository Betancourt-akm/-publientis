import React, { useState, useEffect } from 'react';
import { FaCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './ResponseTrafficLight.css';

const ResponseTrafficLight = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetchTrafficLight();
  }, []);

  const fetchTrafficLight = async () => {
    try {
      const { data } = await axiosInstance.get('/api/admin/stats/response-traffic-light');
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Error al cargar semáforo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="traffic-light-card loading">
        <div className="spinner"></div>
        <p>Cargando métricas de respuesta...</p>
      </div>
    );
  }

  if (!metrics) return null;

  const { stuckCount, stuckApplications, institutionMetrics, summary } = metrics;

  return (
    <div className="traffic-light-container">
      <div className="traffic-light-header">
        <h3>🚦 Semáforo de Respuesta Institucional</h3>
        <p className="subtitle">Tiempo promedio de primera respuesta</p>
      </div>

      {/* Resumen de semáforo */}
      <div className="traffic-summary">
        <div className="summary-item green">
          <FaCircle className="light-icon" />
          <div>
            <span className="count">{summary.green}</span>
            <span className="label">Excelente (≤2 días)</span>
          </div>
        </div>
        <div className="summary-item yellow">
          <FaCircle className="light-icon" />
          <div>
            <span className="count">{summary.yellow}</span>
            <span className="label">Aceptable (3-5 días)</span>
          </div>
        </div>
        <div className="summary-item red">
          <FaCircle className="light-icon" />
          <div>
            <span className="count">{summary.red}</span>
            <span className="label">Lento (>5 días)</span>
          </div>
        </div>
      </div>

      {/* Alerta de estudiantes estancados */}
      {stuckCount > 0 && (
        <div className="stuck-alert">
          <FaExclamationTriangle className="alert-icon" />
          <div className="alert-content">
            <strong>¡Atención requerida!</strong>
            <p>{stuckCount} estudiante{stuckCount > 1 ? 's' : ''} sin respuesta en más de 5 días</p>
          </div>
          <button
            className="view-details-btn"
            onClick={() => setExpandedSection(expandedSection === 'stuck' ? null : 'stuck')}
          >
            {expandedSection === 'stuck' ? 'Ocultar' : 'Ver detalles'}
          </button>
        </div>
      )}

      {/* Lista de estudiantes estancados */}
      {expandedSection === 'stuck' && stuckApplications.length > 0 && (
        <div className="stuck-list">
          <table className="stuck-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Vacante</th>
                <th>Institución</th>
                <th>Días esperando</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {stuckApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.applicant}</td>
                  <td>{app.jobTitle}</td>
                  <td>{app.institution}</td>
                  <td className="days-waiting">{app.daysWaiting} días</td>
                  <td>
                    <button className="action-btn notify">
                      Notificar Institución
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ranking de instituciones */}
      <div className="institutions-ranking">
        <h4>Instituciones por Tiempo de Respuesta</h4>
        <div className="ranking-table">
          <div className="table-header-row">
            <span>Institución</span>
            <span>Tiempo Promedio</span>
            <span>Postulaciones</span>
            <span>Estado</span>
          </div>
          {institutionMetrics.map((inst, index) => (
            <div key={inst.organization.id} className={`ranking-row ${inst.trafficLight}`}>
              <div className="institution-info">
                <img
                  src={inst.organization.profilePic || '/default-org.png'}
                  alt={inst.organization.name}
                  className="inst-avatar"
                />
                <span className="inst-name">{inst.organization.name}</span>
              </div>
              <span className="avg-days">{inst.avgResponseDays} días</span>
              <span className="total-apps">{inst.totalApplications}</span>
              <div className="traffic-status">
                <FaCircle className={`status-light ${inst.trafficLight}`} />
                <span className="status-text">
                  {inst.trafficLight === 'green' && 'Excelente'}
                  {inst.trafficLight === 'yellow' && 'Aceptable'}
                  {inst.trafficLight === 'red' && 'Requiere intervención'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {institutionMetrics.filter(i => i.trafficLight === 'green').length > 0 && (
        <div className="best-practice-note">
          <FaCheckCircle className="success-icon" />
          <div>
            <strong>Mejores prácticas identificadas</strong>
            <p>
              {institutionMetrics.filter(i => i.trafficLight === 'green').length} institución(es) 
              responden en menos de 2 días. Considera compartir sus buenas prácticas con el resto.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseTrafficLight;
