import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../context';
import { FaGraduationCap, FaUsers, FaBriefcase, FaChalkboardTeacher, FaCheckCircle, FaClock } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './ProgramDashboard.css';

/**
 * ProgramDashboard - Nivel 2 (Centro Operativo)
 * 
 * Vista específica de un programa académico.
 * Dashboard del coordinador de pregrado/posgrado.
 * 
 * Responsabilidades:
 * - Validar portafolios de egresados
 * - Gestionar estudiantes del programa
 * - Match con vacantes específicas
 * - Vincular profesores como tutores
 * 
 * Principio: Solo ve datos de SU programa, no de otros.
 */

const ProgramDashboard = () => {
  const { user } = useContext(Context);
  const [program, setProgram] = useState(null);
  const [students, setStudents] = useState([]);
  const [pendingValidations, setPendingValidations] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.academicProgram) {
      fetchProgramData();
    }
  }, [user]);

  const fetchProgramData = async () => {
    try {
      // Obtener datos del programa
      const programRes = await axiosInstance.get(`/api/programs/${user.academicProgram}`);
      setProgram(programRes.data.program);

      // Obtener estudiantes del programa
      const studentsRes = await axiosInstance.get(`/api/users/by-program/${user.academicProgram}`);
      setStudents(studentsRes.data.students || []);

      // Obtener validaciones pendientes
      const validationsRes = await axiosInstance.get(`/api/admin/tracking-matrix`);
      const programValidations = validationsRes.data.matrix?.pendingValidations?.filter(
        v => students.find(s => s._id === v.userId)
      ) || [];
      setPendingValidations(programValidations);

      // Obtener profesores vinculados
      if (programRes.data.program?.professors) {
        const professorsRes = await axiosInstance.get(`/api/users/professors/${user.academicProgram}`);
        setProfessors(professorsRes.data.professors || []);
      }

    } catch (error) {
      console.error('Error al cargar datos del programa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePortfolio = async (studentId, documentType) => {
    try {
      await axiosInstance.put('/api/admin/validate-document', {
        userId: studentId,
        documentType,
        validated: true
      });

      alert('Documento validado correctamente');
      fetchProgramData(); // Refrescar datos
    } catch (error) {
      alert('Error al validar documento');
    }
  };

  if (loading) {
    return (
      <div className="program-dashboard loading">
        <div className="spinner-large"></div>
        <p>Cargando centro operativo...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="program-dashboard error">
        <p>No se encontró información del programa</p>
      </div>
    );
  }

  const activeStudents = students.filter(s => s.academicStatus === 'Activo').length;
  const graduates = students.filter(s => s.academicStatus === 'Egresado').length;
  const placedGraduates = students.filter(s => s.academicStatus === 'Egresado' && s.employed).length;
  const placementRate = graduates > 0 ? Math.round((placedGraduates / graduates) * 100) : 0;

  return (
    <div className="program-dashboard">
      {/* Header */}
      <div className="dashboard-header level-2">
        <div className="header-content">
          <div className="header-icon">
            <FaGraduationCap />
          </div>
          <div className="header-info">
            <span className="level-badge">Nivel 2 - Centro Operativo</span>
            <h1>{program.name}</h1>
            <p>Dashboard de Coordinación - {program.level}</p>
          </div>
        </div>
      </div>

      {/* KPIs Operativos */}
      <div className="kpis-grid">
        <div className="kpi-card success">
          <div className="kpi-icon">
            <FaUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{activeStudents}</span>
            <span className="kpi-label">Estudiantes Activos</span>
            <span className="kpi-trend">{students.length} total matriculados</span>
          </div>
        </div>

        <div className="kpi-card info">
          <div className="kpi-icon">
            <FaGraduationCap />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{graduates}</span>
            <span className="kpi-label">Egresados</span>
            <span className="kpi-trend">{placedGraduates} vinculados</span>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-icon">
            <FaBriefcase />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{placementRate}%</span>
            <span className="kpi-label">Tasa de Vinculación</span>
            <span className="kpi-trend">Del programa</span>
          </div>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-icon">
            <FaChalkboardTeacher />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{professors.length}</span>
            <span className="kpi-label">Profesores Tutores</span>
            <span className="kpi-trend">Asignados al programa</span>
          </div>
        </div>
      </div>

      {/* Validaciones Pendientes */}
      {pendingValidations.length > 0 && (
        <div className="validations-section priority">
          <div className="section-header-alert">
            <h3>⚠️ Validaciones Pendientes - Requiere Acción</h3>
            <span className="alert-count">{pendingValidations.length}</span>
          </div>

          <div className="validations-list">
            {pendingValidations.map(validation => (
              <div key={validation._id} className="validation-item">
                <div className="validation-info">
                  <div className="student-avatar">
                    {validation.studentName?.charAt(0)}
                  </div>
                  <div className="validation-details">
                    <h4>{validation.studentName}</h4>
                    <p>Documento: <strong>{validation.documentType}</strong></p>
                    <span className="time-badge">
                      <FaClock /> Subido hace {validation.daysAgo} días
                    </span>
                  </div>
                </div>
                <div className="validation-actions">
                  <button 
                    className="action-btn success"
                    onClick={() => handleValidatePortfolio(validation.userId, validation.documentType)}
                  >
                    <FaCheckCircle /> Validar Ahora
                  </button>
                  <button className="action-btn secondary">
                    Ver Documento
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Énfasis Pedagógicos */}
      {program.pedagogicalEmphasis && program.pedagogicalEmphasis.length > 0 && (
        <div className="emphasis-section">
          <h3>🎯 Áreas de Énfasis del Programa</h3>
          <div className="emphasis-grid">
            {program.pedagogicalEmphasis.map((emphasis, index) => (
              <div key={index} className="emphasis-badge">
                {emphasis}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Estudiantes */}
      <div className="students-section">
        <div className="section-header">
          <h3>👨‍🎓 Estudiantes del Programa</h3>
          <div className="filters">
            <select className="filter-select">
              <option value="all">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="graduate">Egresados</option>
              <option value="practitioner">En Práctica</option>
            </select>
          </div>
        </div>

        <div className="students-grid">
          {students.slice(0, 12).map(student => (
            <div key={student._id} className="student-card">
              <div className="student-header">
                <img 
                  src={student.profilePic || '/default-avatar.png'} 
                  alt={student.name}
                  className="student-photo"
                />
                <div className={`status-indicator ${student.academicStatus?.toLowerCase()}`}>
                  {student.academicStatus || 'Activo'}
                </div>
              </div>
              <div className="student-info">
                <h4>{student.name}</h4>
                <p className="student-email">{student.email}</p>
                {student.pedagogicalTags && student.pedagogicalTags.length > 0 && (
                  <div className="tags-preview">
                    {student.pedagogicalTags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="tag-mini">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="student-actions">
                <button className="action-btn-small primary">Ver Perfil</button>
                <button className="action-btn-small secondary">Portafolio</button>
              </div>
            </div>
          ))}
        </div>

        {students.length > 12 && (
          <div className="load-more">
            <button className="action-btn secondary">
              Ver Todos ({students.length} estudiantes)
            </button>
          </div>
        )}
      </div>

      {/* Profesores Tutores */}
      {professors.length > 0 && (
        <div className="professors-section">
          <div className="section-header">
            <h3>👨‍🏫 Profesores Tutores del Programa</h3>
            <button className="action-btn primary">
              + Vincular Profesor
            </button>
          </div>

          <div className="professors-list">
            {professors.map(professor => (
              <div key={professor._id} className="professor-item">
                <img 
                  src={professor.profilePic || '/default-avatar.png'} 
                  alt={professor.name}
                  className="professor-photo"
                />
                <div className="professor-info">
                  <h4>{professor.name}</h4>
                  <p>{professor.email}</p>
                  <span className="professor-badge">Tutor Activo</span>
                </div>
                <button className="action-btn-small secondary">
                  Ver Estudiantes Asignados
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requisitos de Práctica */}
      {program.practiceRequirements && (
        <div className="requirements-section">
          <h3>📋 Requisitos de Práctica del Programa</h3>
          <div className="requirements-grid">
            {program.practiceRequirements.practiceI?.required && (
              <div className="requirement-card">
                <h4>Práctica I</h4>
                <p>Semestre: {program.practiceRequirements.practiceI.semester}</p>
                <p>Horas: {program.practiceRequirements.practiceI.hours}</p>
              </div>
            )}
            {program.practiceRequirements.practiceII?.required && (
              <div className="requirement-card">
                <h4>Práctica II</h4>
                <p>Semestre: {program.practiceRequirements.practiceII.semester}</p>
                <p>Horas: {program.practiceRequirements.practiceII.hours}</p>
              </div>
            )}
            {program.practiceRequirements.ruralPractice?.required && (
              <div className="requirement-card">
                <h4>Práctica Rural</h4>
                <p>Semestre: {program.practiceRequirements.ruralPractice.semester}</p>
                <p>Horas: {program.practiceRequirements.ruralPractice.hours}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDashboard;
