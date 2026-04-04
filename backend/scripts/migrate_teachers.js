// Script para migrar usuarios con rol TEACHER a la colección teachers y asociar sus posts
// Ejecuta este script con: node scripts/migrate_teachers.js

const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/machtai';

const User = require('../models/userModel');
const Teacher = require('../models/teacherModel');
const Post = require('../models/postModel');

async function main() {
  await mongoose.connect(MONGO_URI);

  // 1. Encuentra todos los usuarios con rol TEACHER
  const teachers = await User.find({ role: 'TEACHER' });
  for (const user of teachers) {
    // 2. Verifica si ya existe un Teacher con ese _id
    let teacherDoc = await Teacher.findOne({ _id: user._id });
    if (!teacherDoc) {
      // 3. Crea el documento en teachers
      teacherDoc = await Teacher.create({
        _id: user._id, // para que coincida el populate
        name: user.name,
        bio: '',
        photoUrl: user.profilePic || '',
        subjects: [],
        levels: [],
        experienceYears: 0,
        age: null,
        gender: 'OTHER',
        location: { city: '', state: '', country: '' },
        hourlyRate: 0,
        currency: 'USD',
        rating: { average: 0, count: 0 },
        languages: [],
        nextAvailableSlot: null,
        achievements: [],
        metadata: { profileStatus: 'PENDING' }
      });
      console.log('Teacher creado:', teacherDoc._id);
    } else {
      console.log('Teacher ya existía:', teacherDoc._id);
    }
    // 4. Actualiza todos los posts para que apunten a este teacher
    const result = await Post.updateMany({ teacher: user._id }, { teacher: teacherDoc._id });
    if (result.modifiedCount > 0) {
      console.log(`Actualizados ${result.modifiedCount} posts para teacher ${teacherDoc._id}`);
    }
  }

  await mongoose.disconnect();
  console.log('Migración completada.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
