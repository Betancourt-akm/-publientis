const userModel = require("../../models/userModel");
const cloudinary = require('../../config/cloudinary');
const { Readable } = require('stream');

/**
 * Actualizar foto de perfil del usuario
 * - Sube la imagen a Cloudinary
 * - Actualiza el profilePic en la base de datos
 * - Elimina la foto anterior si existe
 */
async function updateProfilePicture(req, res) {
  try {
    const userId = req.userId; // Del middleware de autenticación

    console.log('📸 ===== INICIO UPDATE PROFILE PICTURE =====');
    console.log('📸 Usuario ID:', userId);
    console.log('📸 req.file:', req.file ? 'Presente' : 'AUSENTE');
    console.log('📸 req.body:', req.body);

    // Verificar que se envió un archivo
    if (!req.file) {
      console.error('❌ ERROR: No se recibió archivo en req.file');
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen',
        error: true
      });
    }

    console.log('✅ Archivo recibido correctamente:');
    console.log('   - Nombre:', req.file.originalname);
    console.log('   - Tipo:', req.file.mimetype);
    console.log('   - Tamaño:', req.file.size, 'bytes');
    console.log('   - Buffer:', req.file.buffer ? 'Presente' : 'AUSENTE');

    // Buscar usuario actual
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: true
      });
    }

    // Si el usuario ya tiene una foto, eliminar la anterior de Cloudinary
    if (user.profilePic && user.profilePic.includes('cloudinary')) {
      try {
        // Extraer public_id de la URL de Cloudinary
        const urlParts = user.profilePic.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `profile_pictures/${publicIdWithExtension.split('.')[0]}`;
        
        console.log('🗑️ Eliminando foto anterior:', publicId);
        await cloudinary.uploader.destroy(publicId);
        console.log('✅ Foto anterior eliminada');
      } catch (deleteError) {
        console.warn('⚠️ Error eliminando foto anterior:', deleteError.message);
        // Continuar aunque falle la eliminación
      }
    }

    // Convertir el buffer a stream
    const bufferStream = Readable.from(req.file.buffer);

    // Subir nueva foto a Cloudinary
    console.log('🚀 Iniciando subida a Cloudinary...');
    console.log('📁 Carpeta destino: profile_pictures');
    console.log('🆔 Public ID:', `user_${userId}_${Date.now()}`);
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile_pictures',
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' }, // Crop centrado en la cara
            { quality: 'auto:good' },
            { fetch_format: 'auto' } // WebP si el navegador lo soporta
          ],
          public_id: `user_${userId}_${Date.now()}` // ID único
        },
        (error, result) => {
          if (error) {
            console.error('❌ ERROR EN CLOUDINARY:');
            console.error('   Mensaje:', error.message);
            console.error('   HTTP Code:', error.http_code);
            console.error('   Error completo:', error);
            reject(error);
          } else {
            console.log('✅ Foto subida exitosamente a Cloudinary');
            console.log('   URL:', result.secure_url);
            console.log('   Public ID:', result.public_id);
            console.log('   Formato:', result.format);
            console.log('   Tamaño:', result.width, 'x', result.height);
            resolve(result);
          }
        }
      );

      bufferStream.pipe(uploadStream);
    });

    // Actualizar usuario con la nueva URL
    user.profilePic = result.secure_url;
    await user.save();

    console.log('✅ Foto de perfil actualizada en BD');

    res.json({
      success: true,
      message: 'Foto de perfil actualizada exitosamente',
      error: false,
      data: {
        profilePic: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('❌ ===== ERROR ACTUALIZANDO FOTO DE PERFIL =====');
    console.error('❌ Tipo de error:', error.name);
    console.error('❌ Mensaje:', error.message);
    console.error('❌ Stack:', error.stack);
    if (error.http_code) {
      console.error('❌ HTTP Code:', error.http_code);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar la foto de perfil',
      error: true,
      details: {
        type: error.name,
        message: error.message,
        http_code: error.http_code
      }
    });
  }
}

module.exports = updateProfilePicture;
