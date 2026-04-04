const sendEmail = require('../../utils/emailService');

const formController = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // 1. Validar que todos los campos necesarios están presentes
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Por favor, completa todos los campos del formulario.' 
    });
  }

  // 2. Preparar el contenido del correo que se enviará al administrador
  const emailContent = `
    <h1>Nuevo Mensaje de Contacto</h1>
    <p>Has recibido un nuevo mensaje a través del formulario de tu sitio web.</p>
    <ul>
      <li><strong>Nombre:</strong> ${name}</li>
      <li><strong>Email del Remitente:</strong> ${email}</li>
      <li><strong>Asunto:</strong> ${subject}</li>
    </ul>
    <h2>Mensaje:</h2>
    <p>${message}</p>
  `;

  // 3. Definir las opciones para el servicio de correo
  const options = {
    // ¡IMPORTANTE! Este es el email que recibirá los mensajes de contacto.
    // Cámbialo por tu email de administrador si es diferente.
    to: process.env.EMAIL_FROM, 
    subject: `Nuevo Contacto: ${subject}`,
    html: emailContent,
  };

  try {
    // 4. Usar el servicio centralizado para enviar el correo
    await sendEmail(options);
    res.status(200).json({ 
      success: true, 
      message: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.' 
    });
  } catch (error) {
    console.error('Error al enviar el correo desde el formulario de contacto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Hubo un error al intentar enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.' 
    });
  }
};

module.exports = { formController };
exports.sendForm = async (req, res) => {
  try {
    const data = req.body;
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'alexis.betancur@est.iudigital.edu.co', 
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    });
    const mailOptions = {
      from: data.email,
      to: 'alexis.betancur@est.iudigital.edu.co',
      subject: `Message from ${data.name}`,
      html: `
        <h3>Información</h3>
        <ul>
          <li>Nombre: ${data.name}</li>
          <li>Correo: ${data.email}</li>
          <li>Asunto: ${data.subject}</li>
        </ul>
        <h2>Mensaje</h2>
        <p>${data.message}</p>
      `,
    };

    // Enviar el correo
    const info = await transport.sendMail(mailOptions);
    console.log('Email enviado:', info.response);
    return res.send('Success');
  } catch (error) {
    console.error('Error al enviar el correo:', error);

    let errorMessage = 'Hubo un problema al enviar el correo electrónico.';
    if (error.response) {
      errorMessage = `El servidor respondió con un error: ${error.response}`;
    } else if (error.code === 'EAUTH') {
      errorMessage = 'Error de autenticación. Las credenciales son incorrectas.';
    } else {
      errorMessage = error.message;
    }

    return res.status(500).json({ error: errorMessage });
  }
};
