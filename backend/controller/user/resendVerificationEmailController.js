const userModel = require('../../models/userModel');
const { generateToken } = require('../../utils/tokenUtils');
const sendEmail = require('../../utils/emailService');

async function resendVerificationEmailController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Se requiere el correo electrónico.' });
        }

        const user = await userModel.findOne({ email });

        // Si el usuario no existe o ya está verificado, enviamos una respuesta genérica por seguridad.
        if (!user || user.isVerified) {
            return res.status(200).json({
                success: true,
                message: 'Si existe una cuenta asociada a este correo y no está verificada, se ha enviado un nuevo enlace de verificación.'
            });
        }

        // Generar un nuevo token y fecha de expiración
        const verificationToken = generateToken();
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

        await user.save();

        // Enviar el nuevo correo de verificación
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${user.verificationToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Verifica tu dirección de correo electrónico</h2>
                <p>Has solicitado reenviar el correo de verificación. Por favor, haz clic en el siguiente botón para confirmar tu cuenta:</p>
                <a href="${verificationLink}" style="background-color: #d9534f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar mi Correo</a>
                <p>Si el botón no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:</p>
                <p><a href="${verificationLink}">${verificationLink}</a></p>
                <p>Este enlace expirará en 24 horas.</p>
                <hr/>
                <p>Saludos,<br>El equipo de Mach TAI</p>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Reenvío: Verifica tu cuenta en Mach TAI',
            html: emailHtml
        });

        res.status(200).json({
            success: true,
            message: 'Si existe una cuenta asociada a este correo y no está verificada, se ha enviado un nuevo enlace de verificación.'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || 'Ocurrió un error en el servidor.',
            error: true,
        });
    }
}

module.exports = resendVerificationEmailController;
