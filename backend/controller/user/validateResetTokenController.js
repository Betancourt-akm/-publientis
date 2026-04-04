const userModel = require('../../models/userModel');

async function validateResetTokenController(req, res) {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ message: 'Token no proporcionado.' });
        }

        const user = await userModel.findOne({
            passwordResetToken: token,
            passwordResetTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'El enlace para restablecer la contraseña es inválido o ha expirado.' 
            });
        }

        // El token es válido, el frontend puede mostrar el formulario de reseteo.
        res.status(200).json({
            success: true,
            message: 'Token válido.',
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || 'Ocurrió un error en el servidor.',
            error: true,
        });
    }
}

module.exports = validateResetTokenController;
