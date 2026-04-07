const PDFDocument = require('pdfkit');
const User = require('../models/userModel');
const Application = require('../models/applicationModel');
const fs = require('fs');
const path = require('path');

// Generar CV del usuario actual
exports.generateCV = async (req, res) => {
  try {
    const userId = req.user._id;

    // Obtener datos completos del usuario con portafolio
    const user = await User.findById(userId)
      .select('name email tel profilePic faculty program academicLevel pedagogicalTags academicStatus portfolio')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener experiencia pedagógica (prácticas aceptadas)
    const acceptedApplications = await Application.find({
      applicant: userId,
      status: 'aceptado'
    })
      .populate('jobOffer', 'title type organization')
      .populate({
        path: 'jobOffer',
        populate: {
          path: 'organization',
          select: 'name'
        }
      })
      .lean();

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=CV_${user.name.replace(/\s/g, '_')}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Colores institucionales
    const primaryColor = '#1F3C88';
    const secondaryColor = '#334155';
    const lightGray = '#64748b';

    // === HEADER ===
    doc.fillColor(primaryColor)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text(user.name, { align: 'center' });

    doc.moveDown(0.3);

    // Información de contacto
    doc.fillColor(secondaryColor)
       .fontSize(10)
       .font('Helvetica')
       .text(`${user.email}${user.tel ? ` | ${user.tel}` : ''}`, { align: 'center' });

    if (user.faculty || user.program) {
      doc.fillColor(lightGray)
         .fontSize(10)
         .text(`${user.faculty || ''}${user.program ? ` - ${user.program}` : ''}`, { align: 'center' });
    }

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(primaryColor);
    doc.moveDown(0.5);

    // === PERFIL PROFESIONAL ===
    if (user.pedagogicalTags && user.pedagogicalTags.length > 0) {
      addSection(doc, 'PERFIL PROFESIONAL', primaryColor);
      
      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text(`Docente en formación especializado en áreas pedagógicas clave.`, {
           align: 'justify'
         });

      doc.moveDown(0.5);
      doc.fillColor(lightGray)
         .fontSize(9)
         .text('Áreas de especialización: ' + user.pedagogicalTags.join(', '), {
           align: 'justify'
         });

      doc.moveDown(1);
    }

    // === FORMACIÓN ACADÉMICA ===
    addSection(doc, 'FORMACIÓN ACADÉMICA', primaryColor);

    doc.fillColor(secondaryColor)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(user.program || 'Programa Académico');

    doc.fillColor(lightGray)
       .fontSize(10)
       .font('Helvetica')
       .text(`${user.faculty || 'Universidad'} | ${user.academicLevel || 'Nivel Académico'}`);

    if (user.academicStatus) {
      doc.fontSize(9)
         .text(`Estado: ${user.academicStatus}`);
    }

    doc.moveDown(1);

    // === EXPERIENCIA PEDAGÓGICA ===
    if (acceptedApplications.length > 0) {
      addSection(doc, 'EXPERIENCIA PEDAGÓGICA', primaryColor);

      acceptedApplications.forEach((app, index) => {
        if (app.jobOffer) {
          doc.fillColor(secondaryColor)
             .fontSize(11)
             .font('Helvetica-Bold')
             .text(app.jobOffer.title);

          doc.fillColor(lightGray)
             .fontSize(10)
             .font('Helvetica')
             .text(app.jobOffer.organization?.name || 'Institución Educativa');

          doc.fontSize(9)
             .text(`${app.jobOffer.type || 'Práctica'} | ${new Date(app.createdAt).getFullYear()}`);

          if (index < acceptedApplications.length - 1) {
            doc.moveDown(0.5);
          }
        }
      });

      doc.moveDown(1);
    }

    // === PORTAFOLIO PEDAGÓGICO ===
    let hasPortfolio = false;
    
    if (user.portfolio) {
      const { cv, lessonPlans, certificates, projects } = user.portfolio;
      
      if ((cv && cv.length > 0) || 
          (lessonPlans && lessonPlans.length > 0) || 
          (certificates && certificates.length > 0) || 
          (projects && projects.length > 0)) {
        
        hasPortfolio = true;
        addSection(doc, 'PORTAFOLIO PEDAGÓGICO', primaryColor);

        if (lessonPlans && lessonPlans.length > 0) {
          doc.fillColor(secondaryColor)
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('Planes de Aula:');

          lessonPlans.slice(0, 3).forEach(plan => {
            doc.fillColor(lightGray)
               .fontSize(9)
               .font('Helvetica')
               .text(`• ${plan.name}${plan.subject ? ` - ${plan.subject}` : ''}${plan.gradeLevel ? ` (${plan.gradeLevel})` : ''}`);
          });

          doc.moveDown(0.5);
        }

        if (certificates && certificates.length > 0) {
          doc.fillColor(secondaryColor)
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('Certificados:');

          certificates.slice(0, 3).forEach(cert => {
            doc.fillColor(lightGray)
               .fontSize(9)
               .font('Helvetica')
               .text(`• ${cert.name}${cert.issuingOrganization ? ` - ${cert.issuingOrganization}` : ''}`);
          });

          doc.moveDown(0.5);
        }

        if (projects && projects.length > 0) {
          doc.fillColor(secondaryColor)
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('Proyectos Pedagógicos:');

          projects.slice(0, 3).forEach(project => {
            doc.fillColor(lightGray)
               .fontSize(9)
               .font('Helvetica')
               .text(`• ${project.name}${project.category ? ` (${project.category})` : ''}`);
          });

          doc.moveDown(0.5);
        }

        doc.moveDown(0.5);
      }
    }

    // === COMPETENCIAS ===
    if (user.pedagogicalTags && user.pedagogicalTags.length > 0) {
      addSection(doc, 'COMPETENCIAS PEDAGÓGICAS', primaryColor);

      const tags = user.pedagogicalTags.join(' • ');
      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text(tags, { align: 'justify' });

      doc.moveDown(1);
    }

    // === FOOTER ===
    const bottomY = 750;
    doc.moveTo(50, bottomY).lineTo(545, bottomY).stroke('#e2e8f0');
    
    doc.fillColor('#94a3b8')
       .fontSize(8)
       .font('Helvetica')
       .text('Generado por Publientis - Plataforma de Vinculación Pedagógica', 50, bottomY + 10, {
         align: 'center'
       });

    // Finalizar documento
    doc.end();

  } catch (error) {
    console.error('Error al generar CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar CV',
      error: error.message
    });
  }
};

// Función auxiliar para agregar secciones
function addSection(doc, title, color) {
  doc.fillColor(color)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text(title);
  
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(200, doc.y).stroke(color);
  doc.moveDown(0.5);
}

// Descargar CV de otro usuario (admin/faculty)
exports.downloadUserCV = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar permisos
    if (!['ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para descargar CVs de otros usuarios'
      });
    }

    // Temporalmente cambiar el userId en la request para reutilizar la función
    req.user._id = userId;
    return exports.generateCV(req, res);

  } catch (error) {
    console.error('Error al descargar CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar CV'
    });
  }
};
