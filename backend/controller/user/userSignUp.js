const userModel = require("../../models/userModel");
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../utils/tokenUtils');
const sendEmail = require('../../utils/emailService');

async function userSignUpController(req, res) {
    let newUser = null; // Variable para manejar el rollback en caso de error

    try {
        console.log("--- DEBUG: Solicitud de registro recibida ---");
        console.log("Datos recibidos en req.body:", req.body);

        const { email, password, name, tel, role } = req.body;

        // --- Validaciones de Entrada ---
        if (!email || !password || !name) {
            throw new Error("Email, password y nombre son requeridos");
        }
        if (role && !['ADMIN', 'USER'].includes(role)) {
            throw new Error("Rol inválido. Debe ser ADMIN o USER");
        }

        // --- Verificar si el usuario ya existe ---
        if (await userModel.findOne({ email })) {
            return res.status(409).json({
                success: false,
                message: "El correo electrónico ya está registrado"
            });
        }

        // --- Preparar datos del nuevo usuario ---
        const verificationToken = generateToken();
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);

        const payload = {
            name, 
            email, 
            tel,
            password: hashPassword,
            role: role || 'USER', // Por defecto es USER (cliente de e-commerce)
            isVerified: false, // El usuario no está verificado al registrarse
            verificationToken,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // Token válido por 24 horas
        };

        // --- Guardar el nuevo usuario en la Base de Datos ---
        newUser = new userModel(payload);
        await newUser.save();

        // --- Enviar Correo de Verificación ---
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>¡Bienvenido a FreshFace! 💎</h2>
                <p>Gracias por registrarte en nuestra tienda. Por favor, haz clic en el siguiente botón para verificar tu dirección de correo electrónico:</p>
                <a href="${verificationLink}" style="background-color: #14b8a6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar mi Correo</a>
                <p>Si el botón no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:</p>
                <p><a href="${verificationLink}">${verificationLink}</a></p>
                <p>Este enlace expirará en 24 horas.</p>
                <p>Si no te registraste en nuestra plataforma, por favor ignora este correo.</p>
                <hr/>
                <p>Saludos,<br>El equipo de FreshFace</p>
            </div>
        `;

        await sendEmail({
            to: email,
            subject: 'Verifica tu cuenta en FreshFace',
            html: emailHtml
        });

        // --- Respuesta Exitosa ---
        return res.status(201).json({
            success: true,
            message: "¡Registro exitoso! Por favor, revisa tu correo para verificar tu cuenta."
        });

    } catch (err) {
        // --- Rollback en caso de error durante el proceso ---
        if (newUser && newUser._id) {
            await userModel.findByIdAndDelete(newUser._id);
        }
        
        console.error("Error en el registro:", err);

        // --- Manejo de Errores Específicos ---
        if (err.message.includes('GaxiosError') || err.code === 'EAUTH') {
            return res.status(500).json({
                success: false,
                message: 'Error de autenticación con el servicio de correo. No se pudo enviar el email de verificación. Revisa las credenciales de la API.'
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message || 'Ocurrió un error durante el registro.'
        });
    }
}

module.exports = userSignUpController;