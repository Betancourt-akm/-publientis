/**
 * Controlador simple de prueba para upload
 */
async function testUpload(req, res) {
  try {
    console.log('🧪 TEST UPLOAD - Inicio');
    console.log('🧪 Headers:', req.headers['content-type']);
    console.log('🧪 req.file existe?:', !!req.file);
    console.log('🧪 req.body:', req.body);
    
    if (!req.file) {
      return res.json({
        success: false,
        message: 'No file received',
        debug: {
          hasFile: false,
          contentType: req.headers['content-type'],
          body: req.body
        }
      });
    }
    
    res.json({
      success: true,
      message: 'File received successfully!',
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer
      }
    });
    
  } catch (error) {
    console.error('🧪 ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = testUpload;
