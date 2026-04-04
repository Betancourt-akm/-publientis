const User = require('../models/userModel');
// const notificationService = require('../services/notificationService'); // TODO: Implementar servicio de notificaciones

// Obtener lista de paseadores pendientes de aprobación
async function getPendingWalkers(req, res) {
  try {
    console.log('🔍 Buscando walkers pendientes...');
    
    // Buscar por ambos campos para compatibilidad
    const pendingWalkers = await User.find({
      role: 'WALKER',
      $or: [
        { 'metadata.verificationStatus': 'PENDING' },
        { 'metadata.profileStatus': 'pending' },
        { 'metadata.verificationStatus': { $exists: true } } // Cualquier walker con metadata
      ]
    }).select('-password -refreshToken -verificationToken -verificationTokenExpires'); // Excluir campos sensibles
    
    console.log(`📊 Encontrados ${pendingWalkers.length} walkers:`, pendingWalkers.map(w => ({ 
      id: w._id, 
      email: w.email, 
      verificationStatus: w.metadata?.verificationStatus,
      profileStatus: w.metadata?.profileStatus 
    })));
    
    res.json({
      success: true,
      data: pendingWalkers
    });
  } catch (error) {
    console.error('Error al obtener paseadores pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Aprobar a un paseador
async function approveWalker(req, res) {
  try {
    const { walkerId } = req.params;
    
    // Actualizar el estado del perfil del paseador
    const user = await User.findByIdAndUpdate(
      walkerId,
      { 
        'metadata.verificationStatus': 'APPROVED',
        'metadata.profileStatus': 'approved' // Mantener compatibilidad
      },
      { new: true }
    ).select('-password -refreshToken -verificationToken -verificationTokenExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Paseador no encontrado'
      });
    }
    
    // TODO: Actualizar el WalkerProfile si existe
    // await WalkerProfile.findOneAndUpdate(
    //   { userId: walkerId },
    //   { 
    //     validationStatus: 'approved',
    //     approvedAt: new Date()
    //   }
    // );
    
    // TODO: Enviar notificación al paseador
    // await notificationService.sendWalkerApprovalNotification(user);
    
    res.json({
      success: true,
      message: 'Paseador aprobado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al aprobar paseador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Rechazar a un paseador
async function rejectWalker(req, res) {
  try {
    const { walkerId } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una razón para rechazar al paseador'
      });
    }
    
    // Actualizar el estado del perfil del paseador
    const user = await User.findByIdAndUpdate(
      walkerId,
      { 
        'metadata.verificationStatus': 'REJECTED',
        'metadata.profileStatus': 'rejected', // Mantener compatibilidad
        'metadata.rejectionReason': rejectionReason,
        'metadata.rejectedAt': new Date()
      },
      { new: true }
    ).select('-password -refreshToken -verificationToken -verificationTokenExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Paseador no encontrado'
      });
    }
    
    // TODO: Actualizar el WalkerProfile si existe
    // await WalkerProfile.findOneAndUpdate(
    //   { userId: walkerId },
    //   { 
    //     validationStatus: 'rejected',
    //     rejectionReason: rejectionReason,
    //     rejectedAt: new Date()
    //   }
    // );
    
    // TODO: Enviar notificación al paseador
    // await notificationService.sendWalkerRejectionNotification(user, rejectionReason);
    
    res.json({
      success: true,
      message: 'Paseador rechazado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al rechazar paseador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener todos los paseadores (independientemente del estado)
async function getAllWalkers(req, res) {
  try {
    console.log('🔍 Obteniendo todos los walkers...');
    
    // Buscar todos los usuarios con rol WALKER
    const allWalkers = await User.find({
      role: 'WALKER'
    }).select('-password -refreshToken -verificationToken -verificationTokenExpires'); // Excluir campos sensibles
    
    console.log(`📊 Total walkers encontrados: ${allWalkers.length}`);
    
    // Estadísticas por estado
    const stats = {
      total: allWalkers.length,
      pending: allWalkers.filter(w => 
        w.metadata?.profileStatus === 'PENDING' || 
        w.metadata?.verificationStatus === 'PENDING' ||
        (!w.metadata?.profileStatus && !w.metadata?.verificationStatus)
      ).length,
      approved: allWalkers.filter(w => 
        w.metadata?.profileStatus === 'APPROVED' || 
        w.metadata?.verificationStatus === 'APPROVED'
      ).length,
      rejected: allWalkers.filter(w => 
        w.metadata?.profileStatus === 'REJECTED' || 
        w.metadata?.verificationStatus === 'REJECTED'
      ).length
    };
    
    console.log('📈 Estadísticas de walkers:', stats);
    
    res.json({
      success: true,
      data: allWalkers,
      stats: stats
    });
  } catch (error) {
    console.error('Error al obtener todos los walkers:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener estadísticas del sistema
async function getSystemStats(req, res) {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalOwners: await User.countDocuments({ role: 'OWNER' }),
      totalWalkers: await User.countDocuments({ role: 'WALKER' }),
      approvedWalkers: await User.countDocuments({ 
        role: 'WALKER', 
        'metadata.profileStatus': 'approved' 
      }),
      pendingWalkers: await User.countDocuments({ 
        role: 'WALKER', 
        'metadata.profileStatus': 'pending' 
      }),
      rejectedWalkers: await User.countDocuments({ 
        role: 'WALKER', 
        'metadata.profileStatus': 'rejected' 
      })
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Aprobar paseador
async function approveWalker(req, res) {
  try {
    const { walkerId } = req.params;
    console.log('✅ Aprobando walker:', walkerId);
    
    // Actualizar el estado del perfil del paseador
    const user = await User.findByIdAndUpdate(
      walkerId,
      { 
        'metadata.verificationStatus': 'APPROVED',
        'metadata.profileStatus': 'APPROVED',
        'metadata.approvedAt': new Date(),
        'metadata.approvedBy': req.user.id
      },
      { new: true }
    ).select('-password -refreshToken -verificationToken -verificationTokenExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Paseador no encontrado'
      });
    }
    
    console.log('✅ Walker aprobado exitosamente:', user.fullName);
    
    res.json({
      success: true,
      message: 'Paseador aprobado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al aprobar paseador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Rechazar paseador
async function rejectWalker(req, res) {
  try {
    const { walkerId } = req.params;
    const { rejectionReason } = req.body;
    console.log('❌ Rechazando walker:', walkerId, 'Razón:', rejectionReason);
    
    // Actualizar el estado del perfil del paseador
    const user = await User.findByIdAndUpdate(
      walkerId,
      { 
        'metadata.verificationStatus': 'REJECTED',
        'metadata.profileStatus': 'REJECTED',
        'metadata.rejectionReason': rejectionReason || 'No especificada',
        'metadata.rejectedAt': new Date(),
        'metadata.rejectedBy': req.user.id
      },
      { new: true }
    ).select('-password -refreshToken -verificationToken -verificationTokenExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Paseador no encontrado'
      });
    }
    
    console.log('❌ Walker rechazado exitosamente:', user.fullName);
    
    res.json({
      success: true,
      message: 'Paseador rechazado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al rechazar paseador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
  getPendingWalkers,
  getAllWalkers,
  approveWalker,
  rejectWalker,
  getSystemStats
};
