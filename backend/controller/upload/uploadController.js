const cloudinary = require('../../config/cloudinary');
const multer = require('multer');
const { Readable } = require('stream');

// Configurar multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

/**
 * Subir una imagen a Cloudinary
 */
const uploadImage = async (req, res) => {
  try {
    console.log('📸 === UPLOAD IMAGE REQUEST ===');
    console.log('User:', req.user?.email || 'No user');
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    console.log('File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Obtener el folder desde el body (opcional)
    const folder = req.body.folder || 'products';
    console.log('Upload folder:', folder);

    // Verificar configuración de Cloudinary
    const cloudinaryConfig = cloudinary.config();
    console.log('Cloudinary configured:', {
      cloud_name: cloudinaryConfig.cloud_name,
      api_key: cloudinaryConfig.api_key ? '***' + cloudinaryConfig.api_key.slice(-4) : 'NOT SET',
      api_secret: cloudinaryConfig.api_secret ? 'SET' : 'NOT SET'
    });

    // Convertir el buffer a stream
    const bufferStream = Readable.from(req.file.buffer);

    console.log('🚀 Starting upload to Cloudinary...');
    // Subir a Cloudinary usando stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Upload successful:', result.secure_url);
            resolve(result);
          }
        }
      );

      bufferStream.pipe(uploadStream);
    });

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });

  } catch (error) {
    console.error('❌ ERROR COMPLETO:', {
      message: error.message,
      stack: error.stack,
      http_code: error.http_code
    });
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen',
      error: error.message,
      details: error.http_code ? `HTTP ${error.http_code}` : undefined
    });
  }
};

/**
 * Subir múltiples imágenes a Cloudinary
 */
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron archivos'
      });
    }

    const folder = req.body.folder || 'products';
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const bufferStream = Readable.from(file.buffer);
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format
            });
          }
        );
        bufferStream.pipe(uploadStream);
      });
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: `${results.length} imágenes subidas exitosamente`,
      data: results
    });

  } catch (error) {
    console.error('Error subiendo imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir las imágenes',
      error: error.message
    });
  }
};

/**
 * Eliminar una imagen de Cloudinary
 */
const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el public_id de la imagen'
      });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No se pudo eliminar la imagen',
        error: result
      });
    }

  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadImage,
  uploadMultipleImages,
  deleteImage
};
