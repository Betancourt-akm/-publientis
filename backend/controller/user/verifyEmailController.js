const userModel = require('../../models/userModel');

async function verifyEmailController(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Token de verificación no proporcionado.' });
        }

        const user = await userModel.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Enlace de verificación inválido o expirado.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        // Idealmente, aquí redirigirías a una página de éxito en el frontend.
        // Por ahora, enviamos una respuesta JSON de éxito.
        res.status(200).json({ 
            success: true, 
            message: '¡Tu correo ha sido verificado con éxito! Ya puedes iniciar sesión.' 
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || 'Ocurrió un error en el servidor.',
            error: true,
        });
    }
}

module.exports = verifyEmailController;
