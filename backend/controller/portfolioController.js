const User = require('../models/userModel');

// Obtener mi portafolio
exports.getMyPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('portfolio name email program faculty pedagogicalTags');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: user.portfolio || {
        cv: null,
        planesAula: [],
        certificados: [],
        proyectos: []
      }
    });
  } catch (error) {
    console.error('Error en getMyPortfolio:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener portafolio'
    });
  }
};

// Subir documento al portafolio
exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, name, subject, gradeLevel, institution, issueDate, description, category, url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL del documento es requerida'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Inicializar portfolio si no existe
    if (!user.portfolio) {
      user.portfolio = {
        cv: null,
        planesAula: [],
        certificados: [],
        proyectos: []
      };
    }
    
    switch (type) {
      case 'cv':
        user.portfolio.cv = url;
        break;
        
      case 'planAula':
        if (!name) {
          return res.status(400).json({
            success: false,
            message: 'El nombre del plan de aula es requerido'
          });
        }
        user.portfolio.planesAula.push({
          name,
          subject: subject || '',
          gradeLevel: gradeLevel || '',
          url,
          uploadedAt: new Date()
        });
        break;
        
      case 'certificado':
        if (!name) {
          return res.status(400).json({
            success: false,
            message: 'El nombre del certificado es requerido'
          });
        }
        user.portfolio.certificados.push({
          name,
          institution: institution || '',
          issueDate: issueDate ? new Date(issueDate) : null,
          url,
          uploadedAt: new Date()
        });
        break;
        
      case 'proyecto':
        if (!name) {
          return res.status(400).json({
            success: false,
            message: 'El nombre del proyecto es requerido'
          });
        }
        user.portfolio.proyectos.push({
          name,
          description: description || '',
          category: category || '',
          url,
          uploadedAt: new Date()
        });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de documento no válido. Use: cv, planAula, certificado, proyecto'
        });
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Documento agregado al portafolio exitosamente',
      data: user.portfolio
    });
  } catch (error) {
    console.error('Error en uploadDocument:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al subir documento'
    });
  }
};

// Eliminar documento del portafolio
exports.deleteDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, documentId } = req.body;
    
    const user = await User.findById(userId);
    if (!user || !user.portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portafolio no encontrado'
      });
    }
    
    switch (type) {
      case 'cv':
        user.portfolio.cv = null;
        break;
        
      case 'planAula':
        if (!documentId) {
          return res.status(400).json({
            success: false,
            message: 'ID del documento es requerido'
          });
        }
        user.portfolio.planesAula = user.portfolio.planesAula.filter(
          doc => doc._id.toString() !== documentId
        );
        break;
        
      case 'certificado':
        if (!documentId) {
          return res.status(400).json({
            success: false,
            message: 'ID del documento es requerido'
          });
        }
        user.portfolio.certificados = user.portfolio.certificados.filter(
          doc => doc._id.toString() !== documentId
        );
        break;
        
      case 'proyecto':
        if (!documentId) {
          return res.status(400).json({
            success: false,
            message: 'ID del documento es requerido'
          });
        }
        user.portfolio.proyectos = user.portfolio.proyectos.filter(
          doc => doc._id.toString() !== documentId
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de documento no válido'
        });
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Documento eliminado exitosamente',
      data: user.portfolio
    });
  } catch (error) {
    console.error('Error en deleteDocument:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar documento'
    });
  }
};

// Obtener portafolio de otro usuario (para organizaciones)
exports.getUserPortfolio = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('portfolio name email program faculty pedagogicalTags academicLevel profilePic');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          program: user.program,
          faculty: user.faculty,
          pedagogicalTags: user.pedagogicalTags,
          academicLevel: user.academicLevel,
          profilePic: user.profilePic
        },
        portfolio: user.portfolio || {
          cv: null,
          planesAula: [],
          certificados: [],
          proyectos: []
        }
      }
    });
  } catch (error) {
    console.error('Error en getUserPortfolio:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener portafolio'
    });
  }
};
