const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Crear transportador usando OAuth2 con las credenciales de Google del .env
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_FROM,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    // Definir las opciones del correo
    const mailOptions = {
      from: `MachTAI <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('No se pudo enviar el correo electrónico');
  }
};

module.exports = sendEmail;
