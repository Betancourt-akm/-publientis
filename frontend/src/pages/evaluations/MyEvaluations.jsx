import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../context';
import { FaStar, FaEye, FaEyeSlash, FaCheckCircle, FaClipboardList, FaAward } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import EvaluationForm from '../../components/evaluations/EvaluationForm';
import './MyEvaluations.css';

const MyEvaluations = () => {
  const { user } = useContext(Context);
  const [activeTab, setActiveTab] = useState('received'); // received, given, pending
  const [receivedEvaluations, setReceivedEvaluations] = useState([]);
  const [givenEvaluations, setGivenEvaluations] = useState([]);
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchReceivedEvaluations(),
        fetchGivenEvaluations(),
        fetchPendingEvaluations(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedEvaluations = async () => {
    try {
      const userId = user?._id;
      if (!userId) return;
      const { data } = await axiosInstance.get(`/api/evaluations/received/${userId}?onlyPublic=false`);
      setReceivedEvaluations(data.evaluations);
      setStats(data.stats);
    } catch (error) {
      console.error('Error al obtener evaluaciones recibidas:', error);
    }
  };

  const fetchGivenEvaluations = async () => {
    try {
      const { data } = await axiosInstance.get('/api/evaluations/given');
      setGivenEvaluations(data.evaluations);
    } catch (error) {
      console.error('Error al obtener evaluaciones dadas:', error);
    }
  };

  const fetchPendingEvaluations = async () => {
    try {
      const { data } = await axiosInstance.get('/api/evaluations/pending');
      setPendingEvaluations(data.pending);
    } catch (error) {
      console.error('Error al obtener evaluaciones pendientes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'me';
      const { data } = await axiosInstance.get(`/api/evaluations/stats/${userId}`);
      setStats(data.stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  const handleToggleVisibility = async (evaluationId, currentVisibility) => {
    try {
      await axiosInstance.put(`/api/evaluations/${evaluationId}/visibility`, {
        isPublic: !currentVisibility
      });
      fetchReceivedEvaluations();
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      alert('Error al actualizar visibilidad');
    }
  };

  const handleEvaluate = (application) => {
    setSelectedApplication(application);
    setShowEvaluationForm(true);
  };

  const handleEvaluationSuccess = () => {
    setShowEvaluationForm(false);
    setSelectedApplication(null);
    fetchAllData();
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'star filled' : 'star empty'}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="evaluations-page loading">
        <div className="spinner-large"></div>
        <p>Cargando evaluaciones...</p>
      </div>
    );
  }

  return (
    <div className="evaluations-page">
      <div className="evaluations-container">
        {/* Header con estadísticas */}
        <div className="evaluations-header">
          <div className="header-content">
            <FaAward className="header-icon" />
            <div>
              <h1>Mis Evaluaciones</h1>
              <p>Gestiona y revisa tus evaluaciones de prácticas pedagógicas</p>
            </div>
          </div>

          {stats && stats.count > 0 && (
            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-label">Calificación Promedio</span>
                <div className="stat-value-container">
                  <span className="stat-value">{stats.average}</span>
                  <div className="stat-stars">{renderStars(Math.round(stats.average))}</div>
                </div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">Total Evaluaciones</span>
                <span className="stat-value">{stats.count}</span>
              </div>
              {stats.recommendations > 0 && (
                <>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-label">Recomendaciones</span>
                    <span className="stat-value highlight">{stats.recommendations}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            <FaClipboardList />
            Recibidas ({receivedEvaluations.length})
          </button>
          <button
            className={`tab ${activeTab === 'given' ? 'active' : ''}`}
            onClick={() => setActiveTab('given')}
          >
            <FaCheckCircle />
            Dadas ({givenEvaluations.length})
          </button>
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <FaClipboardList />
            Pendientes ({pendingEvaluations.length})
          </button>
        </div>

        {/* Content */}
        <div className="evaluations-content">
          {activeTab === 'received' && (
            <div className="evaluations-list">
              {receivedEvaluations.length === 0 ? (
                <div className="empty-state">
                  <FaAward className="empty-icon" />
                  <h3>No tienes evaluaciones recibidas</h3>
                  <p>Las evaluaciones de tus prácticas aparecerán aquí</p>
                </div>
              ) : (
                receivedEvaluations.map((evaluation) => (
                  <div key={evaluation._id} className="evaluation-card">
                    <div className="evaluation-header-card">
                      <div className="evaluator-info">
                        <img
                          src={evaluation.evaluator?.profilePic || '/default-avatar.png'}
                          alt={evaluation.evaluator?.name}
                          className="evaluator-avatar"
                        />
                        <div>
                          <h4>{evaluation.evaluator?.name}</h4>
                          <p className="evaluation-date">{formatDate(evaluation.createdAt)}</p>
                          {evaluation.jobOffer && (
                            <p className="job-title">{evaluation.jobOffer.title}</p>
                          )}
                        </div>
                      </div>
                      <button
                        className="visibility-toggle"
                        onClick={() => handleToggleVisibility(evaluation._id, evaluation.isPublic)}
                        title={evaluation.isPublic ? 'Ocultar del perfil público' : 'Mostrar en perfil público'}
                      >
                        {evaluation.isPublic ? (
                          <>
                            <FaEye /> Pública
                          </>
                        ) : (
                          <>
                            <FaEyeSlash /> Privada
                          </>
                        )}
                      </button>
                    </div>

                    <div className="evaluation-ratings">
                      <div className="rating-item">
                        <span>General</span>
                        {renderStars(evaluation.ratings.overall)}
                        <span className="rating-number">{evaluation.ratings.overall}</span>
                      </div>
                      <div className="rating-item">
                        <span>Profesionalismo</span>
                        {renderStars(evaluation.ratings.professionalism)}
                        <span className="rating-number">{evaluation.ratings.professionalism}</span>
                      </div>
                      {evaluation.ratings.pedagogicalSkills && (
                        <div className="rating-item">
                          <span>Habilidades Pedagógicas</span>
                          {renderStars(evaluation.ratings.pedagogicalSkills)}
                          <span className="rating-number">{evaluation.ratings.pedagogicalSkills}</span>
                        </div>
                      )}
                      {evaluation.ratings.workEnvironment && (
                        <div className="rating-item">
                          <span>Ambiente de Trabajo</span>
                          {renderStars(evaluation.ratings.workEnvironment)}
                          <span className="rating-number">{evaluation.ratings.workEnvironment}</span>
                        </div>
                      )}
                    </div>

                    {evaluation.strengths && (
                      <div className="feedback-section">
                        <strong>Fortalezas:</strong>
                        <p>{evaluation.strengths}</p>
                      </div>
                    )}

                    {evaluation.areasForImprovement && (
                      <div className="feedback-section">
                        <strong>Áreas de Mejora:</strong>
                        <p>{evaluation.areasForImprovement}</p>
                      </div>
                    )}

                    {evaluation.comments && (
                      <div className="feedback-section">
                        <strong>Comentarios:</strong>
                        <p>{evaluation.comments}</p>
                      </div>
                    )}

                    {evaluation.ratings.wouldRecommend && (
                      <div className="recommendation-badge">
                        <FaCheckCircle /> Te recomendaría
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'given' && (
            <div className="evaluations-list">
              {givenEvaluations.length === 0 ? (
                <div className="empty-state">
                  <FaCheckCircle className="empty-icon" />
                  <h3>No has dado evaluaciones</h3>
                  <p>Las evaluaciones que envíes aparecerán aquí</p>
                </div>
              ) : (
                givenEvaluations.map((evaluation) => (
                  <div key={evaluation._id} className="evaluation-card">
                    <div className="evaluation-header-card">
                      <div className="evaluator-info">
                        <img
                          src={evaluation.evaluated?.profilePic || '/default-avatar.png'}
                          alt={evaluation.evaluated?.name}
                          className="evaluator-avatar"
                        />
                        <div>
                          <h4>Evaluaste a: {evaluation.evaluated?.name}</h4>
                          <p className="evaluation-date">{formatDate(evaluation.createdAt)}</p>
                          {evaluation.jobOffer && (
                            <p className="job-title">{evaluation.jobOffer.title}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="evaluation-ratings">
                      <div className="rating-item">
                        <span>General</span>
                        {renderStars(evaluation.ratings.overall)}
                        <span className="rating-number">{evaluation.ratings.overall}</span>
                      </div>
                    </div>

                    {evaluation.strengths && (
                      <div className="feedback-section">
                        <strong>Fortalezas:</strong>
                        <p>{evaluation.strengths}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="pending-list">
              {pendingEvaluations.length === 0 ? (
                <div className="empty-state">
                  <FaCheckCircle className="empty-icon" />
                  <h3>¡Todo al día!</h3>
                  <p>No tienes evaluaciones pendientes</p>
                </div>
              ) : (
                pendingEvaluations.map((application) => (
                  <div key={application._id} className="pending-card">
                    <div className="pending-info">
                      <h4>{application.jobOffer?.title}</h4>
                      <p>Aplicado el {formatDate(application.createdAt)}</p>
                    </div>
                    <button
                      className="evaluate-button"
                      onClick={() => handleEvaluate(application)}
                    >
                      Evaluar Ahora
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario de evaluación */}
      {showEvaluationForm && selectedApplication && (
        <EvaluationForm
          application={selectedApplication}
          evaluatorType={selectedApplication.applicant ? 'institution' : 'student'}
          onClose={() => {
            setShowEvaluationForm(false);
            setSelectedApplication(null);
          }}
          onSuccess={handleEvaluationSuccess}
        />
      )}
    </div>
  );
};

export default MyEvaluations;
