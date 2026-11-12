/**
 * Configuración del microservicio de verificación facial
 * Valida la existencia de las variables de entorno requeridas al inicio o al uso.
 */

function getFaceVerifierConfig() {
  const apiUrl = process.env.VERIFIER_API_URL;
  const apiKey = process.env.VERIFIER_API_KEY;

  const missing = [];
  if (!apiUrl) missing.push('VERIFIER_API_URL');
  if (!apiKey) missing.push('VERIFIER_API_KEY');

  if (missing.length > 0) {
    const errorMsg = `[FaceVerifierConfig] Variables de entorno faltantes para verificación facial: ${missing.join(', ')}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  return {
    apiUrl: apiUrl.replace(/\/+$/, ''), // Elimina slashes finales si los hay
    apiKey
  };
}

module.exports = {
  getFaceVerifierConfig
};