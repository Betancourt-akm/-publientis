const ServiceCard = require('../models/serviceCardModel');
const User = require('../models/userModel');

// Crear una tarjeta de servicio
async function createServiceCard(req, res) {
  try {
    const userId = req.userId;
    
    // Verificar que el usuario sea un paseador aprobado
    const user = await User.findById(userId);
    if (!user || user.role !== 'WALKER') {
      return res.status(403).json({
        success: false,
        message: 'Solo los paseadores pueden crear tarjetas de servicio'
      });
    }
    
    // TODO: Verificar que el paseador esté aprobado
    // if (user.walkerProfile.validationStatus !== 'approved') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Debes estar aprobado como paseador para crear tarjetas de servicio'
    //   });
    // }
    
    const serviceCardData = {
      ...req.body,
      walkerId: userId
    };
    
    const serviceCard = new ServiceCard(serviceCardData);
    await serviceCard.save();
    
    res.status(201).json({
      success: true,
      message: 'Tarjeta de servicio creada exitosamente',
      data: serviceCard
    });
  } catch (error) {
    console.error('Error al crear tarjeta de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener todas las tarjetas de servicio activas
async function getAllServiceCards(req, res) {
  try {
    const serviceCards = await ServiceCard.find({ isActive: true })
      .populate('walkerId', 'name email profilePic');
    
    res.json({
      success: true,
      data: serviceCards
    });
  } catch (error) {
    console.error('Error al obtener tarjetas de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener una tarjeta de servicio por ID
async function getServiceCardById(req, res) {
  try {
    const { id } = req.params;
    const serviceCard = await ServiceCard.findById(id)
      .populate('walkerId', 'name email profilePic');
    
    if (!serviceCard) {
      return res.status(404).json({
        success: false,
        message: 'Tarjeta de servicio no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: serviceCard
    });
  } catch (error) {
    console.error('Error al obtener tarjeta de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Actualizar una tarjeta de servicio
async function updateServiceCard(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Verificar que el usuario sea el dueño de la tarjeta o un administrador
    const serviceCard = await ServiceCard.findById(id);
    if (!serviceCard) {
      return res.status(404).json({
        success: false,
        message: 'Tarjeta de servicio no encontrada'
      });
    }
    
    if (serviceCard.walkerId.toString() !== userId) {
      // TODO: Verificar si es administrador
      // if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para actualizar esta tarjeta de servicio'
        });
      // }
    }
    
    const updatedServiceCard = await ServiceCard.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Tarjeta de servicio actualizada exitosamente',
      data: updatedServiceCard
    });
  } catch (error) {
    console.error('Error al actualizar tarjeta de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Eliminar una tarjeta de servicio
async function deleteServiceCard(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Verificar que el usuario sea el dueño de la tarjeta o un administrador
    const serviceCard = await ServiceCard.findById(id);
    if (!serviceCard) {
      return res.status(404).json({
        success: false,
        message: 'Tarjeta de servicio no encontrada'
      });
    }
    
    if (serviceCard.walkerId.toString() !== userId) {
      // TODO: Verificar si es administrador
      // if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar esta tarjeta de servicio'
        });
      // }
    }
    
    await ServiceCard.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Tarjeta de servicio eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarjeta de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
  createServiceCard,
  getAllServiceCards,
  getServiceCardById,
  updateServiceCard,
  deleteServiceCard
};
