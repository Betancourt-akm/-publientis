import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaUserGraduate, FaBriefcase, FaFileContract } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './StudentTrackingMatrix.css';

/**
 * StudentTrackingMatrix - Matriz de Seguimiento Activa
 * 
 * Dashboard reactivo que muestra alertas según estado de usuarios.
 * Basado en principio de "Interfaz Adaptativa" (Unger & Chandler)
 * 
 * Alertas:
 * 1. Egresados sin práctica (ROJO - Requiere intervención)
 * 2. Instituciones con convenio vencido (AMARILLO - Gestión)
 * 3. Estudiantes estancados >5 días sin respuesta (NARANJA - Seguimiento)
 * 4. Documentos pendientes de validación (AZUL - Acción)
 */

const StudentTrackingMatrix = () => {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAlert, setActiveAlert] = useState('all');

  useEffect(() => {
    fetchTrackingMatrix();
    
    // Auto-refresh cada 2 minutos (dashboard reactivo)
    const interval = setInterval(fetchTrackingMatrix, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrackingMatrix = async () => {
    try {
      const { data } = await axiosInstance.get('/api/admin/tracking-matrix');
      setMatrix(data.matrix);
    } catch (error) {
      console.error('Error al cargar matriz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateDocument = async (userId, documentType) => {
    try {
      await axiosInstance.put(`/api/admin/validate-document`, {
        userId,
        documentType,
        validated: true
      });
      
      fetchTrackingMatrix(); // Refrescar
      alert('Documento validado correctamente');
    } catch (error) {
      alert('Error al validar documento');
    }
  };

  const handleContactStudent = (studentId) => {
    // Navegar a chat o enviar notificación
    window.location.href = `/admin/contact/${studentId}`;
  };

  if (loading) {
    return (
      <div className="tracking-matrix loading">
        <div className="spinner-large"></div>
        <p>Cargando matriz de seguimiento...</p>
      </div>
    );
  }

  if (!matrix) return null;

  const {
    studentsWithoutPractice,
    expiredConvenios,
    stuckStudents,
    pendingValidations,
    placementRate,
    activeStudents
  } = matrix;

  const alerts = [
    {
      id: 'without_practice',
      label: 'Sin Práctica',
      count: studentsWithoutPractice?.length || 0,
      level: 'critical',
      icon: <FaExclamationTriangle />,
      description: 'Egresados sin vinculación laboral'
    },
    {
      id: 'expired_convenios',
      label: 'Convenios Vencidos',
      count: expiredConvenios?.length || 0,
      level: 'warning',
      icon: <FaFileContract />,
      description: 'Instituciones que no pueden publicar vacantes'
    },
    {
      id: 'stuck',
      label: 'Estancados',
      count: stuckStudents?.length || 0,
      level: 'alert',
      icon: <FaClock />,
      description: 'Estudiantes sin respuesta >5 días'
    },
    {
      id: 'validation',
      label: 'Validaciones Pendientes',
      count: pendingValidations?.length || 0,
      level: 'action',
      icon: <FaUserGraduate />,
      description: 'Documentos que requieren aprobación'
    }
  ];

  return (
    <div className="tracking-matrix-container">
      {/* Header con Estadísticas Globales */}
      <div className="matrix-header">
        <div className="header-stats">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FaUserGraduate />
            </div>
            <div className="stat-content">
              <span className="stat-value">{activeStudents || 0}</span>
              <span className="stat-label">Estudiantes Activos</span>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <FaBriefcase />
            </div>
            <div className="stat-content">
              <span className="stat-value">{placementRate || 0}%</span>
              <span className="stat-label">Tasa de Vinculación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Críticas */}
      <div className="alerts-dashboard">
        <h3 className="section-title">🚨 Centro de Alertas Activas</h3>
        
        <div className="alerts-grid">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`alert-card ${alert.level} ${activeAlert === alert.id ? 'active' : ''}`}
              onClick={() => setActiveAlert(alert.id)}
            >
              <div className="alert-header">
                <div className="alert-icon">{alert.icon}</div>
                <div className="alert-count">{alert.count}</div>
              </div>
              <h4 className="alert-label">{alert.label}</h4>
              <p className="alert-description">{alert.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detalle de Alertas Seleccionadas */}
      <div className="alert-details">
        {/* Egresados sin Práctica */}
        {activeAlert === 'without_practice' && studentsWithoutPractice?.length > 0 && (
          <div className="detail-section critical">
            <h3>⚠️ Egresados Sin Práctica - Requiere Intervención Inmediata</h3>
            <div className="detail-list">
              {studentsWithoutPractice.map(student => (
                <div key={student._id} className="detail-item">
                  <div className="item-info">
                    <img src={student.profilePic || '/default-avatar.png'} alt={student.name} className="item-avatar" />
                    <div>
                      <h4>{student.name}</h4>
                      <p>{student.program} - Egresado hace {student.daysSinceGraduation} días</p>
                      <span className="tag">Sin postulaciones activas</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="action-btn primary" onClick={() => handleContactStudent(student._id)}>
                      Contactar Estudiante
                    </button>
                    <button className="action-btn secondary">
                      Ver Perfil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convenios Vencidos */}
        {activeAlert === 'expired_convenios' && expiredConvenios?.length > 0 && (
          <div className="detail-section warning">
            <h3>📄 Instituciones con Convenio Vencido</h3>
            <div className="detail-list">
              {expiredConvenios.map(institution => (
                <div key={institution._id} className="detail-item">
                  <div className="item-info">
                    <img src={institution.profilePic || '/default-org.png'} alt={institution.name} className="item-avatar" />
                    <div>
                      <h4>{institution.name}</h4>
                      <p>Convenio vencido hace {Math.abs(institution.daysUntilExpiration)} días</p>
                      <span className="tag warning">No puede publicar vacantes</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="action-btn warning">
                      Notificar Renovación
                    </button>
                    <button className="action-btn secondary">
                      Ver Convenio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estudiantes Estancados */}
        {activeAlert === 'stuck' && stuckStudents?.length > 0 && (
          <div className="detail-section alert">
            <h3>⏰ Estudiantes Sin Respuesta ({'>'}5 días)</h3>
            <div className="detail-list">
              {stuckStudents.map(student => (
                <div key={student.applicationId} className="detail-item">
                  <div className="item-info">
                    <div>
                      <h4>{student.studentName}</h4>
                      <p>Postulado a: <strong>{student.jobTitle}</strong></p>
                      <p>Institución: {student.institutionName}</p>
                      <span className="tag alert">{student.daysWaiting} días esperando</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="action-btn alert">
                      Notificar Institución
                    </button>
                    <button className="action-btn secondary">
                      Ver Postulación
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validaciones Pendientes */}
        {activeAlert === 'validation' && pendingValidations?.length > 0 && (
          <div className="detail-section action">
            <h3>✅ Documentos Pendientes de Validación</h3>
            <div className="detail-list">
              {pendingValidations.map(item => (
                <div key={item._id} className="detail-item">
                  <div className="item-info">
                    <div>
                      <h4>{item.studentName}</h4>
                      <p>Documento: <strong>{item.documentType}</strong></p>
                      <p>Subido hace: {item.daysAgo} días</p>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="action-btn success"
                      onClick={() => handleValidateDocument(item.userId, item.documentType)}
                    >
                      <FaCheckCircle /> Validar
                    </button>
                    <button className="action-btn secondary">
                      Ver Documento
                    </button>
                    <button className="action-btn danger">
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vista General */}
        {activeAlert === 'all' && (
          <div className="detail-section overview">
            <h3>📊 Vista General del Sistema</h3>
            <p className="overview-text">
              Selecciona una categoría de alertas arriba para ver los detalles y tomar acciones.
            </p>
            <div className="overview-summary">
              <div className="summary-item critical">
                <strong>{studentsWithoutPractice?.length || 0}</strong>
                <span>Requieren intervención urgente</span>
              </div>
              <div className="summary-item warning">
                <strong>{expiredConvenios?.length || 0}</strong>
                <span>Convenios a renovar</span>
              </div>
              <div className="summary-item alert">
                <strong>{stuckStudents?.length || 0}</strong>
                <span>Estudiantes estancados</span>
              </div>
              <div className="summary-item action">
                <strong>{pendingValidations?.length || 0}</strong>
                <span>Validaciones pendientes</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer con última actualización */}
      <div className="matrix-footer">
        <p>
          <FaClock /> Última actualización: {new Date().toLocaleTimeString('es-CO')}
        </p>
        <button className="refresh-btn" onClick={fetchTrackingMatrix}>
          Actualizar Ahora
        </button>
      </div>
    </div>
  );
};

export default StudentTrackingMatrix;
