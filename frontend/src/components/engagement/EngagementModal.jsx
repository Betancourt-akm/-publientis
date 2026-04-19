import React from 'react';
import { FaUserGraduate, FaBuilding, FaHandshake, FaTimes, FaRocket, FaShieldAlt, FaStar } from 'react-icons/fa';
import './EngagementModal.css';

/**
 * EngagementModal - Modal de Conversión para Progressive Engagement
 * 
 * Diseñado según principios de psicología del usuario:
 * - Enfoque en beneficios, no en barreras
 * - Diseño visual atractivo
 * - Llamados a la acción claros
 * - Opciones de registro rápido
 */

const EngagementModal = ({ actionType, customMessage, onRegister, onLogin, onClose }) => {
  
  const getContent = () => {
    switch(actionType) {
      case 'view':
        return {
          icon: <FaUserGraduate className="modal-main-icon" />,
          title: '¡Descubre el Talento Universitario Completo!',
          message: customMessage || 'Accede al perfil completo, portafolio, certificados y experiencia profesional de este egresado. Conecta con el mejor talento universitario.',
          benefits: [
            'Ver portafolio profesional completo',
            'Acceder a certificados y planes de aula',
            'Contactar directamente con candidatos',
            'Guardar perfiles favoritos'
          ]
        };
      
      case 'apply':
        return {
          icon: <FaHandshake className="modal-main-icon" />,
          title: '¿Listo para Aplicar?',
          message: customMessage || 'Únete a Publientis para postularte a esta vacante y conectar con instituciones educativas de calidad.',
          benefits: [
            'Postular con un solo clic',
            'Seguimiento de tus aplicaciones',
            'Notificaciones de respuestas',
            'Generar CV pedagógico automático'
          ]
        };
      
      case 'save':
        return {
          icon: <FaStar className="modal-main-icon" />,
          title: 'Guarda tus Candidatos Favoritos',
          message: customMessage || 'Crea listas personalizadas de talento, agrega notas y organiza tu proceso de contratación.',
          benefits: [
            'Guardar candidatos con notas',
            'Organizar por etiquetas',
            'Recibir alertas de nuevos perfiles',
            'Comparar candidatos fácilmente'
          ]
        };
      
      case 'download':
        return {
          icon: <FaRocket className="modal-main-icon" />,
          title: 'Descarga CV Profesionales',
          message: customMessage || 'Accede a currículums pedagógicos en formato institucional listos para descargar.',
          benefits: [
            'CV con formato profesional',
            'Toda la información pedagógica',
            'Actualizado en tiempo real',
            'Verificado por la Universidad'
          ]
        };
      
      default:
        return {
          icon: <FaBuilding className="modal-main-icon" />,
          title: 'Únete a la Red de Vinculación Pedagógica',
          message: customMessage || 'Regístrate para acceder a todas las funcionalidades de Publientis y conectar con talento e instituciones.',
          benefits: [
            'Acceso completo a perfiles',
            'Aplicar a vacantes',
            'Networking pedagógico',
            'Herramientas de gestión'
          ]
        };
    }
  };

  const content = getContent();

  return (
    <div className="engagement-modal-overlay" onClick={onClose}>
      <div className="engagement-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="engagement-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="engagement-modal-header">
          {content.icon}
          <h2>{content.title}</h2>
          <p className="engagement-modal-message">{content.message}</p>
        </div>

        <div className="engagement-modal-benefits">
          <h3>Al registrarte obtienes:</h3>
          <ul className="benefits-list">
            {content.benefits.map((benefit, index) => (
              <li key={index}>
                <FaShieldAlt className="benefit-icon" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="engagement-modal-actions">
          <button className="action-button primary" onClick={onRegister}>
            <FaRocket />
            Crear Cuenta Gratis
          </button>
          <button className="action-button secondary" onClick={onLogin}>
            Ya tengo cuenta
          </button>
        </div>

        <div className="engagement-modal-footer">
          <p className="trust-badge">
            <FaShieldAlt className="shield-icon" />
            Plataforma verificada por la Universidad
          </p>
          <p className="privacy-note">
            100% gratuito • Sin spam • Datos protegidos
          </p>
        </div>
      </div>
    </div>
  );
};

export default EngagementModal;
