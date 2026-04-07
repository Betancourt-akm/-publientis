const Application = require('../models/applicationModel');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const JobOffer = require('../models/jobOfferModel');

// Crear o obtener chat asociado a una postulación
exports.getOrCreateApplicationChat = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const currentUser = req.user;

    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email profilePic role')
      .populate('jobOffer');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Postulación no encontrada'
      });
    }

    const jobOffer = await JobOffer.findById(application.jobOffer).populate('organization', 'name email profilePic');

    // Validar que el usuario tiene permiso (es el estudiante o la organización)
    const isApplicant = currentUser._id.toString() === application.applicant._id.toString();
    const isOrganization = currentUser._id.toString() === jobOffer.organization._id.toString();
    const isAdmin = ['ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'].includes(currentUser.role);

    if (!isApplicant && !isOrganization && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a este chat'
      });
    }

    // Verificar si ya existe un chat para esta postulación
    let chat = await Chat.findOne({
      relatedApplication: applicationId,
      chatContext: 'job_application'
    });

    if (chat) {
      return res.status(200).json({
        success: true,
        message: 'Chat existente encontrado',
        data: chat
      });
    }

    // Crear nuevo chat entre estudiante y organización
    const participants = [application.applicant._id, jobOffer.organization._id];
    
    chat = await Chat.create({
      type: 'direct',
      chatContext: 'job_application',
      participants,
      participantsInfo: [
        {
          userId: application.applicant._id,
          name: application.applicant.name,
          email: application.applicant.email,
          avatar: application.applicant.profilePic,
          role: application.applicant.role
        },
        {
          userId: jobOffer.organization._id,
          name: jobOffer.organization.name,
          email: jobOffer.organization.email,
          avatar: jobOffer.organization.profilePic,
          role: jobOffer.organization.role
        }
      ],
      relatedApplication: applicationId,
      relatedJobOffer: application.jobOffer,
      subject: `Postulación: ${jobOffer.title}`,
      status: 'active',
      tags: ['práctica', 'postulación']
    });

    // Asociar el chat a la postulación
    application.associatedChat = chat._id;
    await application.save();

    return res.status(201).json({
      success: true,
      message: 'Chat de postulación creado exitosamente',
      data: chat
    });
  } catch (error) {
    console.error('Error en getOrCreateApplicationChat:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al crear chat de postulación'
    });
  }
};

// Obtener todos los chats de postulaciones del usuario
exports.getMyApplicationChats = async (req, res) => {
  try {
    const currentUser = req.user;

    const chats = await Chat.find({
      chatContext: 'job_application',
      participants: currentUser._id,
      status: { $ne: 'archived' }
    })
      .populate('relatedApplication')
      .populate('relatedJobOffer', 'title type organization')
      .sort({ 'lastMessage.timestamp': -1 });

    return res.status(200).json({
      success: true,
      data: chats,
      count: chats.length
    });
  } catch (error) {
    console.error('Error en getMyApplicationChats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener chats de postulaciones'
    });
  }
};

// Notificar cambio de estado a través del chat
exports.notifyStatusChangeViaChat = async (applicationId, newStatus, changedBy, notes) => {
  try {
    const chat = await Chat.findOne({
      relatedApplication: applicationId,
      chatContext: 'job_application'
    });

    if (!chat) {
      console.log('No existe chat para esta postulación, no se envía notificación');
      return;
    }

    const Message = require('../models/messageModel');
    const user = await User.findById(changedBy);

    const statusMessages = {
      'en_revision': 'Tu postulación está siendo revisada',
      'preseleccionado': '¡Felicitaciones! Has sido preseleccionado',
      'entrevista': 'Has sido citado a entrevista',
      'aceptado': '¡Excelentes noticias! Tu postulación ha sido aceptada',
      'rechazado': 'Lamentamos informarte que tu postulación no ha sido seleccionada'
    };

    const messageContent = `📢 **Actualización de estado**: ${statusMessages[newStatus] || newStatus}\n${notes ? `\n${notes}` : ''}`;

    await Message.create({
      chatId: chat._id,
      senderId: changedBy,
      senderName: user?.name || 'Sistema',
      content: messageContent,
      isSystemMessage: true
    });

    // Actualizar último mensaje del chat
    chat.lastMessage = {
      content: messageContent,
      senderId: changedBy,
      senderName: user?.name || 'Sistema',
      timestamp: new Date()
    };
    await chat.save();

    console.log('Notificación de cambio de estado enviada al chat');
  } catch (error) {
    console.error('Error al notificar cambio de estado:', error);
  }
};
