const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { generateToken, verifyToken } = require('../utils/jwt');

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (!existingUser.isVerified) {
      return next(new AppError('Este correo ya está registrado pero no ha sido verificado.', 400));
    }
    return next(new AppError('El correo electrónico ya está en uso.', 400));
  }

  const newUser = new User({
    name,
    email,
    password,
    provider: 'local',
  });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  newUser.verificationToken = verificationToken;
  newUser.verificationTokenExpires = Date.now() + 3600000; // 1 hora de validez

  await newUser.save();

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const message = `¡Gracias por registrarte en MachTAI! Por favor, haz clic en el siguiente enlace para verificar tu cuenta. El enlace es válido por 1 hora:\n\n${verificationUrl}`;

  await sendEmail({
    email: newUser.email,
    subject: 'Verificación de cuenta de MachTAI',
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Registro exitoso. Hemos enviado un email de verificación a tu correo electrónico. Tu cuenta no estará activa hasta que completes la verificación.',
    data: {
      email: newUser.email,
      name: newUser.name,
      requiresVerification: true
    }
  });
});

/**
 * @desc    Verificar el correo electrónico del usuario
 * @route   GET /api/auth/verify/:token
 * @access  Public
 */
/**
 * @desc    Iniciar sesión de un usuario
 * @route   POST /api/auth/login
 * @access  Public
 */
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validación de entrada
  if (!email || !password) {
    return next(new AppError('Por favor, proporcione un correo y una contraseña.', 400));
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Por favor, proporcione un correo electrónico válido.', 400));
  }

  try {
    const user = await User.findOne({ email: req.body.email, provider: 'local' }).select('+password +failedLoginAttempts +lockUntil');

    // Si la cuenta está bloqueada, no permitir el inicio de sesión
    if (user && user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return next(new AppError(`Demasiados intentos fallidos. Tu cuenta está bloqueada por ${remainingTime} minutos.`, 403));
    }

    if (!user || !(await user.comparePassword(req.body.password))) {
      if (user) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
          user.lockUntil = Date.now() + LOCK_TIME;
          await user.save();
          return next(new AppError('Demasiados intentos fallidos. Tu cuenta ha sido bloqueada por 15 minutos.', 403));
        }
        await user.save();
      }
      return next(new AppError('Correo o contraseña incorrectos.', 401));
    }

    if (!user.isVerified) {
      return next(new AppError('Tu cuenta no está activada. Debes verificar tu correo electrónico antes de poder iniciar sesión. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.', 401));
    }

    // Si el login es exitoso, limpiar los intentos fallidos
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Generar token JWT
    const token = generateToken(user._id);

    // Configurar cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 día
    });

    // Respuesta exitosa
    res.status(200).json({
      success: true,  // Cambiado de "status": "success" a "success": true
      message: 'Inicio de sesión exitoso',
      token: token,   // Agregado el token en la respuesta
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return next(new AppError('Error interno del servidor durante el inicio de sesión.', 500));
  }
});

/**
 * @desc    Gestionar el olvido de contraseña (enviar email de reseteo)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  // Validación de entrada
  if (!email) {
    return next(new AppError('Por favor, proporcione un correo electrónico.', 400));
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Por favor, proporcione un correo electrónico válido.', 400));
  }

  try {
    const user = await User.findOne({ email, provider: 'local' });

    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      return res.status(200).json({ 
        success: true,
        message: 'Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.'
      });
    }

    // Generar token y guardarlo en el usuario
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Enviar el email
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Recibimos una solicitud para restablecer la contraseña de tu cuenta de MachTAI. Por favor, haz clic en el siguiente enlace para continuar. El enlace es válido por 10 minutos:\n\n${resetURL}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Restablecimiento de contraseña de MachTAI',
        message,
      });

      res.status(200).json({ 
        success: true,
        message: 'Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.'
      });
    } catch (emailError) {
      // Si falla el envío del email, limpiar los tokens
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Error enviando email de recuperación:', emailError);
      return next(new AppError('Hubo un error enviando el correo. Inténtelo de nuevo más tarde.', 500));
    }
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return next(new AppError('Error interno del servidor durante la recuperación de contraseña.', 500));
  }
});

/**
 * @desc    Restablecer la contraseña del usuario
 * @route   PATCH /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // 1. Hashear el token que viene en la URL para encontrarlo en la BD
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 2. Buscar al usuario por el token y la fecha de expiración
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 3. Si no hay usuario, el token es inválido o ha expirado
  if (!user) {
    return next(new AppError('El token es inválido o ha expirado.', 400));
  }

  // 4. Establecer la nueva contraseña y limpiar los campos de reseteo
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 5. Iniciar sesión del usuario automáticamente generando un nuevo token
  const loginToken = generateToken(user._id);
  res.cookie('token', loginToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  });
  res.status(200).json({
    success: true,  // Cambiado de "status" a "success" boolean
    message: 'Contraseña actualizada con éxito.',
    token: loginToken,  // Agregado el token para auto-login
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profilePic: user.profilePic
    }
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // Buscar usuario con el token de verificación
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('El token de verificación es inválido o ha expirado.', 400));
  }

  // Verificar la cuenta
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  
  // Limpiar intentos fallidos si los hay
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  
  await user.save({ validateBeforeSave: false });

  // CREAR SESIÓN AUTOMÁTICAMENTE (AUTO-LOGIN)
  // Generar token JWT para autenticar al usuario
  const loginToken = generateToken(user._id);

  // Configurar cookie de sesión
  res.cookie('token', loginToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  });

  // Respuesta exitosa con datos del usuario autenticado
  res.status(200).json({ 
    success: true,
    message: '¡Tu cuenta ha sido verificada con éxito! Ya estás autenticado.',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profilePic: user.profilePic
    },
    token: loginToken,
    autoLogin: true // Indicador para el frontend
  });
});

/**
 * @desc    Cerrar la sesión del usuario
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = catchAsync(async (req, res) => {
  // Limpiar TODAS las cookies de autenticación
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.status(200).json({
    success: true,
    error: false,
    message: 'Sesión cerrada correctamente',
    data: []
  });
});

/**
 * @desc    Proteger rutas - Verificar que el usuario está autenticado
 * @route   Middleware
 * @access  Private
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Obtener el token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('No has iniciado sesión. Por favor, inicia sesión para obtener acceso.', 401));
  }

  // 2) Verificar el token
  const decoded = await verifyToken(token);

  // 3) Verificar si el usuario aún existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('El usuario al que pertenece este token ya no existe.', 401));
  }

  // 4) Verificar si el usuario cambió la contraseña después de emitir el token
  if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('El usuario cambió la contraseña recientemente. Por favor, inicia sesión nuevamente.', 401));
  }

  // Acceso concedido
  req.user = currentUser;
  next();
});

/**
 * @desc    Restringir acceso a ciertos roles
 * @route   Middleware
 * @access  Private
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permiso para realizar esta acción.', 403));
    }
    next();
  };
};

/**
 * @desc    Reenviar email de verificación
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
exports.resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Por favor, proporciona un correo electrónico.', 400));
  }

  // Buscar usuario no verificado
  const user = await User.findOne({ email, isVerified: false });
  
  if (!user) {
    // Por seguridad, no revelamos si el email existe o ya está verificado
    return res.status(200).json({
      success: true,
      message: 'Si el correo existe y no está verificado, se ha enviado un nuevo email de verificación.'
    });
  }

  // Generar nuevo token de verificación
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 3600000; // 1 hora
  
  await user.save({ validateBeforeSave: false });

  // Enviar email
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `¡Hola ${user.name}!\n\nHas solicitado un nuevo enlace de verificación para tu cuenta en MachTAI.\n\nPor favor, haz clic en el siguiente enlace para verificar tu cuenta. El enlace es válido por 1 hora:\n\n${verificationUrl}\n\nSi no solicitaste esto, puedes ignorar este correo.\n\n¡Gracias por unirte a MachTAI!`;

    await sendEmail({
      email: user.email,
      subject: 'Nuevo enlace de verificación - MachTAI',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada.'
    });
  } catch (emailError) {
    console.error('Error enviando email de verificación:', emailError);
    return next(new AppError('Error enviando el email de verificación. Inténtalo de nuevo más tarde.', 500));
  }
});
