const mongoose = require('mongoose');
const University = require('../models/universityModel');
const Faculty = require('../models/facultyModel');
const AcademicProgram = require('../models/academicProgramModel');
const User = require('../models/userModel');
require('dotenv').config();

/**
 * Seeder de Jerarquía Académica
 * 
 * Crea estructura inicial de:
 * - Universidad Pedagógica Nacional (UPN)
 * - Facultad de Educación
 * - 4 Programas Académicos
 * - Usuarios administrativos de ejemplo
 */

const seedHierarchy = async () => {
  try {
    console.log('🌱 Iniciando seeder de jerarquía académica...');

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes (opcional - comentar si no quieres borrar)
    // await University.deleteMany({});
    // await Faculty.deleteMany({});
    // await AcademicProgram.deleteMany({});
    // console.log('🗑️  Datos anteriores eliminados');

    // 1. Crear Super Admin de la Universidad (si no existe)
    let superAdmin = await User.findOne({ email: 'admin@upn.edu.co' });
    
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Administrador UPN',
        email: 'admin@upn.edu.co',
        password: 'Admin123!',
        role: 'ADMIN',
        isVerified: true,
        provider: 'local'
      });
      console.log('✅ Super Admin creado');
    } else {
      console.log('ℹ️  Super Admin ya existe');
    }

    // 2. Crear Universidad Pedagógica Nacional
    let upn = await University.findOne({ code: 'UPN' });
    
    if (!upn) {
      upn = await University.create({
        name: 'Universidad Pedagógica Nacional',
        code: 'UPN',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Escudo_de_la_Universidad_Pedag%C3%B3gica_Nacional.svg/1200px-Escudo_de_la_Universidad_Pedag%C3%B3gica_Nacional.svg.png',
        description: 'Institución pública de educación superior comprometida con la formación de maestros y profesionales de la educación.',
        location: {
          country: 'Colombia',
          city: 'Bogotá D.C.',
          address: 'Calle 72 No. 11-86'
        },
        contact: {
          email: 'contacto@upn.edu.co',
          phone: '+57 (1) 594 1894',
          website: 'https://www.pedagogica.edu.co'
        },
        superAdmin: superAdmin._id,
        settings: {
          allowPublicRegistration: true,
          requireEmailVerification: true,
          autoApproveInstitutions: false
        }
      });
      console.log('✅ Universidad creada:', upn.name);
    } else {
      console.log('ℹ️  Universidad ya existe:', upn.name);
    }

    // 3. Crear Decano de la Facultad (si no existe)
    let dean = await User.findOne({ email: 'decano.educacion@upn.edu.co' });
    
    if (!dean) {
      dean = await User.create({
        name: 'Decano de Educación',
        email: 'decano.educacion@upn.edu.co',
        password: 'Dean123!',
        role: 'FACULTY',
        university: upn._id,
        isVerified: true,
        provider: 'local'
      });
      console.log('✅ Decano creado');
    } else {
      console.log('ℹ️  Decano ya existe');
    }

    // 4. Crear Facultad de Educación
    let facultadEducacion = await Faculty.findOne({ 
      university: upn._id, 
      code: 'EDU' 
    });
    
    if (!facultadEducacion) {
      facultadEducacion = await Faculty.create({
        name: 'Facultad de Educación',
        code: 'EDU',
        university: upn._id,
        description: 'Líder en la formación de educadores y profesionales de la pedagogía en Colombia.',
        dean: dean._id,
        contact: {
          email: 'educacion@upn.edu.co',
          phone: '+57 (1) 594 1894 Ext. 200',
          office: 'Edificio A, Piso 3'
        },
        knowledgeAreas: [
          'Pedagogía',
          'Didáctica',
          'Currículo',
          'Evaluación Educativa',
          'Psicología Educativa',
          'Tecnologías Educativas'
        ]
      });
      
      // Actualizar contador en universidad
      await University.findByIdAndUpdate(upn._id, {
        $inc: { 'stats.totalFaculties': 1 }
      });
      
      console.log('✅ Facultad creada:', facultadEducacion.name);
    } else {
      console.log('ℹ️  Facultad ya existe:', facultadEducacion.name);
    }

    // 5. Crear Programas Académicos
    const programsData = [
      {
        name: 'Licenciatura en Pedagogía Infantil',
        code: 'LPI-2024',
        level: 'Pregrado',
        description: 'Formación integral de profesionales de la educación enfocados en la primera infancia y educación básica primaria.',
        pedagogicalEmphasis: [
          'Primera Infancia',
          'Desarrollo Infantil',
          'Didáctica Lúdica',
          'Neuroeducación',
          'Educación Inclusiva'
        ],
        duration: {
          semesters: 8,
          years: 4
        },
        practiceRequirements: {
          practiceI: {
            required: true,
            semester: 6,
            hours: 120
          },
          practiceII: {
            required: true,
            semester: 7,
            hours: 160
          },
          ruralPractice: {
            required: true,
            semester: 8,
            hours: 200
          }
        }
      },
      {
        name: 'Licenciatura en Educación Básica con Énfasis en Matemáticas',
        code: 'LEBEM-2024',
        level: 'Pregrado',
        description: 'Programa enfocado en la enseñanza de las matemáticas en educación básica y media.',
        pedagogicalEmphasis: [
          'Didáctica de las Matemáticas',
          'Pensamiento Lógico',
          'Resolución de Problemas',
          'Tecnología en Matemáticas',
          'Evaluación Matemática'
        ],
        duration: {
          semesters: 10,
          years: 5
        },
        practiceRequirements: {
          practiceI: {
            required: true,
            semester: 7,
            hours: 140
          },
          practiceII: {
            required: true,
            semester: 9,
            hours: 180
          }
        }
      },
      {
        name: 'Licenciatura en Lengua Castellana',
        code: 'LLC-2024',
        level: 'Pregrado',
        description: 'Formación de docentes especializados en lengua, literatura y comunicación.',
        pedagogicalEmphasis: [
          'Didáctica del Lenguaje',
          'Literatura',
          'Lectura Crítica',
          'Producción Textual',
          'Comunicación Asertiva'
        ],
        duration: {
          semesters: 8,
          years: 4
        },
        practiceRequirements: {
          practiceI: {
            required: true,
            semester: 6,
            hours: 120
          },
          practiceII: {
            required: true,
            semester: 8,
            hours: 160
          }
        }
      },
      {
        name: 'Maestría en Educación',
        code: 'ME-2024',
        level: 'Maestría',
        description: 'Programa de posgrado para profundización en investigación educativa y pedagogía avanzada.',
        pedagogicalEmphasis: [
          'Investigación Educativa',
          'Políticas Educativas',
          'Innovación Pedagógica',
          'Gestión Educativa',
          'Evaluación Institucional'
        ],
        duration: {
          semesters: 4,
          years: 2
        },
        practiceRequirements: {
          practiceI: {
            required: false
          }
        }
      }
    ];

    let programsCreated = 0;
    const createdPrograms = [];

    for (const programData of programsData) {
      const existingProgram = await AcademicProgram.findOne({ code: programData.code });
      
      if (!existingProgram) {
        const program = await AcademicProgram.create({
          ...programData,
          faculty: facultadEducacion._id,
          university: upn._id
        });
        
        createdPrograms.push(program);
        programsCreated++;
        console.log(`✅ Programa creado: ${program.name}`);
      } else {
        createdPrograms.push(existingProgram);
        console.log(`ℹ️  Programa ya existe: ${programData.name}`);
      }
    }

    // 6. Actualizar contadores
    if (programsCreated > 0) {
      await Faculty.findByIdAndUpdate(facultadEducacion._id, {
        $inc: { 'stats.totalPrograms': programsCreated }
      });
      
      await University.findByIdAndUpdate(upn._id, {
        $inc: { 'stats.totalPrograms': programsCreated }
      });
    }

    // 7. Crear Coordinadores de Programas (opcional)
    for (let i = 0; i < Math.min(2, createdPrograms.length); i++) {
      const program = createdPrograms[i];
      const coordinatorEmail = `coordinador.${program.code.toLowerCase()}@upn.edu.co`;
      
      let coordinator = await User.findOne({ email: coordinatorEmail });
      
      if (!coordinator) {
        coordinator = await User.create({
          name: `Coordinador ${program.code}`,
          email: coordinatorEmail,
          password: 'Coord123!',
          role: 'DOCENTE',
          university: upn._id,
          facultyRef: facultadEducacion._id,
          academicProgramRef: program._id,
          isVerified: true,
          provider: 'local'
        });
        
        // Asignar coordinador al programa
        await AcademicProgram.findByIdAndUpdate(program._id, {
          coordinator: coordinator._id
        });
        
        console.log(`✅ Coordinador creado para ${program.name}`);
      }
    }

    console.log('\n🎉 SEEDER COMPLETADO EXITOSAMENTE\n');
    console.log('📊 Resumen:');
    console.log(`   Universidad: ${upn.name} (${upn.code})`);
    console.log(`   Facultad: ${facultadEducacion.name} (${facultadEducacion.code})`);
    console.log(`   Programas creados: ${programsCreated}`);
    console.log(`   Total programas: ${createdPrograms.length}`);
    console.log('\n💡 Credenciales de prueba:');
    console.log('   Super Admin: admin@upn.edu.co / Admin123!');
    console.log('   Decano: decano.educacion@upn.edu.co / Dean123!');
    console.log('   Coordinadores: coordinador.[codigo]@upn.edu.co / Coord123!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seeder:', error);
    process.exit(1);
  }
};

// Ejecutar seeder
if (require.main === module) {
  seedHierarchy();
}

module.exports = seedHierarchy;
