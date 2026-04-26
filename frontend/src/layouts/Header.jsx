import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  FaRegUserCircle, FaBars, FaTimes, FaUserShield, FaSignInAlt,
  FaUser, FaSearch, FaGraduationCap, FaBriefcase, FaUsers,
  FaHandshake, FaUserGraduate, FaSignOutAlt, FaChevronDown,
  FaEdit, FaCog, FaNewspaper,
} from 'react-icons/fa';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Context } from '../context';
import Logo from '../components/logo/Logo';
import NotificationCenter from '../components/notifications/NotificationCenter';
import FriendRequestsBadge from '../components/friends/FriendRequestsBadge';

const ACCENT = {
  blue:   { active: 'border-blue-600 text-blue-600',   icon: 'bg-blue-50 text-blue-600' },
  green:  { active: 'border-green-600 text-green-600', icon: 'bg-green-50 text-green-600' },
  purple: { active: 'border-purple-600 text-purple-600', icon: 'bg-purple-50 text-purple-600' },
  teal:   { active: 'border-teal-600 text-teal-600',   icon: 'bg-teal-50 text-teal-600' },
};

const Header = () => {
  const { user, logout } = useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  const isAdmin = user?.role === 'ADMIN';
  const isOrganization = user?.role === 'ORGANIZATION';
  const isFaculty = ['FACULTY', 'DOCENTE'].includes(user?.role);
  const canApprove = isAdmin || isFaculty;
  const isStudent = ['STUDENT', 'USER'].includes(user?.role);

  /* ── close everything on route change ── */
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  /* ── close user dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── lock body scroll while mobile menu is open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setMenuOpen(false);
    }
  };

  /* ── nav items ── */
  const navItems = [
    { name: 'Talento',       path: '/',                      icon: FaUserGraduate, accent: 'blue'   },
    { name: 'Oportunidades', path: '/jobs',                   icon: FaBriefcase,    accent: 'blue'   },
    ...(user?._id   ? [{ name: 'Comunidad',   path: '/comunidad',            icon: FaUsers,        accent: 'blue'   }] : []),
    ...(isFaculty   ? [{ name: 'Matchmaking', path: '/dashboard/matchmaking', icon: FaHandshake,    accent: 'green'  }] : []),
    ...(canApprove  ? [{ name: 'Aprobar',     path: '/jobs/approval',         icon: FaGraduationCap,accent: 'purple' }] : []),
    ...(isAdmin     ? [{ name: 'Admin',       path: '/admin-panel',           icon: FaUserShield,   accent: 'teal'   }] : []),
  ];

  /* ── user dropdown items ── */
  const userMenuItems = user?._id ? [
    // ── Perfil
    { name: 'Mi perfil',     path: `/academic/profile/${user._id}`, icon: FaUser },
    { name: 'Editar perfil', path: '/academic/edit-profile',         icon: FaEdit },
    { name: 'Mi cuenta',     path: '/perfil',                        icon: FaCog  },
    { divider: true },
    // ── Actividad
    ...(!isOrganization ? [{ name: 'Mis publicaciones', path: `/academic/profile/${user._id}`, icon: FaNewspaper }] : []),
    ...(isStudent || isAdmin    ? [{ name: 'Mis postulaciones', path: '/jobs/my-applications', icon: FaBriefcase }] : []),
    ...(isOrganization || isAdmin ? [{ name: 'Mis ofertas',     path: '/jobs/my-offers',        icon: FaBriefcase }] : []),
    ...(isFaculty               ? [{ name: 'Matchmaking',       path: '/dashboard/matchmaking', icon: FaHandshake }] : []),
    ...(canApprove              ? [{ name: 'Aprobar ofertas',   path: '/jobs/approval',          icon: FaGraduationCap }] : []),
    ...(isAdmin                 ? [{ name: 'Panel Admin',       path: '/admin-panel',            icon: FaUserShield }] : []),
    { divider: true },
    // ── Sesión
    { name: 'Cerrar sesión', action: logout, icon: FaSignOutAlt, danger: true },
  ] : [];

  const searchPlaceholder = isOrganization ? 'Buscar talento...' : 'Buscar empleo o talento...';

  return (
    <>
      {/* ════════════════════════════════ HEADER BAR ════════════════════════════════ */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">

        <div className="flex items-center h-16 px-3 sm:px-4 lg:px-6 gap-2">

          {/* ── LEFT: Logo + Desktop Search ── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" aria-label="Ir al inicio" className="shrink-0 flex items-center">
              <Logo />
            </Link>

            {/* Desktop search — visible ≥ lg */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center w-56 xl:w-72">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 border border-transparent rounded-full
                             focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              </div>
            </form>
          </div>

          {/* ── CENTER: Desktop Nav tabs ── */}
          <nav
            className="hidden md:flex flex-1 h-full items-center justify-center gap-0"
            aria-label="Navegación principal"
          >
            {navItems.map(({ name, path, icon: Icon, accent }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 px-4 lg:px-5 h-16
                   border-b-[3px] text-[11px] font-semibold tracking-wide whitespace-nowrap
                   transition-colors duration-150 ${
                    isActive
                      ? ACCENT[accent].active
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="text-[18px]" />
                <span>{name}</span>
              </NavLink>
            ))}
          </nav>

          {/* ── RIGHT: Actions ── */}
          <div className="flex items-center gap-1 ml-auto shrink-0">

            {/* Mobile: search toggle */}
            <button
              onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMenuOpen(false); }}
              className="lg:hidden p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Buscar"
            >
              <FaSearch className="text-[17px]" />
            </button>

            {/* Friend requests badge — logged-in only */}
            {user?._id && <FriendRequestsBadge />}

            {/* Notifications — logged-in only */}
            {user?._id && <NotificationCenter />}

            {/* Desktop: guest CTAs */}
            {!user?._id && (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/sign-up"
                  className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg
                             hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Desktop: user dropdown */}
            {user?._id && (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors ml-1"
                  aria-label="Menú de usuario"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name || 'Avatar'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                    />
                  ) : (
                    <FaRegUserCircle className="text-[28px] text-gray-500" />
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-[10px] text-gray-400 leading-none">Hola,</p>
                    <p className="text-sm font-semibold text-gray-800 leading-tight max-w-[88px] truncate">
                      {user.name?.split(' ')[0] || 'Usuario'}
                    </p>
                  </div>
                  <FaChevronDown
                    className={`text-[11px] text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown panel */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-50">
                    {/* Identity row */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 mb-1">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <FaRegUserCircle className="text-[36px] text-gray-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    {userMenuItems.map((item, idx) => {
                      if (item.divider) return <div key={`div-${idx}`} className="mx-3 my-1 h-px bg-gray-100" />;
                      const ItemIcon = item.icon;
                      const base = 'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors text-left rounded-lg';
                      return (
                        <React.Fragment key={item.name}>
                          {item.action ? (
                            <button
                              onClick={() => { item.action(); setUserMenuOpen(false); }}
                              className={`${base} ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                              {ItemIcon && <ItemIcon className="text-base shrink-0 opacity-70" />}
                              {item.name}
                            </button>
                          ) : (
                            <Link
                              to={item.path}
                              onClick={() => setUserMenuOpen(false)}
                              className={`${base} text-gray-700 hover:bg-gray-50`}
                            >
                              {ItemIcon && <ItemIcon className="text-base shrink-0 text-gray-400" />}
                              {item.name}
                            </Link>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Mobile: hamburger */}
            <button
              onClick={() => { setMenuOpen(!menuOpen); setMobileSearchOpen(false); }}
              className="md:hidden p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 ml-0.5"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* ── Mobile expandable search bar ── */}
        {mobileSearchOpen && (
          <div className="lg:hidden px-4 pb-3 pt-1 bg-white border-t border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                autoFocus
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-full text-sm
                           focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Cerrar búsqueda"
              >
                <FaTimes className="text-sm" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ════════════════════════════════ MOBILE OVERLAY ════════════════════════════════ */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ════════════════════════════════ MOBILE DRAWER ════════════════════════════════ */}
      <div
        className={`fixed top-16 left-0 right-0 bottom-0 z-30 md:hidden bg-white overflow-y-auto
                    transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Nav section */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
            Explorar
          </p>
          {navItems.map(({ name, path, icon: Icon, accent }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3.5 rounded-2xl text-[15px] font-medium transition-colors mb-1 ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <span className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 ${ACCENT[accent].icon}`}>
                <Icon className="text-lg" />
              </span>
              {name}
            </NavLink>
          ))}
        </div>

        <div className="mx-4 h-px bg-gray-100 my-1" />

        {/* Auth / user section */}
        {!user?._id ? (
          <div className="px-4 py-4 space-y-2.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-3">
              Cuenta
            </p>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 border border-gray-300 text-gray-700
                         font-semibold rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <FaSignInAlt />
              Iniciar Sesión
            </Link>
            <Link
              to="/sign-up"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white
                         font-semibold rounded-2xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaUser />
              Crear Cuenta
            </Link>
          </div>
        ) : (
          <div className="px-4 py-4">
            {/* Identity card */}
            <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-2xl mb-4">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow"
                />
              ) : (
                <FaRegUserCircle className="text-[48px] text-gray-400 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate leading-tight">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Mi Cuenta
            </p>
            {userMenuItems.map((item, idx) => {
              if (item.divider) return <div key={`div-${idx}`} className="mx-3 my-2 h-px bg-gray-100" />;
              const ItemIcon = item.icon;
              return (
                <React.Fragment key={item.name}>
                  {item.action ? (
                    <button
                      onClick={() => { item.action(); setMenuOpen(false); }}
                      className={`flex items-center gap-4 w-full px-3 py-3.5 rounded-2xl text-[15px] font-medium transition-colors mb-1 ${
                        item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {ItemIcon && (
                        <span className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 ${
                          item.danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <ItemIcon className="text-base" />
                        </span>
                      )}
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 px-3 py-3.5 rounded-2xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-1"
                    >
                      {ItemIcon && (
                        <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 shrink-0">
                          <ItemIcon className="text-base" />
                        </span>
                      )}
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Safe-zone bottom padding */}
        <div className="h-8" />
      </div>
    </>
  );
};

export default Header;
