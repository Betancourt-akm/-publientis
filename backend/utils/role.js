/**
 * Enumeración de roles del sistema — Publientis
 * Utilizado para autorización y control de acceso
 */
const ROLE = {
  ADMIN:        'ADMIN',
  STUDENT:      'STUDENT',      // Egresado / Estudiante en formación
  USER:         'USER',         // Alias de STUDENT (legacy)
  ORGANIZATION: 'ORGANIZATION', // Empresa / Institución educativa
  FACULTY:      'FACULTY',      // Docente / Personal de facultad
  DOCENTE:      'DOCENTE',      // Alias de FACULTY (legacy)
};

module.exports = ROLE;
