const multer = require('multer');
const { compareFaces } = require('../services/faceVerifierService');
const User = require('../models/userModel');

// 1. Configuración de Multer estrictamente en memoria (Ley 1581 de 2012 / Privacidad biométrica)
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB por archivo
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      const error = new Error('Formato no permitido. Solo se aceptan imágenes JPEG o PNG.');
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  }
});

// Middleware multer para los dos campos específicos
const multerUpload = upload.fields([
  { name: 'document_image', maxCount: 1 },
  { name: 'selfie_image', maxCount: 1 }
]);

/**
 * Middleware wrapper de multer para capturar errores de tamaño (413),
 * formato (415) y campos inválidos (400) en español.
 */
const uploadFaceFields = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'Una o ambas imágenes superan el tamaño máximo permitido de 5 MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Error al procesar los archivos subidos: ${err.message}`
        });
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(415).json({
          success: false,
          message: err.message
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || 'Error al procesar la carga de archivos.'
      });
    }

    next();
  });
};

/**
 * Controlador principal: POST /api/identity/verify-face
 */
const verifyFace = async (req, res) => {
  try {
    const documentFile = req.files?.document_image?.[0];
    const selfieFile = req.files?.selfie_image?.[0];

    // Validación de presencia de ambos archivos obligatorios
    if (!documentFile || !selfieFile) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar ambos archivos requeridos: "document_image" y "selfie_image".'
      });
    }

    // Validación de archivos no vacíos
    if (!documentFile.buffer || documentFile.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La imagen del documento ("document_image") está vacía.'
      });
    }

    if (!selfieFile.buffer || selfieFile.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La imagen de la selfie ("selfie_image") está vacía.'
      });
    }

    // Llamar al microservicio de verificación facial
    const result = await compareFaces({
      documentBuffer: documentFile.buffer,
      documentMimeType: documentFile.mimetype,
      documentOriginalName: documentFile.originalname,
      selfieBuffer: selfieFile.buffer,
      selfieMimeType: selfieFile.mimetype,
      selfieOriginalName: selfieFile.originalname
    });

    // Persistencia mínima en el usuario autenticado (resultado calculado exclusivamente en el servidor)
    const userId = req.user?._id || req.userId;
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          $set: {
            'faceVerification.verified': result.verified,
            'faceVerification.confidenceScore': result.confidenceScore,
            'faceVerification.verifiedAt': new Date()
          }
        });
      } catch (dbError) {
        // Log de advertencia sin interrumpir la respuesta de verificación al usuario
        console.warn('⚠️ [IdentityController] No se pudo persistir el resultado en el usuario:', dbError.message);
      }
    }

    // Respuesta 200 exitosa al cliente con el formato requerido
    return res.status(200).json({
      verified: result.verified,
      confidenceScore: result.confidenceScore,
      message: result.message
    });

  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al procesar la verificación facial'
    });
  }
};

module.exports = {
  uploadFaceFields,
  verifyFace
};