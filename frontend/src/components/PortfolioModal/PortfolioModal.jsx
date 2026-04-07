import React, { useState } from 'react';
import { FaTimes, FaFileAlt, FaFilePdf, FaDownload, FaEye, FaGraduationCap, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import './PortfolioModal.css';

const PortfolioModal = ({ isOpen, onClose, candidato }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentViewOpen, setDocumentViewOpen] = useState(false);

  if (!isOpen || !candidato) return null;

  // Documentos del portafolio
  const documentos = candidato.portfolio || {
    cv: candidato.resumeUrl || null,
    planesAula: [],
    certificados: [],
    proyectos: []
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setDocumentViewOpen(true);
  };

  const handleCloseDocumentView = () => {
    setDocumentViewOpen(false);
    setSelectedDocument(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === 'portfolio-modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="portfolio-modal-overlay" onClick={handleBackdropClick}>
      <div className="portfolio-modal-container">
        {/* Header del Modal */}
        <div className="portfolio-modal-header">
          <div className="portfolio-header-info">
            <div className="portfolio-avatar">
              {candidato.profilePic ? (
                <img src={candidato.profilePic} alt={candidato.name} />
              ) : (
                <div className="portfolio-avatar-placeholder">
                  {candidato.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="portfolio-header-text">
              <h2>{candidato.name}</h2>
              <p className="portfolio-subtitle">
                <FaGraduationCap /> {candidato.program || 'Programa no especificado'}
              </p>
              {candidato.pedagogicalTags && candidato.pedagogicalTags.length > 0 && (
                <div className="portfolio-tags">
                  {candidato.pedagogicalTags.map((tag, idx) => (
                    <span key={idx} className="portfolio-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button className="portfolio-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="portfolio-modal-body">
          {/* Información de Contacto */}
          <section className="portfolio-section">
            <h3 className="portfolio-section-title">Información de Contacto</h3>
            <div className="portfolio-contact-grid">
              {candidato.email && (
                <div className="portfolio-contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <span className="contact-label">Email</span>
                    <a href={`mailto:${candidato.email}`} className="contact-value">
                      {candidato.email}
                    </a>
                  </div>
                </div>
              )}
              {candidato.phone && (
                <div className="portfolio-contact-item">
                  <FaPhone className="contact-icon" />
                  <div>
                    <span className="contact-label">Teléfono</span>
                    <span className="contact-value">{candidato.phone}</span>
                  </div>
                </div>
              )}
              {candidato.address?.city && (
                <div className="portfolio-contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div>
                    <span className="contact-label">Ubicación</span>
                    <span className="contact-value">
                      {candidato.address.city}, {candidato.address.state || candidato.address.country}
                    </span>
                  </div>
                </div>
              )}
              {candidato.academicLevel && (
                <div className="portfolio-contact-item">
                  <FaStar className="contact-icon" />
                  <div>
                    <span className="contact-label">Nivel Académico</span>
                    <span className="contact-value">{candidato.academicLevel}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Carta de Presentación (si existe) */}
          {candidato.coverLetter && (
            <section className="portfolio-section">
              <h3 className="portfolio-section-title">Carta de Presentación</h3>
              <div className="portfolio-cover-letter">
                <p>{candidato.coverLetter}</p>
              </div>
            </section>
          )}

          {/* Hoja de Vida / CV */}
          {documentos.cv && (
            <section className="portfolio-section">
              <h3 className="portfolio-section-title">Hoja de Vida</h3>
              <div className="portfolio-document-card">
                <div className="document-icon">
                  <FaFilePdf />
                </div>
                <div className="document-info">
                  <h4>Curriculum Vitae</h4>
                  <p className="document-meta">Documento PDF</p>
                </div>
                <div className="document-actions">
                  <button 
                    className="btn-action btn-view"
                    onClick={() => handleViewDocument({ url: documentos.cv, name: 'CV', type: 'cv' })}
                  >
                    <FaEye /> Ver
                  </button>
                  <a 
                    href={documentos.cv} 
                    download 
                    className="btn-action btn-download"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaDownload /> Descargar
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Planes de Aula */}
          {documentos.planesAula && documentos.planesAula.length > 0 && (
            <section className="portfolio-section">
              <h3 className="portfolio-section-title">Planes de Aula</h3>
              <div className="portfolio-documents-grid">
                {documentos.planesAula.map((plan, idx) => (
                  <div key={idx} className="portfolio-document-card">
                    <div className="document-icon">
                      <FaFileAlt />
                    </div>
                    <div className="document-info">
                      <h4>{plan.name || `Plan de Aula ${idx + 1}`}</h4>
                      <p className="document-meta">{plan.subject || 'Sin asignatura'}</p>
                    </div>
                    <div className="document-actions">
                      <button 
                        className="btn-action btn-view"
                        onClick={() => handleViewDocument(plan)}
                      >
                        <FaEye /> Ver
                      </button>
                      <a 
                        href={plan.url} 
                        download 
                        className="btn-action btn-download"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaDownload />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certificados */}
          {documentos.certificados && documentos.certificados.length > 0 && (
            <section className="portfolio-section">
              <h3 className="portfolio-section-title">Certificados y Diplomas</h3>
              <div className="portfolio-documents-grid">
                {documentos.certificados.map((cert, idx) => (
                  <div key={idx} className="portfolio-document-card">
                    <div className="document-icon certificate">
                      <FaStar />
                    </div>
                    <div className="document-info">
                      <h4>{cert.name || `Certificado ${idx + 1}`}</h4>
                      <p className="document-meta">{cert.institution || 'Institución no especificada'}</p>
                    </div>
                    <div className="document-actions">
                      <button 
                        className="btn-action btn-view"
                        onClick={() => handleViewDocument(cert)}
                      >
                        <FaEye /> Ver
                      </button>
                      <a 
                        href={cert.url} 
                        download 
                        className="btn-action btn-download"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaDownload />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Proyectos Pedagógicos */}
          {documentos.proyectos && documentos.proyectos.length > 0 && (
            <section className="portfolio-section">
              <h3 className="portfolio-section-title">Proyectos Pedagógicos</h3>
              <div className="portfolio-documents-grid">
                {documentos.proyectos.map((proyecto, idx) => (
                  <div key={idx} className="portfolio-document-card">
                    <div className="document-icon project">
                      <FaFileAlt />
                    </div>
                    <div className="document-info">
                      <h4>{proyecto.name || `Proyecto ${idx + 1}`}</h4>
                      <p className="document-meta">{proyecto.description || 'Sin descripción'}</p>
                    </div>
                    <div className="document-actions">
                      <button 
                        className="btn-action btn-view"
                        onClick={() => handleViewDocument(proyecto)}
                      >
                        <FaEye /> Ver
                      </button>
                      <a 
                        href={proyecto.url} 
                        download 
                        className="btn-action btn-download"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaDownload />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Mensaje si no hay documentos */}
          {!documentos.cv && 
           (!documentos.planesAula || documentos.planesAula.length === 0) &&
           (!documentos.certificados || documentos.certificados.length === 0) &&
           (!documentos.proyectos || documentos.proyectos.length === 0) && (
            <div className="portfolio-empty">
              <FaFileAlt className="empty-icon" />
              <p>Este candidato aún no ha cargado documentos en su portafolio.</p>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="portfolio-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn-primary">
            <FaEnvelope /> Contactar Candidato
          </button>
        </div>
      </div>

      {/* Visor de Documentos (sub-modal) */}
      {documentViewOpen && selectedDocument && (
        <div className="document-viewer-overlay" onClick={handleCloseDocumentView}>
          <div className="document-viewer-container" onClick={(e) => e.stopPropagation()}>
            <div className="document-viewer-header">
              <h3>{selectedDocument.name}</h3>
              <button onClick={handleCloseDocumentView}>
                <FaTimes />
              </button>
            </div>
            <div className="document-viewer-body">
              {selectedDocument.url && selectedDocument.url.endsWith('.pdf') ? (
                <iframe 
                  src={selectedDocument.url} 
                  title={selectedDocument.name}
                  className="pdf-viewer"
                />
              ) : (
                <div className="document-preview">
                  <p>Vista previa no disponible</p>
                  <a 
                    href={selectedDocument.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Abrir en nueva pestaña
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioModal;
