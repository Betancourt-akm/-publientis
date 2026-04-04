const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');

async function resetPasswordController(req, res) {
    try {
        const { token, newPassword, confirmNewPassword } = req.body;

        if (!token || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
        }

        // Aquí podrías añadir validaciones de fortaleza de la contraseña

        const user = await userModel.findOne({
            passwordResetToken: token,
            passwordResetTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'El enlace para restablecer la contraseña es inválido o ha expirado.' });
        }

        // Hashear la nueva contraseña
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(newPassword, salt);

        // Actualizar el usuario
        user.password = hashPassword;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiresAt = undefined;
        // También es buena práctica invalidar el token de verificación si se resetea la contraseña
        user.isVerified = true; 

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.',
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || 'Ocurrió un error en el servidor.',
            error: true,
        });
    }
}

module.exports = resetPasswordController;
