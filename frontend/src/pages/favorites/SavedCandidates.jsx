import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBookmark, FaTrash, FaEdit, FaEye, FaEnvelope, FaPhone, FaGraduationCap, FaTimes, FaSave, FaFilter } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './SavedCandidates.css';

const SavedCandidates = () => {
  const [savedCandidates, setSavedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ tag: '', jobOfferId: '' });
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteForm, setNoteForm] = useState({ notes: '', tags: [] });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchSavedCandidates();
    fetchStats();
  }, [filter]);

  const fetchSavedCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.tag) params.append('tag', filter.tag);
      if (filter.jobOfferId) params.append('jobOfferId', filter.jobOfferId);

      const { data } = await axiosInstance.get(`/api/favorites?${params}`);
      setSavedCandidates(data.savedCandidates);
    } catch (error) {
      console.error('Error al obtener candidatos guardados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axiosInstance.get('/api/favorites/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  const handleRemoveCandidate = async (candidateId) => {
    if (!window.confirm('¿Eliminar este candidato de guardados?')) return;

    try {
      await axiosInstance.delete(`/api/favorites/${candidateId}`);
      setSavedCandidates(savedCandidates.filter(s => s.candidate._id !== candidateId));
      fetchStats();
    } catch (error) {
      console.error('Error al eliminar candidato:', error);
      alert('Error al eliminar candidato');
    }
  };

  const startEditingNotes = (saved) => {
    setEditingNotes(saved.candidate._id);
    setNoteForm({
      notes: saved.notes || '',
      tags: saved.tags || []
    });
  };

  const cancelEditingNotes = () => {
    setEditingNotes(null);
    setNoteForm({ notes: '', tags: [] });
    setNewTag('');
  };

  const handleSaveNotes = async (candidateId) => {
    try {
      await axiosInstance.put(`/api/favorites/${candidateId}/notes`, noteForm);
      
      setSavedCandidates(savedCandidates.map(s => 
        s.candidate._id === candidateId 
          ? { ...s, notes: noteForm.notes, tags: noteForm.tags }
          : s
      ));
      
      setEditingNotes(null);
      fetchStats();
    } catch (error) {
      console.error('Error al actualizar notas:', error);
      alert('Error al actualizar notas');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !noteForm.tags.includes(newTag.trim())) {
      setNoteForm({
        ...noteForm,
        tags: [...noteForm.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNoteForm({
      ...noteForm,
      tags: noteForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="saved-candidates-page">
      <div className="saved-candidates-container">
        {/* Header con estadísticas */}
        <div className="saved-header">
          <div className="header-title">
            <FaBookmark className="page-icon" />
            <h1>Candidatos Guardados</h1>
            {stats && (
              <span className="saved-count">{stats.total} guardados</span>
            )}
          </div>

          {stats && stats.recentlySaved > 0 && (
            <div className="recent-badge">
              {stats.recentlySaved} nuevos en 7 días
            </div>
          )}
        </div>

        {/* Estadísticas y filtros */}
        {stats && stats.tagCounts && Object.keys(stats.tagCounts).length > 0 && (
          <div className="filters-section">
            <div className="filter-header">
              <FaFilter className="filter-icon" />
              <span>Filtrar por etiqueta:</span>
            </div>
            <div className="tag-filters">
              <button
                className={`tag-filter ${!filter.tag ? 'active' : ''}`}
                onClick={() => setFilter({ ...filter, tag: '' })}
              >
                Todas ({stats.total})
              </button>
              {Object.entries(stats.tagCounts).map(([tag, count]) => (
                <button
                  key={tag}
                  className={`tag-filter ${filter.tag === tag ? 'active' : ''}`}
                  onClick={() => setFilter({ ...filter, tag })}
                >
                  {tag} ({count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de candidatos guardados */}
        <div className="saved-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando candidatos guardados...</p>
            </div>
          ) : savedCandidates.length === 0 ? (
            <div className="empty-state">
              <FaBookmark className="empty-icon" />
              <h3>No tienes candidatos guardados</h3>
              <p>
                {filter.tag 
                  ? `No hay candidatos con la etiqueta "${filter.tag}"`
                  : 'Guarda candidatos interesantes para revisarlos después'
                }
              </p>
              {filter.tag && (
                <button
                  className="clear-filter-button"
                  onClick={() => setFilter({ ...filter, tag: '' })}
                >
                  Ver todos los guardados
                </button>
              )}
            </div>
          ) : (
            savedCandidates.map((saved) => (
              <div key={saved.candidate._id} className="candidate-card">
                <div className="candidate-header">
                  <div className="candidate-info">
                    <img
                      src={saved.candidate.profilePic || '/default-avatar.png'}
                      alt={saved.candidate.name}
                      className="candidate-avatar"
                    />
                    <div className="candidate-details">
                      <h3 className="candidate-name">{saved.candidate.name}</h3>
                      <div className="candidate-meta">
                        {saved.candidate.faculty && (
                          <span className="meta-item">
                            <FaGraduationCap /> {saved.candidate.faculty}
                          </span>
                        )}
                        {saved.candidate.program && (
                          <span className="meta-item">{saved.candidate.program}</span>
                        )}
                        {saved.candidate.academicLevel && (
                          <span className="meta-badge">{saved.candidate.academicLevel}</span>
                        )}
                      </div>
                      {saved.candidate.pedagogicalTags && saved.candidate.pedagogicalTags.length > 0 && (
                        <div className="pedagogical-tags">
                          {saved.candidate.pedagogicalTags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="ped-tag">{tag}</span>
                          ))}
                          {saved.candidate.pedagogicalTags.length > 3 && (
                            <span className="ped-tag more">+{saved.candidate.pedagogicalTags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="candidate-actions">
                    <Link
                      to={`/academic/profile/${saved.candidate._id}`}
                      className="action-button view"
                      title="Ver perfil completo"
                    >
                      <FaEye /> Ver Perfil
                    </Link>
                    <a
                      href={`mailto:${saved.candidate.email}`}
                      className="action-button contact"
                      title="Enviar email"
                    >
                      <FaEnvelope />
                    </a>
                    {saved.candidate.tel && (
                      <a
                        href={`tel:${saved.candidate.tel}`}
                        className="action-button contact"
                        title="Llamar"
                      >
                        <FaPhone />
                      </a>
                    )}
                    <button
                      className="action-button danger"
                      onClick={() => handleRemoveCandidate(saved.candidate._id)}
                      title="Remover de guardados"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="candidate-body">
                  <div className="saved-meta">
                    <span className="saved-date">
                      Guardado el {formatDate(saved.savedAt)}
                    </span>
                    {saved.jobOffer && (
                      <span className="linked-offer">
                        Para: {saved.jobOffer.title}
                      </span>
                    )}
                  </div>

                  {editingNotes === saved.candidate._id ? (
                    <div className="notes-edit-form">
                      <textarea
                        value={noteForm.notes}
                        onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                        placeholder="Agrega notas sobre este candidato..."
                        className="notes-textarea"
                        rows="3"
                      />
                      
                      <div className="tags-edit-section">
                        <div className="tags-list">
                          {noteForm.tags.map((tag, idx) => (
                            <span key={idx} className="edit-tag">
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="remove-tag-btn"
                              >
                                <FaTimes />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="add-tag-input">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            placeholder="Agregar etiqueta..."
                            className="tag-input"
                          />
                          <button onClick={handleAddTag} className="add-tag-btn">
                            Agregar
                          </button>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          onClick={() => handleSaveNotes(saved.candidate._id)}
                          className="save-button"
                        >
                          <FaSave /> Guardar
                        </button>
                        <button
                          onClick={cancelEditingNotes}
                          className="cancel-button"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="notes-display">
                      {saved.notes && (
                        <p className="candidate-notes">{saved.notes}</p>
                      )}
                      {saved.tags && saved.tags.length > 0 && (
                        <div className="candidate-tags">
                          {saved.tags.map((tag, idx) => (
                            <span key={idx} className="tag-badge">{tag}</span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => startEditingNotes(saved)}
                        className="edit-notes-button"
                      >
                        <FaEdit /> {saved.notes || saved.tags.length > 0 ? 'Editar' : 'Agregar notas'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedCandidates;
