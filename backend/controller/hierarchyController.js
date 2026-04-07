const University = require('../models/universityModel');
const Faculty = require('../models/facultyModel');
const AcademicProgram = require('../models/academicProgramModel');

/**
 * HierarchyController - Gestión de Jerarquía Académica de 3 Niveles
 * 
 * Implementa Cascading Select para registro:
 * Universidad → Facultad → Programa Académico
 * 
 * Basado en principios de:
 * - Interfaces Adaptativas (López Jaquero)
 * - Aplicaciones Basadas en Tareas (Unger & Chandler)
 */

/**
 * GET /api/hierarchy/universities
 * Obtener todas las universidades activas (Nivel 0)
 */
exports.getUniversities = async (req, res) => {
  try {
    const universities = await University.find({ isActive: true })
      .select('name code logo location.city')
      .sort({ name: 1 });

    res.json({
      success: true,
      universities
    });
  } catch (error) {
    console.error('Error al obtener universidades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener universidades'
    });
  }
};

/**
 * GET /api/hierarchy/faculties/:universityId
 * Obtener facultades de una universidad específica (Nivel 1)
 * CASCADING: Filtrado por universidad seleccionada
 */
exports.getFacultiesByUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;

    const faculties = await Faculty.find({
      university: universityId,
      isActive: true
    })
      .select('name code description knowledgeAreas')
      .sort({ name: 1 });

    res.json({
      success: true,
      faculties
    });
  } catch (error) {
    console.error('Error al obtener facultades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facultades'
    });
  }
};

/**
 * GET /api/hierarchy/programs/:facultyId
 * Obtener programas de una facultad específica (Nivel 2)
 * CASCADING: Filtrado por facultad seleccionada
 */
exports.getProgramsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const programs = await AcademicProgram.find({
      faculty: facultyId,
      active: true
    })
      .select('name code level description pedagogicalEmphasis')
      .sort({ name: 1 });

    res.json({
      success: true,
      programs
    });
  } catch (error) {
    console.error('Error al obtener programas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener programas académicos'
    });
  }
};

/**
 * GET /api/hierarchy/full/:universityId
 * Obtener jerarquía completa de una universidad
 * (Universidad → Facultades → Programas)
 */
exports.getFullHierarchy = async (req, res) => {
  try {
    const { universityId } = req.params;

    const university = await University.findById(universityId)
      .select('name code logo stats');

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'Universidad no encontrada'
      });
    }

    const faculties = await Faculty.find({
      university: universityId,
      isActive: true
    }).select('name code stats');

    const facultiesWithPrograms = await Promise.all(
      faculties.map(async (faculty) => {
        const programs = await AcademicProgram.find({
          faculty: faculty._id,
          active: true
        }).select('name code level studentsEnrolled graduatesCount');

        return {
          ...faculty.toObject(),
          programs
        };
      })
    );

    res.json({
      success: true,
      hierarchy: {
        university,
        faculties: facultiesWithPrograms
      }
    });
  } catch (error) {
    console.error('Error al obtener jerarquía completa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jerarquía completa'
    });
  }
};

/**
 * POST /api/hierarchy/university
 * Crear nueva universidad (Super Admin)
 */
exports.createUniversity = async (req, res) => {
  try {
    const { name, code, logo, description, location, contact, superAdmin } = req.body;

    // Verificar que no exista
    const existingUniversity = await University.findOne({
      $or: [{ code }, { name }]
    });

    if (existingUniversity) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una universidad con ese código o nombre'
      });
    }

    const university = await University.create({
      name,
      code,
      logo,
      description,
      location,
      contact,
      superAdmin
    });

    res.status(201).json({
      success: true,
      message: 'Universidad creada exitosamente',
      university
    });
  } catch (error) {
    console.error('Error al crear universidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear universidad',
      error: error.message
    });
  }
};

/**
 * POST /api/hierarchy/faculty
 * Crear nueva facultad (Admin de Universidad)
 */
exports.createFaculty = async (req, res) => {
  try {
    const { name, code, university, description, dean, contact, knowledgeAreas } = req.body;

    // Verificar que no exista en esa universidad
    const existingFaculty = await Faculty.findOne({
      university,
      $or: [{ code }, { name }]
    });

    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una facultad con ese código o nombre en esta universidad'
      });
    }

    const faculty = await Faculty.create({
      name,
      code,
      university,
      description,
      dean,
      contact,
      knowledgeAreas
    });

    // Actualizar contador de facultades en universidad
    await University.findByIdAndUpdate(university, {
      $inc: { 'stats.totalFaculties': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Facultad creada exitosamente',
      faculty
    });
  } catch (error) {
    console.error('Error al crear facultad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear facultad',
      error: error.message
    });
  }
};

/**
 * POST /api/hierarchy/program
 * Crear nuevo programa académico (Admin de Facultad)
 */
exports.createProgram = async (req, res) => {
  try {
    const {
      name,
      code,
      faculty,
      level,
      description,
      pedagogicalEmphasis,
      coordinator,
      duration,
      practiceRequirements
    } = req.body;

    // Obtener la facultad para heredar la universidad
    const facultyDoc = await Faculty.findById(faculty);
    if (!facultyDoc) {
      return res.status(404).json({
        success: false,
        message: 'Facultad no encontrada'
      });
    }

    // Verificar que no exista programa con ese código
    const existingProgram = await AcademicProgram.findOne({ code });
    if (existingProgram) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un programa con ese código'
      });
    }

    const program = await AcademicProgram.create({
      name,
      code,
      faculty,
      university: facultyDoc.university, // Hereda universidad
      level,
      description,
      pedagogicalEmphasis,
      coordinator,
      duration,
      practiceRequirements
    });

    // Actualizar contadores
    await Faculty.findByIdAndUpdate(faculty, {
      $inc: { 'stats.totalPrograms': 1 }
    });

    await University.findByIdAndUpdate(facultyDoc.university, {
      $inc: { 'stats.totalPrograms': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Programa académico creado exitosamente',
      program
    });
  } catch (error) {
    console.error('Error al crear programa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear programa académico',
      error: error.message
    });
  }
};

/**
 * PUT /api/hierarchy/program/:programId/professors
 * Vincular profesores a un programa académico
 */
exports.addProfessorsToProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const { professorIds } = req.body;

    const program = await AcademicProgram.findByIdAndUpdate(
      programId,
      {
        $addToSet: { professors: { $each: professorIds } }
      },
      { new: true }
    ).populate('professors', 'name email profilePic');

    res.json({
      success: true,
      message: 'Profesores vinculados exitosamente',
      program
    });
  } catch (error) {
    console.error('Error al vincular profesores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al vincular profesores'
    });
  }
};
