// services/emailService.js
const nodemailer = require('nodemailer');
const oAuth2Client = require('../config/googleAuth');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Pedimos un accessToken fresco
    const { token: accessToken } = await oAuth2Client.getAccessToken();
    if (!accessToken) throw new Error('No se obtuvo accessToken');

    // Configuramos el transportador
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_FROM,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken,              // <--- aquí
      },
    });

    // Opciones del correo
    await transporter.sendMail({
      from: `"MachTAI" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text
    });

    console.log(`Correo enviado a ${to}`);
  } catch (err) {
    console.error('Error en emailService.sendEmail():', err);
    throw new Error('No se pudo enviar el correo electrónico');
  }
};

module.exports = sendEmail;
