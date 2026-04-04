const Booking = require('../models/bookingModel');
const ServiceCard = require('../models/serviceCardModel');
const User = require('../models/userModel');
// const notificationService = require('../services/notificationService'); // TODO: Implementar servicio de notificaciones

// Crear una reserva
async function createBooking(req, res) {
  try {
    const userId = req.userId; // El owner que hace la reserva
    
    // Verificar que el usuario sea un dueño de mascota
    const user = await User.findById(userId);
    if (!user || user.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Solo los dueños de mascotas pueden crear reservas'
      });
    }
    
    const { serviceCardId, petDetails, serviceDetails } = req.body;
    
    // Verificar que la tarjeta de servicio exista y esté activa
    const serviceCard = await ServiceCard.findById(serviceCardId);
    if (!serviceCard || !serviceCard.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Tarjeta de servicio no encontrada o no activa'
      });
    }
    
    // Calcular el precio total
    const durationHours = serviceDetails.duration / 60;
    const totalPrice = durationHours * serviceCard.pricePerHour;
    
    // Crear la reserva
    const bookingData = {
      ownerId: userId,
      walkerId: serviceCard.walkerId,
      serviceCardId,
      petDetails,
      serviceDetails,
      totalPrice
    };
    
    const booking = new Booking(bookingData);
    await booking.save();
    
    // TODO: Enviar notificaciones
    // await notificationService.sendBookingNotification(booking);
    
    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: booking
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener las reservas de un usuario
async function getUserBookings(req, res) {
  try {
    const userId = req.userId;
    const userRole = req.user.role; // Asumimos que el middleware de autenticación añade el rol
    
    let query = {};
    
    // Los dueños solo ven sus propias reservas
    if (userRole === 'OWNER') {
      query.ownerId = userId;
    }
    // Los paseadores solo ven las reservas que les han hecho
    else if (userRole === 'WALKER') {
      query.walkerId = userId;
    }
    // TODO: Los administradores pueden ver todas las reservas
    // else if (userRole === 'ADMIN') {
    //   // No se añade filtro, se ven todas
    // }
    else {
      return res.status(403).json({
        success: false,
        message: 'Rol no autorizado'
      });
    }
    
    const bookings = await Booking.find(query)
      .populate('ownerId', 'name email')
      .populate('walkerId', 'name email')
      .populate('serviceCardId');
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener una reserva por ID
async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.user.role;
    
    const booking = await Booking.findById(id)
      .populate('ownerId', 'name email')
      .populate('walkerId', 'name email')
      .populate('serviceCardId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Verificar permisos
    if (userRole === 'OWNER' && booking.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reserva'
      });
    }
    
    if (userRole === 'WALKER' && booking.walkerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reserva'
      });
    }
    
    // TODO: Verificar permisos de administrador
    // if (userRole === 'ADMIN') {
    //   // Los administradores pueden ver cualquier reserva
    // }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Actualizar el estado de una reserva (aceptar/rechazar)
async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    const userId = req.userId;
    
    // Verificar que el usuario sea el paseador de la reserva
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    if (booking.walkerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta reserva'
      });
    }
    
    // Verificar que el estado sea válido
    if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de reserva no válido'
      });
    }
    
    // Si se está cancelando, se requiere una razón
    if (status === 'cancelled' && !cancellationReason) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una razón para cancelar la reserva'
      });
    }
    
    // Actualizar la reserva
    booking.status = status;
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }
    
    await booking.save();
    
    // TODO: Enviar notificaciones
    // await notificationService.sendBookingStatusUpdate(booking);
    
    res.json({
      success: true,
      message: `Reserva ${status === 'accepted' ? 'aceptada' : status === 'rejected' ? 'rechazada' : 'cancelada'} exitosamente`,
      data: booking
    });
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Completar una reserva
async function completeBooking(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Verificar que el usuario sea el paseador de la reserva
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    if (booking.walkerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para completar esta reserva'
      });
    }
    
    // Verificar que la reserva esté aceptada
    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden completar reservas aceptadas'
      });
    }
    
    // Actualizar la reserva
    booking.status = 'completed';
    await booking.save();
    
    // TODO: Enviar notificaciones
    // await notificationService.sendBookingCompletion(booking);
    
    res.json({
      success: true,
      message: 'Reserva completada exitosamente',
      data: booking
    });
  } catch (error) {
    console.error('Error al completar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  completeBooking
};
