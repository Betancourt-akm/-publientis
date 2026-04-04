const axios = require('axios');

const verifyRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'reCAPTCHA token es requerido.' });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      {},
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      }
    );

    const { success, score } = response.data;

    if (!success || score < 0.5) {
      return res.status(400).json({ message: 'Falló la verificación de reCAPTCHA. Eres un robot?' });
    }

    // Eliminar el token del cuerpo para que no llegue a los controladores
    delete req.body.recaptchaToken;
    next();

  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error);
    return res.status(500).json({ message: 'Error en el servidor al verificar reCAPTCHA.' });
  }
};

module.exports = verifyRecaptcha;
