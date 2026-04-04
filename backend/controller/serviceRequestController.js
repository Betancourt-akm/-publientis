const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/userModel');
const Pet = require('../models/petModel');
const Walker = require('../models/walkerModel');

// Crear una nueva solicitud de servicio
const createServiceRequest = async (req, res) => {
  try {
    const { ownerId, walkerId, petId, serviceType, startDate, endDate, duration, notes, totalPrice } = req.body;
    
    // Verificar que el dueño exista y tenga el rol correcto
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'OWNER') {
      return res.status(400).json({
        success: false,
        message: 'El usuario no es un dueño de mascota válido'
      });
    }
    
    // Verificar que el paseador exista y tenga el rol correcto
    const walker = await User.findById(walkerId);
    if (!walker || walker.role !== 'WALKER') {
      return res.status(400).json({
        success: false,
        message: 'El usuario no es un paseador válido'
      });
    }
    
    // Verificar que la mascota exista y pertenezca al dueño
    const pet = await Pet.findById(petId);
    if (!pet || pet.owner.toString() !== ownerId) {
      return res.status(400).json({
        success: false,
        message: 'La mascota no existe o no pertenece al dueño'
      });
    }
    
    // Verificar que las fechas sean válidas
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }
    
    // Verificar que no exista ya una solicitud para este periodo
    const existingRequest = await ServiceRequest.findOne({
      ownerId,
      walkerId,
      petId,
      startDate: { $lt: end },
      endDate: { $gt: start }
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una solicitud para este periodo'
      });
    }
    
    // Crear la nueva solicitud de servicio
    const newServiceRequest = new ServiceRequest({
      ownerId,
      walkerId,
      petId,
      serviceType,
      startDate: start,
      endDate: end,
      duration,
      notes,
      totalPrice
    });
    
    await newServiceRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Solicitud de servicio creada exitosamente',
      serviceRequest: newServiceRequest
    });
  } catch (error) {
    console.error('Error al crear solicitud de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

// Obtener solicitudes de servicio por estado
const getServiceRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { userId } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    // Si se proporciona un userId, filtrar por ese usuario
    if (userId) {
      query.$or = [
        { ownerId: userId },
        { walkerId: userId }
      ];
    }
    
    const serviceRequests = await ServiceRequest.find(query)
      .populate('ownerId', 'name email phone')
      .populate('walkerId', 'name email phone')
      .populate('petId', 'name breed age weight')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      serviceRequests
    });
  } catch (error) {
    console.error('Error al obtener solicitudes de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

// Aceptar una solicitud de servicio
const acceptServiceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;
    
    // Verificar que la solicitud exista
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de servicio no encontrada'
      });
    }
    
    // Verificar que el usuario sea el paseador de la solicitud
    if (serviceRequest.walkerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para aceptar esta solicitud'
      });
    }
    
    // Verificar que la solicitud esté pendiente
    if (serviceRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud ya ha sido procesada'
      });
    }
    
    // Actualizar la solicitud
    serviceRequest.status = 'accepted';
    
    await serviceRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Solicitud aceptada exitosamente',
      serviceRequest
    });
  } catch (error) {
    console.error('Error al aceptar solicitud de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

// Rechazar una solicitud de servicio
const rejectServiceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId, rejectionReason } = req.body;
    
    // Verificar que la solicitud exista
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de servicio no encontrada'
      });
    }
    
    // Verificar que el usuario sea el paseador de la solicitud
    if (serviceRequest.walkerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para rechazar esta solicitud'
      });
    }
    
    // Verificar que la solicitud esté pendiente
    if (serviceRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud ya ha sido procesada'
      });
    }
    
    // Actualizar la solicitud
    serviceRequest.status = 'rejected';
    serviceRequest.rejectionReason = rejectionReason;
    
    await serviceRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Solicitud rechazada exitosamente',
      serviceRequest
    });
  } catch (error) {
    console.error('Error al rechazar solicitud de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

// Cancelar una solicitud de servicio
const cancelServiceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId, cancellationReason } = req.body;
    
    // Verificar que la solicitud exista
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de servicio no encontrada'
      });
    }
    
    // Verificar que el usuario sea el dueño de la solicitud
    if (serviceRequest.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta solicitud'
      });
    }
    
    // Verificar que la solicitud esté pendiente o aceptada
    if (serviceRequest.status !== 'pending' && serviceRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud no puede ser cancelada'
      });
    }
    
    // Actualizar la solicitud
    serviceRequest.status = 'cancelled';
    serviceRequest.cancellationReason = cancellationReason;
    serviceRequest.cancellationDate = new Date();
    
    await serviceRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      serviceRequest
    });
  } catch (error) {
    console.error('Error al cancelar solicitud de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

// Completar una solicitud de servicio
const completeServiceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;
    
    // Verificar que la solicitud exista
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de servicio no encontrada'
      });
    }
    
    // Verificar que el usuario sea el paseador de la solicitud
    if (serviceRequest.walkerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para completar esta solicitud'
      });
    }
    
    // Verificar que la solicitud esté aceptada
    if (serviceRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud no está aceptada'
      });
    }
    
    // Verificar que la fecha de fin haya pasado
    if (serviceRequest.endDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin del servicio aún no ha pasado'
      });
    }
    
    // Actualizar la solicitud
    serviceRequest.status = 'completed';
    
    await serviceRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Solicitud completada exitosamente',
      serviceRequest
    });
  } catch (error) {
    console.error('Error al completar solicitud de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

module.exports = {
  createServiceRequest,
  getServiceRequestsByStatus,
  acceptServiceRequest,
  rejectServiceRequest,
  cancelServiceRequest,
  completeServiceRequest
};
