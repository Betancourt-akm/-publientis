const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ExamQuestion = require('../models/examQuestionModel');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión a MongoDB establecida para seed de preguntas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Preguntas de examen iniciales
const examQuestions = [
  // Preguntas generales de pedagogía
  { 
    questionId: 'gen-001', 
    type: 'boolean', 
    text: 'Los objetivos SMART ayudan a planificar clases efectivas.', 
    correct: 'true',
    discipline: 'general',
    difficulty: 'easy'
  },
  { 
    questionId: 'gen-002', 
    type: 'open', 
    text: 'Menciona al menos dos beneficios del aprendizaje basado en proyectos.',
    keywords: ['colaboración', 'motivación', 'autonomía', 'creatividad', 'práctica'],
    discipline: 'general',
    difficulty: 'medium'
  },
  { 
    questionId: 'gen-003', 
    type: 'multiple', 
    text: '¿Cuál de estas opciones NO es una estrategia efectiva de evaluación formativa?', 
    options: ['Retroalimentación inmediata', 'Exámenes sorpresa', 'Autoevaluación', 'Evaluación entre pares'], 
    correct: 'Exámenes sorpresa',
    discipline: 'general',
    difficulty: 'medium'
  },
  { 
    questionId: 'gen-004', 
    type: 'boolean', 
    text: 'La evaluación sumativa se realiza durante el proceso de aprendizaje.', 
    correct: 'false',
    discipline: 'general',
    difficulty: 'medium'
  },
  { 
    questionId: 'gen-005', 
    type: 'multiple', 
    text: '¿Qué estilo de enseñanza se caracteriza por dar mayor autonomía al estudiante?', 
    options: ['Autoritario', 'Democrático', 'Laissez-faire', 'Expositivo'], 
    correct: 'Democrático',
    discipline: 'general',
    difficulty: 'medium'
  },
  
  // Preguntas de música
  { 
    questionId: 'mus-001', 
    type: 'boolean', 
    text: 'En música, el compás 6/8 es un compás compuesto.', 
    correct: 'true',
    discipline: 'music',
    difficulty: 'medium'
  },
  { 
    questionId: 'mus-002', 
    type: 'multiple', 
    text: '¿Cuál es la escala mayor relativa de La menor?', 
    options: ['Do mayor', 'Fa mayor', 'Do# mayor', 'Sol mayor'], 
    correct: 'Do mayor',
    discipline: 'music',
    difficulty: 'medium'
  },
  { 
    questionId: 'mus-003', 
    type: 'multiple', 
    text: '¿Qué intervalo forma un acorde de séptima?', 
    options: ['Tercera mayor', 'Quinta justa', 'Séptima menor', 'Octava'], 
    correct: 'Séptima menor',
    discipline: 'music',
    difficulty: 'hard'
  },
  
  // Preguntas de guitarra
  { 
    questionId: 'mus-gui-001', 
    type: 'multiple', 
    text: '¿Cuántas cuerdas tiene una guitarra clásica estándar?', 
    options: ['4', '6', '8', '12'], 
    correct: '6',
    discipline: 'music',
    specialty: 'guitar',
    difficulty: 'easy'
  },
  { 
    questionId: 'mus-gui-002', 
    type: 'boolean', 
    text: 'El "palm muting" es una técnica que consiste en apagar parcialmente las cuerdas con la palma de la mano.', 
    correct: 'true',
    discipline: 'music',
    specialty: 'guitar',
    difficulty: 'medium'
  },
  
  // Preguntas de piano
  { 
    questionId: 'mus-pia-001', 
    type: 'multiple', 
    text: '¿Cuántas teclas tiene un piano de cola estándar?', 
    options: ['76', '88', '96', '108'], 
    correct: '88',
    discipline: 'music',
    specialty: 'piano',
    difficulty: 'medium'
  },
  { 
    questionId: 'mus-pia-002', 
    type: 'boolean', 
    text: 'El pedal sostenuto mantiene levantados solo los apagadores de las notas que estaban siendo tocadas cuando se presionó el pedal.', 
    correct: 'true',
    discipline: 'music',
    specialty: 'piano',
    difficulty: 'hard'
  },
  
  // Preguntas de canto
  { 
    questionId: 'mus-sin-001', 
    type: 'multiple', 
    text: '¿Cuál de estos NO es un registro vocal?', 
    options: ['Soprano', 'Tenor', 'Contralto', 'Pianissimo'], 
    correct: 'Pianissimo',
    discipline: 'music',
    specialty: 'singing',
    difficulty: 'medium'
  },
  { 
    questionId: 'mus-sin-002', 
    type: 'boolean', 
    text: 'El diafragma es un músculo importante para el control de la respiración en el canto.', 
    correct: 'true',
    discipline: 'music',
    specialty: 'singing',
    difficulty: 'easy'
  },
  
  // Preguntas de danza
  { 
    questionId: 'dan-001', 
    type: 'multiple', 
    text: 'En danza clásica, ¿qué término describe un salto con ambos pies?', 
    options: ['Jeté', 'Sauté', 'Pas de bourrée', 'Glissade'], 
    correct: 'Sauté',
    discipline: 'dance',
    difficulty: 'medium'
  },
  { 
    questionId: 'dan-002', 
    type: 'boolean', 
    text: 'El término "plié" en ballet se refiere a doblar las rodillas.', 
    correct: 'true',
    discipline: 'dance',
    difficulty: 'easy'
  },
  
  // Preguntas de pintura
  { 
    questionId: 'pai-001', 
    type: 'multiple', 
    text: '¿Cuál de estos colores es un color primario?', 
    options: ['Verde', 'Naranja', 'Amarillo', 'Morado'], 
    correct: 'Amarillo',
    discipline: 'painting',
    difficulty: 'easy'
  },
  { 
    questionId: 'pai-002', 
    type: 'boolean', 
    text: 'La técnica de "veladura" consiste en aplicar capas transparentes de pintura.', 
    correct: 'true',
    discipline: 'painting',
    difficulty: 'medium'
  },
  
  // Preguntas de dibujo
  { 
    questionId: 'dra-001', 
    type: 'multiple', 
    text: '¿Qué técnica utiliza líneas cruzadas para crear sombras?', 
    options: ['Puntillismo', 'Achurado', 'Esfumado', 'Contorno'], 
    correct: 'Achurado',
    discipline: 'drawing',
    difficulty: 'medium'
  },
  { 
    questionId: 'dra-002', 
    type: 'boolean', 
    text: 'La perspectiva de un punto tiene un único punto de fuga.', 
    correct: 'true',
    discipline: 'drawing',
    difficulty: 'medium'
  },
  
  // Preguntas de yoga
  { 
    questionId: 'yog-001', 
    type: 'multiple', 
    text: '¿Cuál de estas posturas es una inversión?', 
    options: ['Tadasana', 'Sirsasana', 'Virabhadrasana', 'Sukhasana'], 
    correct: 'Sirsasana',
    discipline: 'yoga',
    difficulty: 'medium'
  },
  { 
    questionId: 'yog-002', 
    type: 'boolean', 
    text: 'Pranayama se refiere a técnicas de respiración en yoga.', 
    correct: 'true',
    discipline: 'yoga',
    difficulty: 'easy'
  }
];

// Función para poblar la base de datos
const seedDatabase = async () => {
  try {
    // Eliminar preguntas existentes
    await ExamQuestion.deleteMany({});
    console.log('Preguntas existentes eliminadas');
    
    // Insertar nuevas preguntas
    await ExamQuestion.insertMany(examQuestions);
    console.log(`${examQuestions.length} preguntas insertadas correctamente`);
    
    // Cerrar conexión
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar la función de seed
seedDatabase();
