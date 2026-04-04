const userModel = require("../../models/userModel");
const bcrypt = require('bcryptjs');

async function setPassword(req, res) {
    try {
        const userId = req.userId;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "La contraseña es requerida",
                success: false,
                error: true
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 6 caracteres",
                success: false,
                error: true
            });
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Actualizar usuario con la nueva contraseña
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { 
                password: hashedPassword,
                passwordChangedAt: new Date()
            },
            { new: true }
        ).select('+password');

        res.json({
            message: "Contraseña establecida exitosamente. Ahora puedes iniciar sesión con email y contraseña.",
            success: true,
            error: false
        });

    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = setPassword;
