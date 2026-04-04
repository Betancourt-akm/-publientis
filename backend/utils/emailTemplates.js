/**
 * Templates HTML profesionales para emails del e-commerce
 * Diseño responsivo y moderno
 */

// Helper para formatear precios
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
};

// Helper para calcular rango de entrega
const getDeliveryDateRange = () => {
  const start = new Date();
  start.setDate(start.getDate() + 3);
  const end = new Date();
  end.setDate(end.getDate() + 5);
  return `${start.toLocaleDateString('es-CO')} y ${end.toLocaleDateString('es-CO')}`;
};

// Estilos base reutilizables
const baseStyles = `
  <style>
    body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #333333; margin-bottom: 20px; }
    .order-box { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
    .order-number { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
    .button { display: inline-block; padding: 15px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { background-color: #333333; color: #ffffff; text-align: center; padding: 30px 20px; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
`;

module.exports = {
  formatPrice,
  getDeliveryDateRange,
  baseStyles
};
