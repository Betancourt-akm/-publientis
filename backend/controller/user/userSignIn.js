const bcrypt = require('bcryptjs');
const userModel = require('../../models/userModel');
const jwt = require('jsonwebtoken');

async function userSignInController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new Error("Por favor, proporcione su correo y contraseña");
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            // Por seguridad, no revelamos si el usuario no existe o la contraseña es incorrecta.
            throw new Error("Credenciales inválidas");
        }

        // --- Verificación de Correo Electrónico (Opcional) ---
        // Si necesitas reactivar esto, asegúrate de que el campo 'isVerified' exista en tu modelo.
        /*
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Por favor, verifica tu correo electrónico para iniciar sesión.",
                error: true,
                success: false,
                verificationRequired: true // Flag útil para el frontend
            });
        }
        */
        // ---------------------------------------------------------------------------------

        const checkPassword = await bcrypt.compare(password, user.password);

        if (checkPassword) {
            // *** INICIO DE LA CORRECCIÓN ***

            // 1. El payload del token debe usar 'id' para ser consistente con el middleware authToken.
            //    El valor se toma de 'user._id' que es como Mongoose nombra el campo.
            const tokenData = {
                id: user._id, // Corregido: Se usa 'id' como clave.
                email: user.email,
            };
            
            // 2. Se usa 'JWT_SECRET_KEY', que es la variable definida en tu archivo .env.
            const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '8h' });

            // *** FIN DE LA CORRECCIÓN ***

            const tokenOption = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Solo secure en producción
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 'Lax' para desarrollo, 'None' para producción con cross-site
            };

            // Preparamos la respuesta del usuario sin datos sensibles
            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.verificationToken;
            delete userResponse.verificationTokenExpires;
            delete userResponse.passwordResetToken;
            delete userResponse.passwordResetTokenExpiresAt;

            res.cookie("token", token, tokenOption).status(200).json({
                message: "Inicio de sesión exitoso",
                data: userResponse, // Enviamos los datos del usuario al frontend
                success: true,
                error: false
            });

        } else {
            throw new Error("Credenciales inválidas");
        }

    } catch (err) {
        res.status(400).json({
            message: err.message || 'Ocurrió un error al iniciar sesión.',
            error: true,
            success: false,
        });
    }
}

module.exports = userSignInController;
