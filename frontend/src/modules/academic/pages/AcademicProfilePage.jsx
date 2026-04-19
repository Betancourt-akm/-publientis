import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Context } from '../../../context';
import academicApi from '../services/academicApi';
import {
  FaUserGraduate, FaBuilding, FaChalkboardTeacher, FaCheckCircle,
  FaBriefcase, FaFileAlt, FaEdit, FaLinkedin, FaGlobe,
  FaMapMarkerAlt, FaUniversity, FaBookOpen, FaArrowLeft,
  FaGraduationCap, FaLanguage, FaPlane, FaHome, FaClock,
  FaFilePdf, FaUserCog
} from 'react-icons/fa';

const ROLE_LABEL = {
  STUDENT:      { label: 'Egresado / Estudiante', icon: FaUserGraduate, color: 'bg-blue-100 text-blue-800' },
  USER:         { label: 'Egresado / Estudiante', icon: FaUserGraduate, color: 'bg-blue-100 text-blue-800' },
  ORGANIZATION: { label: 'Empresa / Institución', icon: FaBuilding,     color: 'bg-green-100 text-green-800' },
  FACULTY:      { label: 'Docente / Facultad',    icon: FaChalkboardTeacher, color: 'bg-purple-100 text-purple-800' },
  DOCENTE:      { label: 'Docente / Facultad',    icon: FaChalkboardTeacher, color: 'bg-purple-100 text-purple-800' },
  ADMIN:        { label: 'Administrador',          icon: FaUserGraduate, color: 'bg-gray-100 text-gray-800' },
};

const AcademicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(Context);
  const isOwnProfile = currentUser?._id === userId || currentUser?.id === userId;

  const [profile, setProfile] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sobre');

  useEffect(() => {
    fetchProfile();
    fetchPublications();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = academicApi.getProfileByUserId(userId);
      const res = await fetch(endpoint.url, { method: endpoint.method, credentials: 'include' });
      const data = await res.json();
      if (data.success) setProfile(data.data);
      else setError(data.message || 'No se pudo cargar el perfil');
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublications = async () => {
    try {
      const res = await fetch(
        `${academicApi.getPublicationFeed.url}?authorId=${userId}&status=APPROVED`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (data.success) setPublications(data.data || []);
    } catch { /* silencioso */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
          <FaUserGraduate className="text-5xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Perfil no disponible</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const pUser   = profile?.userId || {};
  const role    = pUser.role || 'STUDENT';
  const roleInfo = ROLE_LABEL[role] || ROLE_LABEL.STUDENT;
  const RoleIcon = roleInfo.icon;
  const avatar   = profile?.photo || pUser.profilePic;
  const isVerified = profile?.profileStatus === 'verified';
  const emphasis   = pUser.pedagogicalEmphasis || [];
  const skills     = profile?.skills || [];
  const languages  = profile?.languages || [];
  const practices  = profile?.practices || [];
  const certs      = profile?.certifications || [];
  const education  = profile?.educationHistory || [];
  const isEmpty    = !profile?.bio && !profile?.headline && skills.length === 0 && practices.length === 0 && certs.length === 0 && publications.length === 0 && education.length === 0;

  const AVAIL_LABEL = {
    immediate:     { label: 'Disponibilidad inmediata', color: 'bg-green-100 text-green-800' },
    '1_month':     { label: 'Disponible en 1 mes',      color: 'bg-yellow-100 text-yellow-800' },
    '3_months':    { label: 'Disponible en 3 meses',    color: 'bg-orange-100 text-orange-800' },
    not_available: { label: 'No disponible',            color: 'bg-gray-100 text-gray-600' },
  };

  const LANG_LEVEL = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado', nativo: 'Nativo' };

  const tabs = [
    { id: 'sobre',        label: 'Sobre mí' },
    { id: 'formacion',    label: `Formación (${education.length})` },
    { id: 'experiencia',  label: `Experiencia (${practices.length})` },
    { id: 'certificaciones', label: `Certificaciones (${certs.length})` },
    { id: 'publicaciones',   label: `Publicaciones (${publications.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
          <FaArrowLeft /> Volver
        </button>
        {isOwnProfile && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Link to="/perfil" className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm px-3 py-2 rounded-lg transition-colors">
              <FaUserCog /> Mi cuenta
            </Link>
            <Link to="/academic/edit-profile" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              <FaEdit /> Editar perfil
            </Link>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Card de cabecera */}
        <div className="bg-white rounded-2xl shadow-sm -mt-16 mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {avatar ? (
                <img src={avatar} alt={pUser.name} className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg" onError={e => { e.target.src = '/default-avatar.png'; }} />
              ) : (
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                  {pUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              {isVerified && (
                <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                  <FaCheckCircle className="text-xs" />
                </span>
              )}
            </div>

            {/* Info principal */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{pUser.name || 'Usuario'}</h1>
                {isVerified && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium mt-1">
                    <FaCheckCircle /> Verificado
                  </span>
                )}
              </div>

              {/* Headline */}
              {profile?.headline && (
                <p className="text-base text-gray-700 font-medium mb-2">{profile.headline}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${roleInfo.color}`}>
                  <RoleIcon /> {roleInfo.label}
                </span>
                {profile?.availability && AVAIL_LABEL[profile.availability] && (
                  <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${AVAIL_LABEL[profile.availability].color}`}>
                    <FaClock /> {AVAIL_LABEL[profile.availability].label}
                  </span>
                )}
              </div>

              {/* Ubicación */}
              {(profile?.location?.city || profile?.location?.country) && (
                <p className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <FaMapMarkerAlt className="text-red-400 shrink-0" />
                  {[profile.location.city, profile.location.country].filter(Boolean).join(', ')}
                </p>
              )}

              {(profile?.university || pUser.facultyRef?.name) && (
                <p className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <FaUniversity className="text-indigo-400 shrink-0" />
                  <span>
                    {profile?.university || ''}
                    {profile?.faculty || pUser.facultyRef?.name ? ` — ${profile?.faculty || pUser.facultyRef?.name}` : ''}
                  </span>
                </p>
              )}

              {pUser.academicProgramRef?.name && (
                <p className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <FaBookOpen className="text-blue-400 shrink-0" />
                  {pUser.academicProgramRef.name}
                </p>
              )}

              {/* Movilidad */}
              <div className="flex flex-wrap gap-2 mt-2">
                {profile?.willingToTravel && (
                  <span className="inline-flex items-center gap-1 text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                    <FaPlane /> Dispuesto a viajar
                  </span>
                )}
                {profile?.willingToRelocate && (
                  <span className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
                    <FaHome /> Abierto a reubicarse
                  </span>
                )}
              </div>

              {/* Énfasis pedagógico */}
              {emphasis.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {emphasis.map((em, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{em}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats rápidos */}
            <div className="flex sm:flex-col gap-4 sm:gap-2 shrink-0 text-center">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{education.length}</p>
                <p className="text-xs text-gray-500">Formación</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{practices.length}</p>
                <p className="text-xs text-gray-500">Experiencia</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{certs.length}</p>
                <p className="text-xs text-gray-500">Certs.</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{publications.length}</p>
                <p className="text-xs text-gray-500">Publs.</p>
              </div>
            </div>
          </div>

          {/* Links sociales + CV */}
          {(profile?.socialLinks?.linkedin || profile?.socialLinks?.portfolio || profile?.cvUrl) && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                  <FaLinkedin /> LinkedIn
                </a>
              )}
              {profile.socialLinks?.portfolio && (
                <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm">
                  <FaGlobe /> Portafolio
                </a>
              )}
              {profile.cvUrl && (
                <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm">
                  <FaFilePdf /> Ver CV
                </a>
              )}
            </div>
          )}
        </div>

        {/* CTA para completar perfil propio */}
        {isOwnProfile && isEmpty && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-4">
            <FaEdit className="text-3xl text-blue-500 shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-blue-900">Tu perfil está vacío</h3>
              <p className="text-blue-700 text-sm mt-0.5">Completa tu bio, prácticas y habilidades para aparecer en el marketplace y recibir invitaciones de instituciones.</p>
            </div>
            <Link to="/academic/edit-profile" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shrink-0">
              Completar perfil
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === t.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* SOBRE MÍ */}
            {activeTab === 'sobre' && (
              <div className="space-y-6">
                {profile?.bio ? (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Acerca de</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                  </div>
                ) : isOwnProfile ? (
                  <p className="text-gray-400 italic text-sm">No has añadido una biografía todavía.</p>
                ) : (
                  <p className="text-gray-400 italic text-sm">Este usuario aún no ha completado su biografía.</p>
                )}

                {skills.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Habilidades pedagógicas</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full text-sm font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {languages.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaLanguage className="text-blue-500" /> Idiomas</h3>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((l, i) => (
                        <span key={i} className="px-3 py-1 bg-sky-50 text-sky-800 rounded-full text-sm font-medium">
                          {l.language}{l.level ? ` · ${LANG_LEVEL[l.level] || l.level}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile?.researchLine && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Línea de investigación</h3>
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">🔬 {profile.researchLine}</span>
                  </div>
                )}

                {profile?.semillero && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Semillero</h3>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">🌱 {profile.semillero}</span>
                  </div>
                )}
              </div>
            )}

            {/* FORMACIÓN */}
            {activeTab === 'formacion' && (
              <div>
                {education.length > 0 ? (
                  <div className="space-y-4">
                    {education.map((edu, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                          <FaGraduationCap className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{edu.degree || 'Título'}{edu.field ? ` en ${edu.field}` : ''}</h4>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {edu.startYear || ''}
                            {' — '}
                            {edu.current ? 'En curso' : edu.endYear || ''}
                          </p>
                          {edu.description && <p className="text-sm text-gray-600 mt-1">{edu.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaGraduationCap className="text-4xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {isOwnProfile ? 'Aún no has añadido tu formación académica.' : 'Sin formación registrada aún.'}
                    </p>
                    {isOwnProfile && (
                      <Link to="/academic/edit-profile" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Añadir formación →</Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EXPERIENCIA */}
            {activeTab === 'experiencia' && (
              <div>
                {practices.length > 0 ? (
                  <div className="space-y-4">
                    {practices.map((p, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                          <FaBriefcase className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{p.position || 'Práctica pedagógica'}</h4>
                          <p className="text-sm text-gray-600">{p.company}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {p.startDate ? new Date(p.startDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' }) : ''}
                            {' — '}
                            {p.current ? 'Presente' : p.endDate ? new Date(p.endDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' }) : ''}
                          </p>
                          {p.description && <p className="text-sm text-gray-700 mt-2">{p.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaBriefcase className="text-4xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {isOwnProfile ? 'Aún no has añadido experiencias.' : 'Sin experiencia registrada aún.'}
                    </p>
                    {isOwnProfile && (
                      <Link to="/academic/edit-profile" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Añadir experiencia →</Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CERTIFICACIONES */}
            {activeTab === 'certificaciones' && (
              <div>
                {certs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {certs.map((c, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <h4 className="font-semibold text-gray-900">{c.name}</h4>
                        <p className="text-sm text-gray-500">{c.issuer}</p>
                        {c.date && <p className="text-xs text-gray-400 mt-1">{new Date(c.date).toLocaleDateString('es-ES')}</p>}
                        {c.credentialUrl && (
                          <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline mt-2 inline-block">Ver credencial →</a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaFileAlt className="text-4xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {isOwnProfile ? 'Aún no has añadido certificaciones.' : 'Sin certificaciones registradas.'}
                    </p>
                    {isOwnProfile && (
                      <Link to="/academic/edit-profile" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Añadir certificación →</Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PUBLICACIONES */}
            {activeTab === 'publicaciones' && (
              <div>
                {publications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publications.map(pub => (
                      <div key={pub._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <h4 className="font-semibold text-gray-900 line-clamp-2">{pub.title}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{pub.content}</p>
                        {pub.createdAt && <p className="text-xs text-gray-400 mt-2">{new Date(pub.createdAt).toLocaleDateString('es-ES')}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaBookOpen className="text-4xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {isOwnProfile ? 'Aún no has publicado nada en la comunidad.' : 'Sin publicaciones aún.'}
                    </p>
                    {isOwnProfile && (
                      <Link to="/comunidad" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Ir a la comunidad →</Link>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
};

export default AcademicProfilePage;
