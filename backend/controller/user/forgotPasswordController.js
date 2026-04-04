const userModel = require('../../models/userModel');
const { generateToken } = require('../../utils/tokenUtils');
const sendEmail = require('../../utils/emailService');

async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Se requiere el correo electrónico.' });
        }

        const user = await userModel.findOne({ email });

        // Por seguridad, no revelamos si el usuario existe o no.
        // Solo procedemos si el usuario existe y está verificado.
        if (user && user.isVerified) {
            const resetToken = generateToken();
            const resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutos

            user.passwordResetToken = resetToken;
            user.passwordResetTokenExpiresAt = resetTokenExpires;
            await user.save();

            const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Solicitud de Restablecimiento de Contraseña</h2>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para continuar:</p>
                    <a href="${resetLink}" style="background-color: #d9534f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
                    <p>Si el botón no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:</p>
                    <p><a href="${resetLink}">${resetLink}</a></p>
                    <p>Este enlace es válido solo por 15 minutos.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                    <hr/>
                    <p>Saludos,<br>El equipo de Mach TAI</p>
                </div>
            `;

            await sendEmail({
                to: user.email,
                subject: 'Restablece tu contraseña de Mach TAI',
                html: emailHtml
            });
        }

        // Enviamos siempre una respuesta genérica.
        res.status(200).json({
            success: true,
            message: 'Si tu correo está registrado con nosotros, recibirás un enlace para restablecer tu contraseña.',
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || 'Ocurrió un error en el servidor.',
            error: true,
        });
    }
}

module.exports = forgotPasswordController;
