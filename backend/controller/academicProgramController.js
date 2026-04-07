const AcademicProgram = require('../models/academicProgramModel');
const User = require('../models/userModel');

// Crear nuevo programa académico
exports.createProgram = async (req, res) => {
  try {
    const {
      name,
      code,
      faculty,
      level,
      description,
      pedagogicalEmphasis,
      requiredTags,
      coordinator,
      duration,
      practiceRequirements
    } = req.body;

    // Validar que el coordinador existe y tiene rol apropiado
    if (coordinator) {
      const coordinatorUser = await User.findById(coordinator);
      if (!coordinatorUser || !['FACULTY', 'DOCENTE', 'ADMIN'].includes(coordinatorUser.role)) {
        return res.status(400).json({
          success: false,
          message: 'El coordinador debe ser un docente o miembro de facultad'
        });
      }
    }

    const program = await AcademicProgram.create({
      name,
      code,
      faculty,
      level,
      description,
      pedagogicalEmphasis,
      requiredTags,
      coordinator,
      duration,
      practiceRequirements
    });

    return res.status(201).json({
      success: true,
      message: 'Programa académico creado exitosamente',
      data: program
    });
  } catch (error) {
    console.error('Error en createProgram:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un programa con ese código'
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Error al crear programa académico'
    });
  }
};

// Obtener todos los programas activos
exports.getAllPrograms = async (req, res) => {
  try {
    const { faculty, level, active } = req.query;

    const filter = {};
    if (faculty) filter.faculty = faculty;
    if (level) filter.level = level;
    if (active !== undefined) filter.active = active === 'true';

    const programs = await AcademicProgram.find(filter)
      .populate('coordinator', 'name email')
      .populate('approvers', 'name email role')
      .sort({ faculty: 1, name: 1 });

    return res.status(200).json({
      success: true,
      data: programs,
      count: programs.length
    });
  } catch (error) {
    console.error('Error en getAllPrograms:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener programas'
    });
  }
};

// Obtener programa por ID
exports.getProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await AcademicProgram.findById(id)
      .populate('coordinator', 'name email profilePic')
      .populate('approvers', 'name email role');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programa no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Error en getProgramById:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener programa'
    });
  }
};

// Actualizar programa
exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const program = await AcademicProgram.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programa no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Programa actualizado exitosamente',
      data: program
    });
  } catch (error) {
    console.error('Error en updateProgram:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar programa'
    });
  }
};

// Agregar aprobador a un programa
exports.addApprover = async (req, res) => {
  try {
    const { id } = req.params;
    const { approverId } = req.body;

    const approver = await User.findById(approverId);
    if (!approver || !['FACULTY', 'DOCENTE', 'ADMIN'].includes(approver.role)) {
      return res.status(400).json({
        success: false,
        message: 'El aprobador debe ser un docente o miembro de facultad'
      });
    }

    const program = await AcademicProgram.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programa no encontrado'
      });
    }

    if (program.approvers.includes(approverId)) {
      return res.status(400).json({
        success: false,
        message: 'Este usuario ya es aprobador del programa'
      });
    }

    program.approvers.push(approverId);
    await program.save();

    return res.status(200).json({
      success: true,
      message: 'Aprobador agregado exitosamente',
      data: program
    });
  } catch (error) {
    console.error('Error en addApprover:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al agregar aprobador'
    });
  }
};

// Desactivar programa
exports.deactivateProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await AcademicProgram.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programa no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Programa desactivado exitosamente',
      data: program
    });
  } catch (error) {
    console.error('Error en deactivateProgram:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al desactivar programa'
    });
  }
};

// Obtener estadísticas de un programa
exports.getProgramStats = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await AcademicProgram.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programa no encontrado'
      });
    }

    const Application = require('../models/applicationModel');
    const JobOffer = require('../models/jobOfferModel');

    // Estudiantes del programa
    const students = await User.countDocuments({
      program: program.name,
      role: { $in: ['STUDENT', 'USER'] }
    });

    // Postulaciones de estudiantes del programa
    const applications = await Application.countDocuments({
      studentProgram: id
    });

    // Ofertas dirigidas al programa
    const offers = await JobOffer.countDocuments({
      targetPrograms: id,
      status: 'activa'
    });

    // Postulaciones aceptadas
    const acceptedApplications = await Application.countDocuments({
      studentProgram: id,
      status: 'aceptado'
    });

    const stats = {
      program: program.name,
      studentsEnrolled: students,
      totalApplications: applications,
      activeOffers: offers,
      acceptedApplications,
      placementRate: applications > 0 ? ((acceptedApplications / applications) * 100).toFixed(2) : 0
    };

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error en getProgramStats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener estadísticas'
    });
  }
};
