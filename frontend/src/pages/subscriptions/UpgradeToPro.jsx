import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../context';
import axiosInstance from '../../utils/axiosInstance';
import { FaCheck, FaStar, FaChartLine, FaFilter, FaHeadset, FaCheckCircle } from 'react-icons/fa';
import './UpgradeToPro.css';

const UpgradeToPro = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wompi'); // wompi o paypal

  if (!user || user.role !== 'ORGANIZATION') {
    return (
      <div className="upgrade-pro-page">
        <div className="upgrade-error">
          <h2>Acceso Restringido</h2>
          <p>Solo las organizaciones pueden actualizar a Plan PRO</p>
          <button onClick={() => navigate('/jobs')} className="btn-secondary">
            Volver a Prácticas
          </button>
        </div>
      </div>
    );
  }

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Simular proceso de pago
      // En producción, aquí iría la integración real con Wompi/PayPal
      
      // Por ahora, activar directamente
      const response = await axiosInstance.post('/api/subscriptions/upgrade-to-pro', {
        transactionId: `DEMO-${Date.now()}`,
        frequency: 'monthly'
      });

      if (response.data.success) {
        alert('¡Plan PRO activado exitosamente! 🎉');
        navigate('/jobs/my-offers');
      }
    } catch (error) {
      console.error('Error al activar PRO:', error);
      alert('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upgrade-pro-page">
      <div className="upgrade-container">
        {/* Header discreto */}
        <div className="upgrade-header">
          <h1>Mejora tu Experiencia</h1>
          <p className="upgrade-subtitle">
            Destaca tus ofertas y encuentra talento más rápido con Plan PRO
          </p>
        </div>

        {/* Comparación de Planes */}
        <div className="plans-comparison">
          {/* Plan FREE */}
          <div className="plan-card plan-free">
            <div className="plan-header">
              <h3>Plan Gratuito</h3>
              <div className="plan-price">
                <span className="price-amount">$0</span>
                <span className="price-period">siempre</span>
              </div>
            </div>
            <div className="plan-features">
              <div className="feature">
                <FaCheck className="feature-icon" />
                <span>Publicar ofertas ilimitadas</span>
              </div>
              <div className="feature">
                <FaCheck className="feature-icon" />
                <span>Recibir postulaciones</span>
              </div>
              <div className="feature">
                <FaCheck className="feature-icon" />
                <span>Chat con candidatos</span>
              </div>
              <div className="feature">
                <FaCheck className="feature-icon" />
                <span>Gestión básica</span>
              </div>
            </div>
          </div>

          {/* Plan PRO */}
          <div className="plan-card plan-pro">
            <div className="plan-badge">Recomendado</div>
            <div className="plan-header">
              <h3>Plan PRO</h3>
              <div className="plan-price">
                <span className="price-amount">$1</span>
                <span className="price-period">USD/mes</span>
              </div>
              <p className="price-note">~$4.500 COP/mes</p>
            </div>
            <div className="plan-features">
              <div className="feature featured">
                <FaStar className="feature-icon" />
                <span><strong>Ofertas destacadas</strong> - Aparecen primero</span>
              </div>
              <div className="feature featured">
                <FaCheckCircle className="feature-icon" />
                <span><strong>Badge verificado</strong> - Mayor confianza</span>
              </div>
              <div className="feature featured">
                <FaChartLine className="feature-icon" />
                <span><strong>Estadísticas avanzadas</strong> - Visualizaciones, clics</span>
              </div>
              <div className="feature featured">
                <FaFilter className="feature-icon" />
                <span><strong>Filtros avanzados</strong> - Encuentra candidatos ideales</span>
              </div>
              <div className="feature featured">
                <FaHeadset className="feature-icon" />
                <span><strong>Soporte prioritario</strong> - Ayuda rápida</span>
              </div>
              <div className="feature">
                <FaCheck className="feature-icon" />
                <span>Todo lo del plan gratuito</span>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficios Destacados */}
        <div className="benefits-section">
          <h2>¿Por qué actualizar a PRO?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <FaStar className="benefit-icon" />
              <h4>Mayor Visibilidad</h4>
              <p>Tus ofertas aparecen primero en búsquedas y feed</p>
            </div>
            <div className="benefit-card">
              <FaChartLine className="benefit-icon" />
              <h4>Encuentra Más Rápido</h4>
              <p>Recibe postulaciones de candidatos calificados antes</p>
            </div>
            <div className="benefit-card">
              <FaCheckCircle className="benefit-icon" />
              <h4>Credibilidad</h4>
              <p>El badge PRO genera confianza en estudiantes</p>
            </div>
          </div>
        </div>

        {/* Sección de Pago Discreta */}
        <div className="payment-section">
          <h3>Activa Plan PRO por solo $1 USD/mes</h3>
          
          <div className="payment-methods">
            <button
              className={`payment-method ${paymentMethod === 'wompi' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('wompi')}
            >
              💳 Wompi (Tarjeta Colombia)
            </button>
            <button
              className={`payment-method ${paymentMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('paypal')}
            >
              💰 PayPal (Internacional)
            </button>
          </div>

          <div className="payment-info">
            <p>✅ Cancela cuando quieras</p>
            <p>✅ Sin permanencia mínima</p>
            <p>✅ Primer mes completo garantizado</p>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn-upgrade"
          >
            {loading ? 'Procesando...' : 'Activar Plan PRO - $1 USD/mes'}
          </button>

          <p className="cancel-note">
            Al continuar, tu plan PRO se activará. Puedes cancelar en cualquier momento desde tu panel.
          </p>
        </div>

        {/* Link discreto para volver */}
        <div className="back-link">
          <button onClick={() => navigate(-1)} className="link-btn">
            ← Volver sin actualizar (seguir usando gratis)
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeToPro;
