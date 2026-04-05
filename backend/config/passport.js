const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

// --- Estrategia de Google ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Esta URL DEBE coincidir exactamente con una de las URIs autorizadas en Google Cloud Console.
    // En producción: https://publientis.online/api/auth/google/callback
    callbackURL: "https://publientis.online/api/auth/google/callback",
    passReqToCallback: true,
    proxy: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    console.log('🔍 Google OAuth - Perfil recibido:', {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      profilePic: profile.photos?.[0]?.value
    });
    
    try {
      // Busca si el usuario ya existe en tu base de datos por su googleId
      let user = await User.findOne({ googleId: profile.id });
      console.log('🔍 Usuario encontrado por googleId:', !!user);

      if (user) {
        // Si el usuario existe, actualiza la foto si no tiene
        if (!user.profilePic && profile.photos && profile.photos[0].value) {
          console.log('📸 Capturando foto de perfil de Google para usuario existente');
          user.profilePic = profile.photos[0].value;
          await user.save();
          console.log('✅ Foto de Google guardada:', user.profilePic);
        }
        console.log('✅ Usuario existente autenticado:', user.email);
        return done(null, user);
      }

      // Si no existe por googleId, busca por email para vincular cuentas
      const email = profile.emails[0].value;
      user = await User.findOne({ email: email });
      console.log('🔍 Usuario encontrado por email:', !!user);

      if (user) {
        // Si existe un usuario con ese email, vincula el googleId y lo verifica
        user.googleId = profile.id;
        user.provider = 'google'; // Se establece el proveedor
        user.isVerified = true; // El email de Google se considera verificado
        
        // Si no tiene foto de perfil, tomar la de Google
        if (!user.profilePic && profile.photos && profile.photos[0].value) {
          console.log('📸 Capturando foto de perfil de Google para cuenta vinculada');
          user.profilePic = profile.photos[0].value;
          console.log('✅ Foto de Google guardada:', user.profilePic);
        }
        
        await user.save();
        console.log('✅ Usuario vinculado con Google:', user.email);
        return done(null, user);
      } else {
        // Si el usuario no existe en absoluto, crea uno nuevo
        console.log('� Creando nuevo usuario con Google OAuth');
        const newUser = new User({
          googleId: profile.id,
          provider: 'google',
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePic: profile.photos && profile.photos[0].value ? profile.photos[0].value : null,
          role: 'USER', // Rol por defecto para e-commerce
          isVerified: true // El email de Google se considera verificado
        });
        if (newUser.profilePic) {
          console.log('✅ Foto de Google asignada:', newUser.profilePic);
        }

        await newUser.save();
        console.log('✅ Nuevo usuario creado:', newUser.email);
        return done(null, newUser);
      }
    } catch (error) {
      console.error('❌ Error en Google OAuth Strategy:', error);
      return done(error, false);
    }
  }
));

// --- Serialización y Deserialización ---
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('Error en deserializeUser:', error);
    done(error, null);
  }
});

module.exports = passport;
