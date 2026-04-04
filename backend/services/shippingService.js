/**
 * Servicio de Integración con Transportadoras Colombianas
 * Soporta: Servientrega, Coordinadora
 */

const fetch = require('node-fetch');

/**
 * Integración con Servientrega
 * Nota: Requiere credenciales de API de Servientrega
 */
const trackServientrega = async (trackingNumber) => {
  try {
    // Simulación de respuesta - En producción, usa la API real de Servientrega
    // URL Real: https://api.servientrega.com/tracking
    
    console.log(`🔍 Rastreando con Servientrega: ${trackingNumber}`);
    
    // SIMULACIÓN - Reemplazar con API real
    const mockResponse = {
      success: true,
      carrier: 'Servientrega',
      trackingNumber: trackingNumber,
      status: 'EN_TRANSITO',
      statusDescription: 'En tránsito hacia la ciudad destino',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      currentLocation: 'Centro de Distribución Bogotá',
      history: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'RECIBIDO',
          location: 'Medellín - Centro de Acopio',
          description: 'Paquete recibido en origen'
        },
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'EN_RUTA',
          location: 'En ruta a Bogotá',
          description: 'Paquete en tránsito'
        },
        {
          date: new Date().toISOString(),
          status: 'EN_CENTRO',
          location: 'Centro de Distribución Bogotá',
          description: 'Llegó a centro de distribución'
        }
      ]
    };

    /* IMPLEMENTACIÓN REAL (Descomentar cuando tengas credenciales):
    const response = await fetch(`https://api.servientrega.com/tracking/${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SERVIENTREGA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error de Servientrega: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      carrier: 'Servientrega',
      trackingNumber: data.numeroGuia,
      status: data.estadoActual,
      statusDescription: data.descripcionEstado,
      estimatedDelivery: data.fechaEstimadaEntrega,
      currentLocation: data.ubicacionActual,
      history: data.historial.map(h => ({
        date: h.fecha,
        status: h.estado,
        location: h.ubicacion,
        description: h.descripcion
      }))
    };
    */

    return mockResponse;
  } catch (error) {
    console.error('❌ Error rastreando con Servientrega:', error);
    return {
      success: false,
      error: error.message,
      carrier: 'Servientrega'
    };
  }
};

/**
 * Integración con Coordinadora
 * Nota: Requiere credenciales de API de Coordinadora
 */
const trackCoordinadora = async (trackingNumber) => {
  try {
    console.log(`🔍 Rastreando con Coordinadora: ${trackingNumber}`);
    
    // SIMULACIÓN - Reemplazar con API real
    const mockResponse = {
      success: true,
      carrier: 'Coordinadora',
      trackingNumber: trackingNumber,
      status: 'EN_DISTRIBUCION',
      statusDescription: 'En reparto hacia la dirección destino',
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      currentLocation: 'Bodega Bogotá - Mensajero asignado',
      history: [
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'RECOLECTADO',
          location: 'Medellín',
          description: 'Paquete recolectado en origen'
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'EN_TRANSITO',
          location: 'Terminal Medellín',
          description: 'En ruta hacia destino'
        },
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'LLEGADA_DESTINO',
          location: 'Bodega Bogotá',
          description: 'Llegó a bodega destino'
        },
        {
          date: new Date().toISOString(),
          status: 'EN_REPARTO',
          location: 'Bogotá - Mensajero #45',
          description: 'Paquete en reparto'
        }
      ]
    };

    /* IMPLEMENTACIÓN REAL (Descomentar cuando tengas credenciales):
    const response = await fetch('https://api.coordinadora.com/cm-consulta-guias-ms/guia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'p_api_key': process.env.COORDINADORA_API_KEY
      },
      body: JSON.stringify({
        numero_guia: trackingNumber
      })
    });

    if (!response.ok) {
      throw new Error(`Error de Coordinadora: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      carrier: 'Coordinadora',
      trackingNumber: data.guia,
      status: data.estado_ultimo,
      statusDescription: data.descripcion_estado,
      estimatedDelivery: data.fecha_entrega_estimada,
      currentLocation: data.ubicacion_actual,
      history: data.movimientos.map(m => ({
        date: m.fecha,
        status: m.estado,
        location: m.ciudad,
        description: m.observacion
      }))
    };
    */

    return mockResponse;
  } catch (error) {
    console.error('❌ Error rastreando con Coordinadora:', error);
    return {
      success: false,
      error: error.message,
      carrier: 'Coordinadora'
    };
  }
};

/**
 * Detectar transportadora automáticamente basado en el formato del tracking
 */
const detectCarrier = (trackingNumber) => {
  if (!trackingNumber) return null;

  // Servientrega: generalmente comienza con números
  // Coordinadora: formato específico con letras y números
  
  // Heurística simple (ajustar según formatos reales)
  if (/^\d{10,15}$/.test(trackingNumber)) {
    return 'servientrega';
  }
  
  if (/^[A-Z]{2}\d{8,12}$/.test(trackingNumber)) {
    return 'coordinadora';
  }

  // Por defecto, intentar con Coordinadora (más común)
  return 'coordinadora';
};

/**
 * Función principal de tracking que intenta con la transportadora correcta
 */
const trackShipment = async (trackingNumber, carrier = null) => {
  try {
    console.log(`📦 Iniciando rastreo de: ${trackingNumber}`);
    
    if (!trackingNumber || trackingNumber === 'null' || trackingNumber === 'undefined') {
      return {
        success: false,
        error: 'Número de seguimiento no disponible',
        message: 'Este pedido aún no ha sido enviado o no tiene número de seguimiento asignado.'
      };
    }

    // Detectar transportadora si no se especifica
    const detectedCarrier = carrier || detectCarrier(trackingNumber);
    console.log(`🚚 Transportadora detectada: ${detectedCarrier}`);

    let result;

    switch (detectedCarrier.toLowerCase()) {
      case 'servientrega':
        result = await trackServientrega(trackingNumber);
        break;
      
      case 'coordinadora':
        result = await trackCoordinadora(trackingNumber);
        break;
      
      default:
        // Intentar primero con Coordinadora, luego Servientrega
        result = await trackCoordinadora(trackingNumber);
        if (!result.success) {
          console.log('⚠️ Fallo con Coordinadora, intentando Servientrega...');
          result = await trackServientrega(trackingNumber);
        }
    }

    // Normalizar el estado para la UI
    if (result.success) {
      result.normalizedStatus = normalizeStatus(result.status);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en trackShipment:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error al consultar el estado del envío'
    };
  }
};

/**
 * Normalizar estados de diferentes transportadoras a estados comunes
 */
const normalizeStatus = (status) => {
  const statusMap = {
    // Estados comunes
    'RECIBIDO': 'received',
    'RECOLECTADO': 'received',
    'EN_TRANSITO': 'in_transit',
    'EN_RUTA': 'in_transit',
    'EN_CENTRO': 'at_facility',
    'LLEGADA_DESTINO': 'at_facility',
    'EN_DISTRIBUCION': 'out_for_delivery',
    'EN_REPARTO': 'out_for_delivery',
    'ENTREGADO': 'delivered',
    'DEVUELTO': 'returned',
    'PROBLEMA': 'exception'
  };

  return statusMap[status] || 'unknown';
};

/**
 * Obtener información de tracking formateada para la UI
 */
const getTrackingInfo = async (trackingNumber, carrier = null) => {
  const result = await trackShipment(trackingNumber, carrier);
  
  if (!result.success) {
    return result;
  }

  // Formatear para la UI
  return {
    success: true,
    tracking: {
      number: result.trackingNumber,
      carrier: result.carrier,
      status: result.normalizedStatus,
      statusText: result.statusDescription,
      currentLocation: result.currentLocation,
      estimatedDelivery: result.estimatedDelivery,
      timeline: result.history.map((event, index) => ({
        id: index,
        date: event.date,
        status: event.status,
        location: event.location,
        description: event.description,
        completed: true // Todos los eventos históricos están completados
      }))
    }
  };
};

module.exports = {
  trackShipment,
  trackServientrega,
  trackCoordinadora,
  detectCarrier,
  getTrackingInfo,
  normalizeStatus
};
