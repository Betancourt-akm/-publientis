const { getFaceVerifierConfig } = require('../config/faceVerifierConfig');

/**
 * Error personalizado para distinguir errores de cliente vs errores de gateway/red
 */
class FaceVerifierError extends Error {
  constructor(message, statusCode = 500, isClientError = false) {
    super(message);
    this.name = 'FaceVerifierError';
    this.statusCode = statusCode;
    this.isClientError = isClientError;
  }
}

/**
 * Envía las imágenes de documento y selfie al microservicio externo de verificación facial
 * mediante multipart/form-data en memoria usando fetch y FormData nativos de Node 18+.
 *
 * @param {Object} params
 * @param {Buffer} params.documentBuffer - Buffer en memoria del documento de identidad
 * @param {string} params.documentMimeType - MIME type del documento (image/jpeg o image/png)
 * @param {string} [params.documentOriginalName] - Nombre original del archivo del documento
 * @param {Buffer} params.selfieBuffer - Buffer en memoria de la selfie
 * @param {string} params.selfieMimeType - MIME type de la selfie (image/jpeg o image/png)
 * @param {string} [params.selfieOriginalName] - Nombre original del archivo de la selfie
 * @returns {Promise<{ verified: boolean, confidenceScore: number, message: string }>}
 */
async function compareFaces({
  documentBuffer,
  documentMimeType,
  documentOriginalName,
  selfieBuffer,
  selfieMimeType,
  selfieOriginalName
}) {
  const { apiUrl, apiKey } = getFaceVerifierConfig();

  // Construir multipart/form-data usando FormData y Blob nativos (Node 18+)
  const formData = new FormData();
  formData.append(
    'document_image',
    new Blob([documentBuffer], { type: documentMimeType || 'image/jpeg' }),
    documentOriginalName || 'document_image.jpg'
  );
  formData.append(
    'selfie_image',
    new Blob([selfieBuffer], { type: selfieMimeType || 'image/jpeg' }),
    selfieOriginalName || 'selfie_image.jpg'
  );

  // Timeout de 30 segundos usando AbortController nativo
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 30000);

  try {
    const response = await fetch(`${apiUrl}/api/v1/compare-faces`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey
      },
      body: formData,
      signal: abortController.signal
    });

    // 1. Respuesta exitosa (200 OK)
    if (response.ok) {
      const data = await response.json();
      return {
        verified: Boolean(data.verified),
        confidenceScore: typeof data.confidence_score === 'number' ? data.confidence_score : 0,
        message: data.message || 'Verificación facial completada.'
      };
    }

    // 2. Extraer detalle de error del JSON si está presente
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      if (errorJson && typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      }
    } catch (_) {
      // Si la respuesta no es JSON, se conserva errorDetail vacío
    }

    // 3. Errores de cliente según el contrato (400, 413, 415, 422)
    if ([400, 413, 415, 422].includes(response.status)) {
      const clientMessage = errorDetail || 'Error de validación al procesar las imágenes.';
      throw new FaceVerifierError(clientMessage, response.status, true);
    }

    // 4. Error 401: Clave API incorrecta o ausente (error de configuración interna, no del usuario)
    if (response.status === 401) {
      console.error('❌ [FaceVerifierService] Error de autenticación 401 con el microservicio. Clave VERIFIER_API_KEY rechazada o ausente.');
      throw new FaceVerifierError('Servicio de verificación no disponible temporalmente', 502, false);
    }

    // 5. Error 500 u otros códigos HTTP del microservicio
    console.error(`❌ [FaceVerifierService] Error interno en microservicio facial (HTTP ${response.status}): ${errorDetail || 'Sin detalle'}`);
    throw new FaceVerifierError('Servicio de verificación no disponible temporalmente', 502, false);

  } catch (error) {
    // Timeout
    if (error.name === 'AbortError') {
      console.error('⏱️ [FaceVerifierService] Timeout de 30s al conectar con el microservicio facial.');
      throw new FaceVerifierError('Tiempo de espera agotado al conectar con el servicio de verificación', 504, false);
    }

    // Si ya es un FaceVerifierError controlado, propagarlo
    if (error instanceof FaceVerifierError) {
      throw error;
    }

    // Errores de red (DNS, conexión rechazada, socket colgado)
    console.error('❌ [FaceVerifierService] Error de red o comunicación con microservicio facial:', error.message);
    throw new FaceVerifierError('Servicio de verificación no disponible temporalmente', 502, false);
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  compareFaces,
  FaceVerifierError
};