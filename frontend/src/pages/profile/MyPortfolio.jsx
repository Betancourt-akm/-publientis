import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../context';
import axiosInstance from '../../utils/axiosInstance';
import uploadImage from '../../helpers/uploadImage';
import { FaFileAlt, FaFilePdf, FaTrash, FaUpload, FaEye, FaPlus } from 'react-icons/fa';
import './MyPortfolio.css';

const MyPortfolio = () => {
  const { user } = useContext(Context);
  const [portfolio, setPortfolio] = useState({
    cv: null,
    planesAula: [],
    certificados: [],
    proyectos: []
  });
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [currentType, setCurrentType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    gradeLevel: '',
    institution: '',
    issueDate: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/portfolio/my-portfolio');
      setPortfolio(res.data.data || {
        cv: null,
        planesAula: [],
        certificados: [],
        proyectos: []
      });
    } catch (error) {
      console.error('Error al cargar portafolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que sea PDF
    if (!file.name.endsWith('.pdf')) {
      alert('Solo se permiten archivos PDF');
      return;
    }

    // Si es CV, subir directamente
    if (type === 'cv') {
      await uploadDocument(file, type, {});
    } else {
      // Para otros tipos, mostrar formulario
      setCurrentType(type);
      setShowForm(true);
      // Guardar archivo temporalmente
      window.tempFile = file;
    }
  };

  const uploadDocument = async (file, type, metadata) => {
    setUploading(true);
    setUploadType(type);

    try {
      // Subir a Cloudinary
      const uploadedUrl = await uploadImage(file);

      // Guardar en backend
      await axiosInstance.post('/api/portfolio/upload', {
        type,
        url: uploadedUrl,
        ...metadata
      });

      // Recargar portafolio
      await fetchPortfolio();
      
      alert('Documento subido exitosamente');
      
      // Limpiar formulario
      setFormData({
        name: '',
        subject: '',
        gradeLevel: '',
        institution: '',
        issueDate: '',
        description: '',
        category: ''
      });
      setShowForm(false);
      window.tempFile = null;
    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Error al subir documento. Intenta de nuevo.');
    } finally {
      setUploading(false);
      setUploadType('');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!window.tempFile) {
      alert('No hay archivo seleccionado');
      return;
    }

    const metadata = {};
    
    switch (currentType) {
      case 'planAula':
        metadata.name = formData.name;
        metadata.subject = formData.subject;
        metadata.gradeLevel = formData.gradeLevel;
        break;
      case 'certificado':
        metadata.name = formData.name;
        metadata.institution = formData.institution;
        metadata.issueDate = formData.issueDate;
        break;
      case 'proyecto':
        metadata.name = formData.name;
        metadata.description = formData.description;
        metadata.category = formData.category;
        break;
    }

    await uploadDocument(window.tempFile, currentType, metadata);
  };

  const handleDeleteDocument = async (type, documentId = null) => {
    if (!window.confirm('¿Eliminar este documento?')) return;

    try {
      await axiosInstance.delete('/api/portfolio/document', {
        data: { type, documentId }
      });

      await fetchPortfolio();
      alert('Documento eliminado');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar documento');
    }
  };

  if (loading) {
    return (
      <div className="my-portfolio-page">
        <div className="loading-spinner">Cargando portafolio...</div>
      </div>
    );
  }

  return (
    <div className="my-portfolio-page">
      <div className="portfolio-header">
        <h1>Mi Portafolio Profesional</h1>
        <p className="portfolio-subtitle">
          Gestiona tus documentos pedagógicos para destacar en postulaciones
        </p>
      </div>

      {/* Sección CV */}
      <section className="portfolio-section">
        <div className="section-header">
          <h2>
            <FaFilePdf /> Hoja de Vida (CV)
          </h2>
          {!portfolio.cv && (
            <label className="btn-upload">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e, 'cv')}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <FaUpload /> {uploading && uploadType === 'cv' ? 'Subiendo...' : 'Subir CV'}
            </label>
          )}
        </div>

        {portfolio.cv ? (
          <div className="document-card">
            <div className="document-icon cv">
              <FaFilePdf />
            </div>
            <div className="document-info">
              <h4>Curriculum Vitae</h4>
              <p className="document-meta">Documento PDF principal</p>
            </div>
            <div className="document-actions">
              <a
                href={portfolio.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-icon"
              >
                <FaEye />
              </a>
              <button
                onClick={() => handleDeleteDocument('cv')}
                className="btn-icon btn-delete"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <FaFilePdf className="empty-icon" />
            <p>Sube tu hoja de vida para que las instituciones conozcan tu perfil</p>
          </div>
        )}
      </section>

      {/* Sección Planes de Aula */}
      <section className="portfolio-section">
        <div className="section-header">
          <h2>
            <FaFileAlt /> Planes de Aula
          </h2>
          <label className="btn-upload">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileSelect(e, 'planAula')}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <FaPlus /> Agregar Plan
          </label>
        </div>

        {portfolio.planesAula && portfolio.planesAula.length > 0 ? (
          <div className="documents-grid">
            {portfolio.planesAula.map((plan) => (
              <div key={plan._id} className="document-card">
                <div className="document-icon plan">
                  <FaFileAlt />
                </div>
                <div className="document-info">
                  <h4>{plan.name}</h4>
                  <p className="document-meta">
                    {plan.subject && `${plan.subject} - `}
                    {plan.gradeLevel || 'Sin nivel especificado'}
                  </p>
                </div>
                <div className="document-actions">
                  <a
                    href={plan.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon"
                  >
                    <FaEye />
                  </a>
                  <button
                    onClick={() => handleDeleteDocument('planAula', plan._id)}
                    className="btn-icon btn-delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <p>Agrega tus planes de aula para demostrar tu experiencia pedagógica</p>
          </div>
        )}
      </section>

      {/* Sección Certificados */}
      <section className="portfolio-section">
        <div className="section-header">
          <h2>
            <FaFilePdf /> Certificados y Diplomas
          </h2>
          <label className="btn-upload">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileSelect(e, 'certificado')}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <FaPlus /> Agregar Certificado
          </label>
        </div>

        {portfolio.certificados && portfolio.certificados.length > 0 ? (
          <div className="documents-grid">
            {portfolio.certificados.map((cert) => (
              <div key={cert._id} className="document-card">
                <div className="document-icon cert">
                  <FaFilePdf />
                </div>
                <div className="document-info">
                  <h4>{cert.name}</h4>
                  <p className="document-meta">
                    {cert.institution || 'Institución no especificada'}
                  </p>
                </div>
                <div className="document-actions">
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon"
                  >
                    <FaEye />
                  </a>
                  <button
                    onClick={() => handleDeleteDocument('certificado', cert._id)}
                    className="btn-icon btn-delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaFilePdf className="empty-icon" />
            <p>Sube certificados que respalden tu formación pedagógica</p>
          </div>
        )}
      </section>

      {/* Sección Proyectos */}
      <section className="portfolio-section">
        <div className="section-header">
          <h2>
            <FaFileAlt /> Proyectos Pedagógicos
          </h2>
          <label className="btn-upload">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileSelect(e, 'proyecto')}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <FaPlus /> Agregar Proyecto
          </label>
        </div>

        {portfolio.proyectos && portfolio.proyectos.length > 0 ? (
          <div className="documents-grid">
            {portfolio.proyectos.map((proyecto) => (
              <div key={proyecto._id} className="document-card">
                <div className="document-icon project">
                  <FaFileAlt />
                </div>
                <div className="document-info">
                  <h4>{proyecto.name}</h4>
                  <p className="document-meta">
                    {proyecto.description || 'Sin descripción'}
                  </p>
                </div>
                <div className="document-actions">
                  <a
                    href={proyecto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon"
                  >
                    <FaEye />
                  </a>
                  <button
                    onClick={() => handleDeleteDocument('proyecto', proyecto._id)}
                    className="btn-icon btn-delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <p>Comparte proyectos pedagógicos que hayas desarrollado</p>
          </div>
        )}
      </section>

      {/* Modal de Formulario */}
      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
            <h3>
              {currentType === 'planAula' && 'Información del Plan de Aula'}
              {currentType === 'certificado' && 'Información del Certificado'}
              {currentType === 'proyecto' && 'Información del Proyecto'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Plan de Matemáticas Grado 5"
                />
              </div>

              {currentType === 'planAula' && (
                <>
                  <div className="form-group">
                    <label>Asignatura</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Ej: Matemáticas"
                    />
                  </div>
                  <div className="form-group">
                    <label>Grado/Nivel</label>
                    <input
                      type="text"
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                      placeholder="Ej: Quinto de primaria"
                    />
                  </div>
                </>
              )}

              {currentType === 'certificado' && (
                <>
                  <div className="form-group">
                    <label>Institución</label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="Ej: Universidad Pedagógica"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Emisión</label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    />
                  </div>
                </>
              )}

              {currentType === 'proyecto' && (
                <>
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe brevemente el proyecto"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ej: Inclusión educativa"
                    />
                  </div>
                </>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    window.tempFile = null;
                  }}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPortfolio;
