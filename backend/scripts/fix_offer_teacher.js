// Script para arreglar el campo teacher de una oferta y asociarlo a un profesor válido
// Ejecuta este script con: node scripts/fix_offer_teacher.js

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/machtai';
const offerId = '68766bcefda79ce68219d7f0'; // Cambia si es necesario

// Modelos
const teacherSchema = require('../models/teacherModel');
const postSchema = require('../models/postModel');

async function main() {
  await mongoose.connect(MONGO_URI);

  // 1. Buscar si existe algún profesor
  let teacher = await teacherSchema.findOne();
  if (!teacher) {
    // Si no hay profesor, crear uno
    teacher = await teacherSchema.create({
      name: 'Profesor Ejemplo',
      bio: 'Biografía de prueba',
      photoUrl: '',
      subjects: ['Matemáticas'],
      levels: ['Principiante', 'Intermedio'],
      experienceYears: 5,
      age: 30,
      gender: 'MALE',
      location: { city: 'Ciudad', state: 'Estado', country: 'País' },
      hourlyRate: 20,
      currency: 'USD',
      languages: ['Español'],
    });
    console.log('Profesor creado:', teacher._id);
  } else {
    console.log('Profesor existente:', teacher._id);
  }

  // 2. Actualizar el post para asociarlo al profesor
  const post = await postSchema.findByIdAndUpdate(
    offerId,
    { teacher: teacher._id },
    { new: true }
  );
  if (post) {
    console.log('Oferta actualizada:', post._id, 'teacher:', post.teacher);
  } else {
    console.error('No se encontró la oferta con ese ID');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
