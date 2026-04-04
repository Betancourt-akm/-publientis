// middleware/roleMiddleware.js
const userModel = require("../models/userModel");

/**
 * @param {String} userId
 * @returns {Promise<Boolean>}
 */
async function isAdmin(userId) {
  const u = await userModel.findById(userId);
  return !!(u && u.role === 'ADMIN');
}

/**
 * @param {String} userId
 * @returns {Promise<Boolean>}
 */
async function isTeacher(userId) {
  const u = await userModel.findById(userId);
  // suponemos que el profe debe estar aprobado para tener permisos
  return !!(u && u.role === 'WALKER' && u.metadata?.profileStatus === 'APPROVED');
}

/**
 * @param {String} userId
 * @returns {Promise<Boolean>}
 */
async function isStudent(userId) {
  const u = await userModel.findById(userId);
  return !!(u && u.role === 'OWNER');
}

module.exports = {
  isAdmin,
  isTeacher,
  isStudent
};
