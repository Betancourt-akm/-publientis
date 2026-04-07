/**
 * Dashboard Switcher - Redirige según rol y jerarquía
 * 
 * Implementa el principio de Interfaz Adaptativa:
 * Cada usuario ve el dashboard correspondiente a su nivel de autoridad
 * 
 * Jerarquía:
 * - Nivel 0 (Universidad): UniversityDashboard
 * - Nivel 1 (Facultad): FacultyDashboard
 * - Nivel 2 (Programa): ProgramDashboard
 */

export const getDashboardRoute = (user) => {
  if (!user) return '/login';

  const { role, university, facultyRef, academicProgramRef } = user;

  // Super Admin / Owner → UniversityDashboard (Nivel 0)
  if (role === 'ADMIN' || role === 'OWNER') {
    if (university) {
      return '/dashboard/university';
    }
    return '/admin'; // Fallback al admin panel legacy
  }

  // Decano de Facultad → FacultyDashboard (Nivel 1)
  if (role === 'FACULTY') {
    if (facultyRef && university) {
      return '/dashboard/faculty';
    }
    return '/admin'; // Fallback
  }

  // Coordinador de Programa → ProgramDashboard (Nivel 2)
  if (role === 'DOCENTE') {
    if (academicProgramRef && facultyRef && university) {
      return '/dashboard/program';
    }
    return '/dashboard'; // Dashboard genérico de docente
  }

  // Estudiante → Dashboard de estudiante
  if (role === 'STUDENT') {
    return '/dashboard';
  }

  // Organización → Dashboard de institución
  if (role === 'ORGANIZATION') {
    return '/organization-dashboard';
  }

  // Default
  return '/dashboard';
};

export const canAccessDashboard = (user, dashboardLevel) => {
  if (!user) return false;

  const { role, university, facultyRef, academicProgramRef } = user;

  switch (dashboardLevel) {
    case 'university':
      return ['ADMIN', 'OWNER'].includes(role) && university;
      
    case 'faculty':
      return role === 'FACULTY' && facultyRef && university;
      
    case 'program':
      return role === 'DOCENTE' && academicProgramRef && facultyRef && university;
      
    default:
      return false;
  }
};
