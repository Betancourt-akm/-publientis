const AcademicProfile = require('../models/AcademicProfile');
const userModel = require('../../../models/userModel');

/**
 * Obtener perfil académico por userId
 */
const getAcademicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId).select('name email profilePic role academicProgramRef facultyRef');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    let profile = await AcademicProfile.findOne({ userId }).populate('userId', 'name email profilePic role academicProgramRef facultyRef');

    if (!profile) {
      profile = new AcademicProfile({ userId, isPublic: true });
      await profile.save();
      await profile.populate('userId', 'name email profilePic role academicProgramRef facultyRef');
    }

    if (!profile.isPublic) {
      const requestUserId = req.user?._id?.toString() || req.user?.id?.toString();
      const profileUserId = profile.userId._id.toString();
      if (requestUserId !== profileUserId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Este perfil es privado' });
      }
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error al obtener perfil académico:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el perfil académico', error: error.message });
  }
};

/**
 * Crear o actualizar perfil académico
 */
const updateAcademicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user?._id?.toString() || req.user?.id?.toString();

    // Verificar que el usuario solo pueda editar su propio perfil o sea ADMIN
    if (requestUserId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar este perfil'
      });
    }

    // Verificar que el usuario exista
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const profileData = {
      userId,
      ...req.body
    };

    // Buscar y actualizar o crear nuevo perfil
    let profile = await AcademicProfile.findOne({ userId });
    
    if (profile) {
      // Actualizar perfil existente
      Object.assign(profile, profileData);
      await profile.save();
    } else {
      // Crear nuevo perfil
      profile = new AcademicProfile(profileData);
      await profile.save();
    }

    // Poblar datos del usuario
    await profile.populate('userId', 'name email profilePic role');

    res.status(200).json({
      success: true,
      message: 'Perfil académico actualizado exitosamente',
      data: profile
    });
  } catch (error) {
    console.error('Error al actualizar perfil académico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el perfil académico',
      error: error.message
    });
  }
};

/**
 * Obtener mi perfil académico (del usuario autenticado)
 */
const getMyAcademicProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    let profile = await AcademicProfile.findOne({ userId }).populate('userId', 'name email profilePic role');
    
    if (!profile) {
      // Si no existe, crear uno vacío
      profile = new AcademicProfile({ userId });
      await profile.save();
      await profile.populate('userId', 'name email profilePic role');
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error al obtener mi perfil académico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil académico',
      error: error.message
    });
  }
};

/**
 * Eliminar perfil académico
 */
const deleteAcademicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user?._id?.toString() || req.user?.id?.toString();

    // Verificar que el usuario solo pueda eliminar su propio perfil o sea ADMIN
    if (requestUserId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este perfil'
      });
    }

    const profile = await AcademicProfile.findOneAndDelete({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil académico no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Perfil académico eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar perfil académico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el perfil académico',
      error: error.message
    });
  }
};

module.exports = {
  getAcademicProfile,
  updateAcademicProfile,
  getMyAcademicProfile,
  deleteAcademicProfile
};
