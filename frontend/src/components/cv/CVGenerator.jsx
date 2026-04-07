import React, { useState } from 'react';
import { FaFilePdf, FaDownload, FaTimes, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './CVGenerator.css';

const CVGenerator = ({ onClose }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGenerateCV = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axiosInstance.get('/api/cv/generate', {
        responseType: 'blob'
      });

      // Crear URL del blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear link temporal para descarga
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CV_Pedagogico_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Limpiar URL
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Error al generar CV:', err);
      setError('Error al generar el CV. Por favor intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="cv-generator-modal-overlay">
      <div className="cv-generator-modal">
        <button className="close-button" onClick={onClose} disabled={generating}>
          <FaTimes />
        </button>

        <div className="modal-header">
          <FaFilePdf className="header-icon" />
          <h2>Generar CV Pedagógico</h2>
          <p>Exporta tu perfil profesional en formato PDF</p>
        </div>

        <div className="modal-body">
          {!generating && !success && !error && (
            <div className="cv-preview-info">
              <h3>Tu CV incluirá:</h3>
              <ul className="cv-sections-list">
                <li>
                  <FaCheckCircle className="check-icon" />
                  <div>
                    <strong>Información de Contacto</strong>
                    <span>Nombre, email, teléfono, programa académico</span>
                  </div>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <div>
                    <strong>Perfil Profesional</strong>
                    <span>Áreas de especialización pedagógica</span>
                  </div>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <div>
                    <strong>Formación Académica</strong>
                    <span>Universidad, facultad, nivel académico</span>
                  </div>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <div>
                    <strong>Experiencia Pedagógica</strong>
                    <span>Prácticas y vinculaciones realizadas</span>
                  </div>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <div>
                    <strong>Portafolio Pedagógico</strong>
                    <span>Planes de aula, certificados, proyectos</span>
                  </div>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <div>
                    <strong>Competencias</strong>
                    <span>Habilidades y etiquetas pedagógicas</span>
                  </div>
                </li>
              </ul>

              <div className="cv-format-info">
                <p><strong>Formato:</strong> PDF • A4</p>
                <p><strong>Diseño:</strong> Profesional con colores institucionales</p>
                <p><strong>Marca:</strong> Generado por Publientis</p>
              </div>
            </div>
          )}

          {generating && (
            <div className="generating-state">
              <FaSpinner className="spinner-icon" />
              <h3>Generando tu CV...</h3>
              <p>Esto tomará solo unos segundos</p>
            </div>
          )}

          {success && (
            <div className="success-state">
              <FaCheckCircle className="success-icon" />
              <h3>¡CV Generado Exitosamente!</h3>
              <p>Tu CV se ha descargado automáticamente</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error al Generar CV</h3>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!generating && !success && (
            <>
              <button className="cancel-btn" onClick={onClose}>
                Cancelar
              </button>
              <button className="generate-btn" onClick={handleGenerateCV}>
                <FaDownload /> Generar y Descargar
              </button>
            </>
          )}

          {error && (
            <>
              <button className="cancel-btn" onClick={onClose}>
                Cerrar
              </button>
              <button className="generate-btn" onClick={handleGenerateCV}>
                <FaDownload /> Intentar de Nuevo
              </button>
            </>
          )}

          {success && (
            <button className="close-success-btn" onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVGenerator;
