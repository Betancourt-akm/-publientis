const mongoose = require('mongoose');
const Review = require('../models/Review');

// Conectar a la base de datos de prueba antes de ejecutar las pruebas
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/sakopets_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Limpiar la base de datos y cerrar la conexión después de las pruebas
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Review Model Test', () => {
  it('should create and save a review successfully', async () => {
    const reviewData = {
      reviewer: new mongoose.Types.ObjectId(),
      reviewee: new mongoose.Types.ObjectId(),
      pet: new mongoose.Types.ObjectId(),
      rating: 5,
      comment: 'Excelente servicio',
      serviceType: 'walk',
      serviceDate: new Date()
    };
    
    const validReview = new Review(reviewData);
    const savedReview = await validReview.save();
    
    // Verificar que la reseña se haya guardado correctamente
    expect(savedReview._id).toBeDefined();
    expect(savedReview.reviewer.toString()).toBe(reviewData.reviewer.toString());
    expect(savedReview.reviewee.toString()).toBe(reviewData.reviewee.toString());
    expect(savedReview.pet.toString()).toBe(reviewData.pet.toString());
    expect(savedReview.rating).toBe(reviewData.rating);
    expect(savedReview.comment).toBe(reviewData.comment);
    expect(savedReview.serviceType).toBe(reviewData.serviceType);
    expect(savedReview.serviceDate).toBeDefined();
    expect(savedReview.createdAt).toBeDefined();
    expect(savedReview.updatedAt).toBeDefined();
  });
});
