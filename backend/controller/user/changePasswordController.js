const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');

async function changePasswordController(req, res) {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const userId = req.user._id; // Obtenido del middleware authToken

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'La nueva contraseña y su confirmación no coinciden.' });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
        }

        // Hashear y guardar la nueva contraseña
        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(newPassword, salt);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Tu contraseña ha sido cambiada con éxito.',
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || 'Ocurrió un error en el servidor.',
            error: true,
        });
    }
}

module.exports = changePasswordController;
