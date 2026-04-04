// src/components/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protege rutas según el/los roles permitidos.
 *
 * @param {string[]} allowedRoles  Roles autorizados (p. ej. ['WALKER'])
 * @param {ReactNode} [children]   Opcional: hijos directos si no usas <Outlet/>
 */
export default function RequireAuth({ allowedRoles = [], children }) {
  const user      = useSelector(state => state.user.user);
  const location  = useLocation(); // para volver después del login
  const roleUpper = user?.role?.toUpperCase();

  // 1. No logueado → redirige a /login y recuerda a dónde quería ir
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Rol no permitido → tira a home
  if (allowedRoles.length && !allowedRoles.map(r => r.toUpperCase()).includes(roleUpper)) {
    return <Navigate to="/" replace />;
  }

  // 3. Autorizado → muestra lo que venga
  return children ?? <Outlet />;
}
