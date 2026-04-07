import React from 'react';
import { Navigate } from 'react-router-dom';
import UniversityDashboard from '../pages/dashboards/UniversityDashboard';
import FacultyDashboard from '../pages/dashboards/FacultyDashboard';
import ProgramDashboard from '../pages/dashboards/ProgramDashboard';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { canAccessDashboard } from '../utils/dashboardSwitcher';

/**
 * Rutas de Dashboards Adaptativos
 * 
 * Cada dashboard tiene protección basada en jerarquía:
 * - UniversityDashboard: Solo ADMIN/OWNER con university
 * - FacultyDashboard: Solo FACULTY con facultyRef
 * - ProgramDashboard: Solo DOCENTE con academicProgramRef
 */

const DashboardGuard = ({ children, level }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!canAccessDashboard(user, level)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const dashboardRoutes = [
  {
    path: 'dashboard/university',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
        <DashboardGuard level="university">
          <UniversityDashboard />
        </DashboardGuard>
      </ProtectedRoute>
    )
  },
  {
    path: 'dashboard/faculty',
    element: (
      <ProtectedRoute allowedRoles={['FACULTY']}>
        <DashboardGuard level="faculty">
          <FacultyDashboard />
        </DashboardGuard>
      </ProtectedRoute>
    )
  },
  {
    path: 'dashboard/program',
    element: (
      <ProtectedRoute allowedRoles={['DOCENTE']}>
        <DashboardGuard level="program">
          <ProgramDashboard />
        </DashboardGuard>
      </ProtectedRoute>
    )
  }
];

export default dashboardRoutes;
