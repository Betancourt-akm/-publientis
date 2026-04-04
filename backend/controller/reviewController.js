const Review = require('../models/Review');
const User = require('../models/userModel');
const Pet = require('../models/petModel');

// Crear una nueva reseña
const createReview = async (req, res) => {
  try {
    const { reviewerId, revieweeId, petId, rating, comment, serviceType, serviceDate } = req.body;
    
    // Verificar que el revisor exista y tenga el rol correcto
    const reviewer = await User.findById(reviewerId);
    if (!reviewer || (reviewer.role !== 'OWNER' && reviewer.role !== 'WALKER')) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no es un dueño de mascota o paseador válido'
      });
    }
    
    // Verificar que el revisado exista y tenga el rol correcto
    const reviewee = await User.findById(revieweeId);
    if (!reviewee || (reviewee.role !== 'OWNER' && reviewee.role !== 'WALKER')) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no es un dueño de mascota o paseador válido'
      });
    }
    
    // Verificar que la mascota exista
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(400).json({
        success: false,
        message: 'La mascota no existe'
      });
    }
    
    // Verificar que el revisor y el revisado no sean la misma persona
    if (reviewerId === revieweeId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes dejarte una reseña a ti mismo'
      });
    }
    
    // Verificar que no exista ya una reseña para este servicio
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      reviewee: revieweeId,
      pet: petId,
      serviceType,
      serviceDate
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una reseña para este servicio'
      });
    }
    
    // Crear la nueva reseña
    const newReview = new Review({
      reviewer: reviewerId,
      reviewee: revieweeId,
      pet: petId,
      rating,
      comment,
      serviceType,
      serviceDate: new Date(serviceDate)
    });
    
    await newReview.save();
    
    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      review: newReview
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

// Obtener reseñas de un usuario
const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario exista
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name email profilePic')
      .populate('pet', 'name breed')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

// Obtener reseñas por tipo de servicio
const getReviewsByServiceType = async (req, res) => {
  try {
    const { serviceType } = req.params;
    
    const reviews = await Review.find({ serviceType })
      .populate('reviewer', 'name email profilePic')
      .populate('reviewee', 'name email profilePic')
      .populate('pet', 'name breed')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error al obtener reseñas por tipo de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

// Calcular el promedio de calificaciones de un usuario
const getAverageRating = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario exista
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const result = await Review.aggregate([
      { $match: { reviewee: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);
    
    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalReviews = result.length > 0 ? result[0].totalReviews : 0;
    
    res.status(200).json({
      success: true,
      averageRating,
      totalReviews
    });
  } catch (error) {
    console.error('Error al calcular promedio de calificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor. Inténtelo de nuevo.'
    });
  }
};

module.exports = {
  createReview,
  getReviewsByUser,
  getReviewsByServiceType,
  getAverageRating
};
