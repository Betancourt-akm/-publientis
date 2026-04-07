import React, { useContext, useState } from 'react';
import { FaRegUserCircle, FaBars, FaTimes, FaUserShield, FaSignInAlt, FaUser, FaSearch, FaBell, FaHome, FaGraduationCap, FaBriefcase, FaShoppingCart } from 'react-icons/fa';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Context } from '../context';
import Logo from '../components/logo/Logo';
import NotificationCenter from '../components/notifications/NotificationCenter';

const Header = () => {
  const { user, logout } = useContext(Context);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isAdmin = user?.role === 'ADMIN';
  
  const isOrganization = user?.role === 'ORGANIZATION';
  const isFaculty = ['FACULTY', 'DOCENTE'].includes(user?.role);
  const canApprove = isAdmin || isFaculty;
  const isStudent = ['STUDENT', 'USER'].includes(user?.role);
  
  const navLinks = [
    { name: 'Inicio', path: '/', icon: FaHome },
    { name: 'Ofertas', path: '/jobs', icon: FaBriefcase },
    { name: 'Acerca de', path: '/about', icon: FaGraduationCap },
    ...(canApprove
      ? [{ name: 'Aprobaci\u00f3n Ofertas', path: '/jobs/approval', icon: FaGraduationCap }]
      : []),
    ...(isAdmin
      ? [{ 
          name: 'Panel Admin', 
          path: '/admin-panel',
          highlight: true 
        }]
      : []),
  ];

  const userMenu = user?._id
    ? [
        { name: 'Mi Perfil', path: '/perfil' },
        ...(isStudent || isAdmin
          ? [{ name: 'Mis Postulaciones', path: '/jobs/my-applications', icon: <FaBriefcase className="text-indigo-500 mr-2" /> }]
          : []),
        ...(isOrganization || isAdmin
          ? [{ 
              name: 'Mis Ofertas', 
              path: '/jobs/my-offers',
              icon: <FaBriefcase className="text-green-600 mr-2" />
            }]
          : []),
        ...(canApprove
          ? [{ 
              name: 'Aprobar Ofertas', 
              path: '/jobs/approval',
              icon: <FaGraduationCap className="text-purple-600 mr-2" />
            }]
          : []),
        ...(isAdmin 
          ? [{ 
              name: 'Panel Administración', 
              path: '/admin-panel',
              icon: <FaUserShield className="text-teal-600 mr-2" />,
              admin: true 
            }] 
          : []),
        { name: 'Cerrar Sesión', action: logout },
      ]
    : [];

  const closeAllMenus = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo + Search */}
            <div className="flex items-center gap-2 flex-1 max-w-[320px]">
              <Link to="/" className="flex-shrink-0" onClick={closeAllMenus}>
                <Logo />
              </Link>
              
              {/* Search Bar */}
              <div className="hidden md:block flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar en Publientis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        window.location.href = `/academic/feed?search=${encodeURIComponent(searchQuery.trim())}`;
                      }
                    }}
                    className="w-full px-3 py-2 pl-9 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:outline-none text-sm text-gray-700 transition-all"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
                </div>
              </div>
            </div>

            {/* Right Actions - Red Social */}
            <div className="flex items-center gap-4">
              {/* Notificaciones - Solo usuarios logueados */}
              {user?._id && (
                <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Notificaciones">
                  <FaBell className="text-xl text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              )}

              {/* User Authentication - CTA Separado */}
              {!user?._id ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium transition-colors rounded-lg"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/sign-up"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm text-sm"
                  >
                    Registrarse
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Menú de usuario"
                    aria-expanded={userMenuOpen}
                  >
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={`Foto de perfil de ${user?.name || 'usuario'}`}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <FaRegUserCircle className="text-2xl text-gray-600" />
                    )}
                    <div className="hidden md:block text-left">
                      <p className="text-xs text-gray-500">Hola,</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.name || 'Usuario'}
                      </p>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {userMenu.map((item, index) => (
                        <React.Fragment key={item.name}>
                          {item.action ? (
                            <button
                              onClick={() => {
                                item.action();
                                closeAllMenus();
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              {item.icon}
                              {item.name}
                            </button>
                          ) : (
                            <Link
                              to={item.path}
                              onClick={closeAllMenus}
                              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              {item.icon}
                              {item.name}
                            </Link>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              {/* Carrito solo visible si tiene items o está navegando recursos */}
              {(false || location.pathname.includes('/productos') || location.pathname.includes('/producto/')) && (
                <Link to="/carrito" className="header__cart-link header__cart-link--discrete">
                  <FaShoppingCart className="header__cart-icon" />
                  {false > 0 && (
                    <span className="header__cart-badge">{false}</span>
                  )}
                </Link>
              )}
              {/* Centro de Notificaciones */}
              {user && <NotificationCenter />}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <FaTimes className="text-xl text-gray-600" />
                ) : (
                  <FaBars className="text-xl text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación Central con Iconos - Estilo Facebook */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 top-0 h-14 items-center gap-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-10 h-14 flex items-center justify-center border-b-4 transition-colors ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:bg-gray-100'
            }`
          }
        >
          <FaHome className="text-2xl" />
        </NavLink>
        
        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            `px-10 h-14 flex items-center justify-center border-b-4 transition-colors ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:bg-gray-100'
            }`
          }
          title="Ofertas laborales"
        >
          <FaBriefcase className="text-2xl" />
        </NavLink>

        {canApprove && (
          <NavLink
            to="/jobs/approval"
            className={({ isActive }) =>
              `px-10 h-14 flex items-center justify-center border-b-4 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:bg-gray-100'
              }`
            }
            title="Aprobación de ofertas"
          >
            <FaGraduationCap className="text-2xl" />
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/admin-panel"
            className={({ isActive }) =>
              `px-10 h-14 flex items-center justify-center border-b-4 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:bg-gray-100'
              }`
            }
          >
            <FaUserShield className="text-2xl" />
          </NavLink>
        )}
      </div>

      {/* Search Bar - Mobile */}
      <div className="md:hidden px-4 py-3 bg-white border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar en Publientis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                window.location.href = `/academic/feed?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="w-full px-4 py-2 pl-10 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:outline-none"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={closeAllMenus}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {Icon && <Icon className="text-lg" />}
                  {link.name}
                </NavLink>
              );
            })}

            {/* Mobile User Actions */}
            {!user?._id ? (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  to="/login"
                  onClick={closeAllMenus}
                  className="flex items-center justify-center px-4 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <FaSignInAlt className="mr-2" />
                  Iniciar Sesión
                </Link>
                <Link
                  to="/sign-up"
                  onClick={closeAllMenus}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  <FaUser className="mr-2" />
                  Registrarse
                </Link>
              </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-1">
                  {userMenu.map((item) => (
                    <React.Fragment key={item.name}>
                      {item.action ? (
                        <button
                          onClick={() => {
                            item.action();
                            closeAllMenus();
                          }}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
                        >
                          {item.icon}
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={closeAllMenus}
                          className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    );
};

export default Header;
