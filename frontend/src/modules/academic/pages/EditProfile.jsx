import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Context } from '../../../context';
import academicApi from '../services/academicApi';
import {
  FaPlus, FaTrash, FaEye, FaArrowLeft, FaSave,
  FaUserEdit, FaBriefcase, FaAward, FaNewspaper, FaCheckCircle,
  FaGraduationCap, FaLanguage, FaMapMarkerAlt
} from 'react-icons/fa';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);
  const [sectionFeedback, setSectionFeedback] = useState({});
  const [activeSection, setActiveSection] = useState('presentacion');
  const [publications, setPublications] = useState([]);
  const [pubLoading, setPubLoading] = useState(false);
  const [deletingPub, setDeletingPub] = useState(null);

  const refs = {
    presentacion:   useRef(null),
    ubicacion:      useRef(null),
    formacion:      useRef(null),
    experiencia:    useRef(null),
    habilidades:    useRef(null),
    certificaciones:useRef(null),
    publicaciones:  useRef(null),
  };

  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    photo: '',
    location: { city: '', country: '' },
    willingToTravel: false,
    willingToRelocate: false,
    availability: '',
    university: '',
    faculty: '',
    researchLine: '',
    semillero: '',
    skills: '',
    languages: [{ language: '', level: '' }],
    educationHistory: [{ institution: '', degree: '', field: '', startYear: '', endYear: '', current: false, description: '' }],
    practices: [{ company: '', position: '', startDate: '', endDate: '', description: '', current: false }],
    certifications: [{ name: '', issuer: '', date: '', credentialUrl: '', imageUrl: '' }],
    socialLinks: { linkedin: '', github: '', portfolio: '', twitter: '' },
    isPublic: true,
    cvUrl: ''
  });

  useEffect(() => {
    if (user?._id) {
      fetchProfile();
      fetchPublications();
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;
    const observers = [];
    Object.entries(refs).forEach(([id, ref]) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(ref.current);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [loading]);

  const fetchPublications = async () => {
    setPubLoading(true);
    try {
      const res = await fetch(academicApi.getMyPublications.url, {
        credentials: academicApi.getMyPublications.credentials
      });
      const data = await res.json();
      if (data.success) setPublications(data.data || []);
    } catch { /* silencioso */ } finally {
      setPubLoading(false);
    }
  };

  const handleDeletePublication = async (pubId) => {
    if (!window.confirm('¿Eliminar esta publicación?')) return;
    setDeletingPub(pubId);
    try {
      const ep = academicApi.deletePublication(pubId);
      const res = await fetch(ep.url, { method: ep.method, credentials: ep.credentials });
      const data = await res.json();
      if (data.success) setPublications(prev => prev.filter(p => p._id !== pubId));
    } catch { /* silencioso */ } finally {
      setDeletingPub(null);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(academicApi.getMyProfile.url, {
        method: academicApi.getMyProfile.method,
        credentials: academicApi.getMyProfile.credentials
      });

      const data = await response.json();

      if (data.success) {
        const p = data.data;
        setFormData({
          headline: p.headline || '',
          bio: p.bio || '',
          photo: p.photo || '',
          location: { city: p.location?.city || '', country: p.location?.country || '' },
          willingToTravel: p.willingToTravel || false,
          willingToRelocate: p.willingToRelocate || false,
          availability: p.availability || '',
          university: p.university || '',
          faculty: p.faculty || '',
          researchLine: p.researchLine || '',
          semillero: p.semillero || '',
          skills: p.skills?.join(', ') || '',
          languages: p.languages?.length > 0 ? p.languages : [{ language: '', level: '' }],
          educationHistory: p.educationHistory?.length > 0 ? p.educationHistory : [{ institution: '', degree: '', field: '', startYear: '', endYear: '', current: false, description: '' }],
          practices: p.practices?.length > 0 ? p.practices : [{ company: '', position: '', startDate: '', endDate: '', description: '', current: false }],
          certifications: p.certifications?.length > 0 ? p.certifications : [{ name: '', issuer: '', date: '', credentialUrl: '', imageUrl: '' }],
          socialLinks: { linkedin: p.socialLinks?.linkedin || '', github: p.socialLinks?.github || '', portfolio: p.socialLinks?.portfolio || '', twitter: p.socialLinks?.twitter || '' },
          isPublic: p.isPublic !== false,
          cvUrl: p.cvUrl || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handlePracticeChange = (index, field, value) => {
    const newPractices = [...formData.practices];
    newPractices[index][field] = field === 'current' ? value : value;
    setFormData(prev => ({
      ...prev,
      practices: newPractices
    }));
  };

  const addPractice = () => {
    setFormData(prev => ({
      ...prev,
      practices: [...prev.practices, { company: '', position: '', startDate: '', endDate: '', description: '', current: false }]
    }));
  };

  const removePractice = (index) => {
    setFormData(prev => ({
      ...prev,
      practices: prev.practices.filter((_, i) => i !== index)
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    const newCerts = [...formData.certifications];
    newCerts[index][field] = value;
    setFormData(prev => ({
      ...prev,
      certifications: newCerts
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', date: '', credentialUrl: '', imageUrl: '' }]
    }));
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const arr = [...formData.educationHistory];
    arr[index] = { ...arr[index], [field]: value };
    setFormData(prev => ({ ...prev, educationHistory: arr }));
  };
  const addEducation = () => setFormData(prev => ({ ...prev, educationHistory: [...prev.educationHistory, { institution: '', degree: '', field: '', startYear: '', endYear: '', current: false, description: '' }] }));
  const removeEducation = (i) => setFormData(prev => ({ ...prev, educationHistory: prev.educationHistory.filter((_, idx) => idx !== i) }));

  const handleLanguageChange = (index, field, value) => {
    const arr = [...formData.languages];
    arr[index] = { ...arr[index], [field]: value };
    setFormData(prev => ({ ...prev, languages: arr }));
  };
  const addLanguage = () => setFormData(prev => ({ ...prev, languages: [...prev.languages, { language: '', level: '' }] }));
  const removeLanguage = (i) => setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }));

  const handleLocationChange = (field, value) => setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));

  const saveFields = async (sectionId, fields) => {
    setSavingSection(sectionId);
    setSectionFeedback(prev => ({ ...prev, [sectionId]: null }));
    try {
      const endpoint = academicApi.updateProfile(user._id);
      const res = await fetch(endpoint.url, {
        method: endpoint.method,
        credentials: endpoint.credentials,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (data.success) {
        setSectionFeedback(prev => ({ ...prev, [sectionId]: { type: 'ok', msg: 'Guardado ✓' } }));
        setTimeout(() => setSectionFeedback(prev => ({ ...prev, [sectionId]: null })), 3000);
      } else throw new Error(data.message || 'Error al guardar');
    } catch (err) {
      setSectionFeedback(prev => ({ ...prev, [sectionId]: { type: 'err', msg: err.message } }));
    } finally {
      setSavingSection(null);
    }
  };

  const savePresentation = (e) => { e.preventDefault(); saveFields('presentacion', { headline: formData.headline.trim(), bio: formData.bio.trim(), photo: formData.photo.trim(), researchLine: formData.researchLine.trim(), semillero: formData.semillero.trim(), socialLinks: formData.socialLinks, isPublic: formData.isPublic, cvUrl: formData.cvUrl.trim() }); };
  const saveUbicacion    = (e) => { e.preventDefault(); saveFields('ubicacion',     { location: formData.location, willingToTravel: formData.willingToTravel, willingToRelocate: formData.willingToRelocate, availability: formData.availability }); };
  const saveFormacion    = (e) => { e.preventDefault(); saveFields('formacion',    { university: formData.university.trim(), faculty: formData.faculty.trim(), educationHistory: formData.educationHistory.filter(e => e.institution?.trim()) }); };
  const saveExperiencia  = (e) => { e.preventDefault(); saveFields('experiencia',  { practices: formData.practices.filter(p => p.company?.trim() && p.position?.trim()) }); };
  const saveHabilidades  = (e) => { e.preventDefault(); saveFields('habilidades',  { skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean), languages: formData.languages.filter(l => l.language?.trim()) }); };
  const saveCerts        = (e) => { e.preventDefault(); saveFields('certificaciones', { certifications: formData.certifications.filter(c => c.name?.trim() && c.issuer?.trim()) }); };
  const saveAll          = (e) => {
    e.preventDefault();
    saveFields('all', {
      headline: formData.headline.trim(), bio: formData.bio.trim(), photo: formData.photo.trim(),
      location: formData.location, willingToTravel: formData.willingToTravel, willingToRelocate: formData.willingToRelocate, availability: formData.availability,
      university: formData.university.trim(), faculty: formData.faculty.trim(),
      researchLine: formData.researchLine.trim(), semillero: formData.semillero.trim(),
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      languages: formData.languages.filter(l => l.language?.trim()),
      educationHistory: formData.educationHistory.filter(e => e.institution?.trim()),
      practices: formData.practices.filter(p => p.company?.trim() && p.position?.trim()),
      certifications: formData.certifications.filter(c => c.name?.trim() && c.issuer?.trim()),
      socialLinks: formData.socialLinks, isPublic: formData.isPublic, cvUrl: formData.cvUrl.trim()
    });
  };

  const scrollTo = (id) => { refs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const inputCls  = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';
  const labelCls  = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const selectCls = `${inputCls} bg-white`;

  const navItems = [
    { id: 'presentacion',   label: 'Presentación',         icon: FaUserEdit },
    { id: 'ubicacion',      label: 'Ubicación',             icon: FaMapMarkerAlt },
    { id: 'formacion',      label: 'Formación académica',   icon: FaGraduationCap },
    { id: 'experiencia',    label: 'Experiencia',           icon: FaBriefcase },
    { id: 'habilidades',    label: 'Habilidades e idiomas', icon: FaLanguage },
    { id: 'certificaciones',label: 'Certificaciones',       icon: FaAward },
    { id: 'publicaciones',  label: 'Publicaciones',         icon: FaNewspaper },
  ];

  const SectionBar = ({ sectionId }) => {
    const fb  = sectionFeedback[sectionId];
    const busy = savingSection === sectionId;
    return (
      <div className="flex items-center justify-between pt-4 mt-2 border-t gap-3">
        <span className={`text-sm font-medium transition-opacity ${fb ? 'opacity-100' : 'opacity-0'} ${fb?.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
          {fb?.msg || '\u00a0'}
        </span>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={() => navigate(`/academic/profile/${user._id}`)}
            className="py-2 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
            Ver perfil
          </button>
          <button type="submit" disabled={busy}
            className="py-2 px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold disabled:opacity-60 flex items-center gap-2">
            {busy
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
              : <><FaSave /> Guardar sección</>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(`/academic/profile/${user._id}`)} className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
            <FaArrowLeft /> Ver mi perfil
          </button>
          <h1 className="text-white font-bold text-lg">Editar Perfil profesional</h1>
          <button onClick={saveAll} disabled={savingSection === 'all'}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg font-semibold disabled:opacity-60">
            {savingSection === 'all' ? 'Guardando...' : <><FaSave /> Guardar todo</>}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {sectionFeedback['all'] && (
          <div className={`mb-4 rounded-xl p-4 text-sm font-medium ${
            sectionFeedback['all'].type === 'ok' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>{sectionFeedback['all'].msg}</div>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Sidebar sticky */}
          <div className="md:w-52 shrink-0 sticky top-6 self-start">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-l-4 ${
                      activeSection === item.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="shrink-0" /> {item.label}
                  </button>
                );
              })}
            </div>
            <button onClick={saveAll} disabled={savingSection === 'all'}
              className="mt-3 w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {savingSection === 'all'
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
                : <><FaSave /> Guardar todo</>}
            </button>
          </div>

          {/* Main content — all sections visible */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── 1. PRESENTACIÓN ── */}
            <form ref={refs.presentacion} id="presentacion" onSubmit={savePresentation} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 scroll-mt-6">
                <h2 className="font-bold text-gray-900 text-lg border-b pb-3">Presentación profesional</h2>
                <p className="text-xs text-gray-500 -mt-2">Lo primero que verán las instituciones al visitar tu perfil.</p>

                <div>
                  <label className={labelCls}>Titular profesional <span className="text-gray-400 font-normal">(máx. 120 caracteres)</span></label>
                  <input type="text" name="headline" value={formData.headline} onChange={handleChange} maxLength={120}
                    placeholder='Ej: "Egresada en Educación Preescolar | Especialista en primera infancia"' className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">{formData.headline.length}/120</p>
                </div>

                <div>
                  <label className={labelCls}>Biografía / Acerca de mí</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} maxLength={800} rows={5}
                    placeholder="Describe tu perfil profesional, especialidad, logros y lo que te hace único en tu área..." className={`${inputCls} resize-none`} />
                  <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/800</p>
                </div>

                <div>
                  <label className={labelCls}>Foto de perfil (URL)</label>
                  <input type="url" name="photo" value={formData.photo} onChange={handleChange}
                    placeholder="https://res.cloudinary.com/..." className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Sube tu foto en <a href="/perfil" className="text-blue-600 hover:underline">Mi cuenta</a> y pega aquí la URL.</p>
                </div>

                <div>
                  <label className={labelCls}>Línea de investigación / Área de énfasis</label>
                  <input type="text" name="researchLine" value={formData.researchLine} onChange={handleChange}
                    placeholder="Inteligencia Artificial, Derecho Ambiental, Finanzas Corporativas, Educación Inclusiva..." className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Semillero de investigación</label>
                  <input type="text" name="semillero" value={formData.semillero} onChange={handleChange}
                    placeholder="Nombre del semillero (si aplica)" className={inputCls} />
                </div>

                <div className="pt-2 border-t space-y-3">
                  <h3 className="font-semibold text-gray-800">Redes y links profesionales</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>LinkedIn</label>
                      <input type="url" value={formData.socialLinks.linkedin} onChange={e => handleSocialLinkChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>GitHub</label>
                      <input type="url" value={formData.socialLinks.github} onChange={e => handleSocialLinkChange('github', e.target.value)} placeholder="https://github.com/..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Portafolio web</label>
                      <input type="url" value={formData.socialLinks.portfolio} onChange={e => handleSocialLinkChange('portfolio', e.target.value)} placeholder="https://miportafolio.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Twitter / X</label>
                      <input type="url" value={formData.socialLinks.twitter} onChange={e => handleSocialLinkChange('twitter', e.target.value)} placeholder="https://twitter.com/..." className={inputCls} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>CV (PDF en la nube)</label>
                      <input type="url" name="cvUrl" value={formData.cvUrl} onChange={handleChange} placeholder="https://drive.google.com/... o Dropbox, OneDrive..." className={inputCls} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t">
                  <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    <span className="font-medium">Perfil público</span> — visible en el marketplace para instituciones
                  </label>
                </div>
                <SectionBar sectionId="presentacion" />
            </form>

            {/* ── 2. UBICACIÓN Y DISPONIBILIDAD ── */}
            <form ref={refs.ubicacion} id="ubicacion" onSubmit={saveUbicacion} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 scroll-mt-6">
                <h2 className="font-bold text-gray-900 text-lg border-b pb-3">Ubicación y disponibilidad</h2>
                <p className="text-xs text-gray-500 -mt-2">Las instituciones filtran candidatos por ubicación y disponibilidad.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Ciudad</label>
                    <input type="text" value={formData.location.city} onChange={e => handleLocationChange('city', e.target.value)} placeholder="Bogotá, Medellín..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>País</label>
                    <input type="text" value={formData.location.country} onChange={e => handleLocationChange('country', e.target.value)} placeholder="Colombia" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Disponibilidad para empezar</label>
                  <select name="availability" value={formData.availability} onChange={handleChange} className={selectCls}>
                    <option value="">Sin especificar</option>
                    <option value="immediate">Inmediata</option>
                    <option value="1_month">En 1 mes</option>
                    <option value="3_months">En 3 meses</option>
                    <option value="not_available">No disponible actualmente</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <h3 className="font-semibold text-gray-800">Movilidad</h3>
                  <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" name="willingToTravel" checked={formData.willingToTravel} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Dispuesto/a a viajar</p>
                      <p className="text-xs text-gray-500">Acepto desplazamientos para prácticas o eventos</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" name="willingToRelocate" checked={formData.willingToRelocate} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Dispuesto/a a reubicarse</p>
                      <p className="text-xs text-gray-500">Puedo cambiar de ciudad por una oportunidad laboral</p>
                    </div>
                  </label>
                </div>
                <SectionBar sectionId="ubicacion" />
            </form>

            {/* ── 3. FORMACIÓN ACADÉMICA ── */}
            <form ref={refs.formacion} id="formacion" onSubmit={saveFormacion} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 scroll-mt-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Formación académica</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Institución principal y todo tu historial académico.</p>
                  </div>
                  <button type="button" onClick={addEducation} className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                    <FaPlus /> Añadir
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
                  <div>
                    <label className={labelCls}>Universidad / Institución principal</label>
                    <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="Universidad Nacional de Colombia" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Facultad / Departamento</label>
                    <input type="text" name="faculty" value={formData.faculty} onChange={handleChange} placeholder="Facultad de Ciencias de la Educación" className={inputCls} />
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Historial completo</p>

                {formData.educationHistory.map((edu, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Formación #{i + 1}</span>
                      {formData.educationHistory.length > 1 && (
                        <button type="button" onClick={() => removeEducation(i)} className="text-red-400 hover:text-red-600"><FaTrash /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Institución</label>
                        <input type="text" value={edu.institution} onChange={e => handleEducationChange(i, 'institution', e.target.value)} placeholder="Universidad Nacional de Colombia" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Título obtenido</label>
                        <input type="text" value={edu.degree} onChange={e => handleEducationChange(i, 'degree', e.target.value)} placeholder="Licenciado/a, Especialista, Magíster..." className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Área de estudio</label>
                        <input type="text" value={edu.field} onChange={e => handleEducationChange(i, 'field', e.target.value)} placeholder="Ciencias de la Educación, Matemáticas..." className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Año inicio</label>
                        <input type="number" value={edu.startYear} onChange={e => handleEducationChange(i, 'startYear', e.target.value)} placeholder="2018" min="1950" max="2030" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Año fin</label>
                        <input type="number" value={edu.endYear} onChange={e => handleEducationChange(i, 'endYear', e.target.value)} placeholder="2022" min="1950" max="2030" disabled={edu.current} className={`${inputCls} disabled:opacity-50`} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={edu.current} onChange={e => handleEducationChange(i, 'current', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                      Actualmente estudiando aquí
                    </label>
                  </div>
                ))}
                <SectionBar sectionId="formacion" />
            </form>

            {/* ── 4. EXPERIENCIA / PRÁCTICAS ── */}
            <form ref={refs.experiencia} id="experiencia" onSubmit={saveExperiencia} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 scroll-mt-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Experiencia y prácticas</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Prácticas profesionales, pasantías y experiencias laborales relevantes.</p>
                  </div>
                  <button type="button" onClick={addPractice} className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                    <FaPlus /> Añadir
                  </button>
                </div>

                {formData.practices.map((p, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Experiencia #{i + 1}</span>
                      {formData.practices.length > 1 && (
                        <button type="button" onClick={() => removePractice(i)} className="text-red-400 hover:text-red-600"><FaTrash /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Institución / Centro</label>
                        <input type="text" value={p.company} onChange={e => handlePracticeChange(i, 'company', e.target.value)} placeholder="Colegio, institución o empresa" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Cargo / Rol</label>
                        <input type="text" value={p.position} onChange={e => handlePracticeChange(i, 'position', e.target.value)} placeholder="Practicante docente, tutor, coordinador..." className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Fecha inicio</label>
                        <input type="date" value={p.startDate ? p.startDate.substring(0, 10) : ''} onChange={e => handlePracticeChange(i, 'startDate', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Fecha fin</label>
                        <input type="date" value={p.endDate ? p.endDate.substring(0, 10) : ''} onChange={e => handlePracticeChange(i, 'endDate', e.target.value)} disabled={p.current} className={`${inputCls} disabled:opacity-50`} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={p.current} onChange={e => handlePracticeChange(i, 'current', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                      Trabajo aquí actualmente
                    </label>
                    <div>
                      <label className={labelCls}>Descripción de funciones y logros</label>
                      <textarea value={p.description} onChange={e => handlePracticeChange(i, 'description', e.target.value)} rows={3} placeholder="Describe tus actividades, nivel educativo atendido, logros y aprendizajes..." className={`${inputCls} resize-none`} />
                    </div>
                  </div>
                ))}
                <SectionBar sectionId="experiencia" />
            </form>

            {/* ── 5. HABILIDADES E IDIOMAS ── */}
            <form ref={refs.habilidades} id="habilidades" onSubmit={saveHabilidades} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 scroll-mt-6">
                <h2 className="font-bold text-gray-900 text-lg border-b pb-3">Habilidades e idiomas</h2>

                <div>
                  <label className={labelCls}>Habilidades profesionales <span className="text-gray-400 font-normal">(separadas por coma)</span></label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange}
                    placeholder="Python, Gestión de proyectos, Análisis financiero, Derecho laboral, Investigación..." className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Separa cada habilidad con una coma. Las organizaciones buscan por estas palabras.</p>
                </div>

                <div className="pt-3 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Idiomas</h3>
                    <button type="button" onClick={addLanguage} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                      <FaPlus /> Añadir
                    </button>
                  </div>
                  {formData.languages.map((lang, i) => (
                    <div key={i} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className={labelCls}>Idioma</label>
                        <input type="text" value={lang.language} onChange={e => handleLanguageChange(i, 'language', e.target.value)} placeholder="Español, Inglés, Francés..." className={inputCls} />
                      </div>
                      <div className="w-40">
                        <label className={labelCls}>Nivel</label>
                        <select value={lang.level} onChange={e => handleLanguageChange(i, 'level', e.target.value)} className={selectCls}>
                          <option value="">Nivel</option>
                          <option value="basico">Básico</option>
                          <option value="intermedio">Intermedio</option>
                          <option value="avanzado">Avanzado</option>
                          <option value="nativo">Nativo</option>
                        </select>
                      </div>
                      {formData.languages.length > 1 && (
                        <button type="button" onClick={() => removeLanguage(i)} className="text-red-400 hover:text-red-600 pb-2.5"><FaTrash /></button>
                      )}
                    </div>
                  ))}
                </div>
                <SectionBar sectionId="habilidades" />
            </form>

            {/* ── 6. CERTIFICACIONES ── */}
            <form ref={refs.certificaciones} id="certificaciones" onSubmit={saveCerts} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 scroll-mt-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Certificaciones y cursos</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Diplomas, talleres, especializaciones y cursos relevantes.</p>
                  </div>
                  <button type="button" onClick={addCertification} className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                    <FaPlus /> Añadir
                  </button>
                </div>
                {formData.certifications.map((c, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Certificación #{i + 1}</span>
                      {formData.certifications.length > 1 && (
                        <button type="button" onClick={() => removeCertification(i)} className="text-red-400 hover:text-red-600"><FaTrash /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Nombre del certificado</label>
                        <input type="text" value={c.name} onChange={e => handleCertificationChange(i, 'name', e.target.value)} placeholder="Diplomado en Didáctica..." className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Institución emisora</label>
                        <input type="text" value={c.issuer} onChange={e => handleCertificationChange(i, 'issuer', e.target.value)} placeholder="MEN, Coursera, Universidad..." className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Fecha de emisión</label>
                        <input type="date" value={c.date ? c.date.substring(0, 10) : ''} onChange={e => handleCertificationChange(i, 'date', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>URL de verificación</label>
                        <input type="url" value={c.credentialUrl} onChange={e => handleCertificationChange(i, 'credentialUrl', e.target.value)} placeholder="https://..." className={inputCls} />
                      </div>
                    </div>
                  </div>
                ))}
                <SectionBar sectionId="certificaciones" />
            </form>

            {/* ── 7. PUBLICACIONES ── */}
            <div ref={refs.publicaciones} id="publicaciones" className="bg-white rounded-2xl shadow-sm p-6 space-y-5 scroll-mt-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Mis publicaciones</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Artículos, proyectos, recursos y aportes a tu área de conocimiento.</p>
                  </div>
                  <Link to="/academic/create-publication" className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <FaPlus /> Nueva
                  </Link>
                </div>
                {pubLoading ? (
                  <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : publications.length === 0 ? (
                  <div className="text-center py-12">
                    <FaNewspaper className="text-4xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Aún no has publicado nada en la comunidad.</p>
                    <Link to="/academic/create-publication" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium">
                      <FaPlus /> Crear primera publicación
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {publications.map(pub => (
                      <div key={pub._id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pub.status === 'APPROVED' ? 'bg-green-100 text-green-800' : pub.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {pub.status === 'APPROVED' ? 'Aprobada' : pub.status === 'PENDING' ? 'Pendiente revisión' : 'Rechazada'}
                            </span>
                            {pub.createdAt && <span className="text-xs text-gray-400">{new Date(pub.createdAt).toLocaleDateString('es-ES')}</span>}
                          </div>
                          <h4 className="font-semibold text-gray-900 truncate">{pub.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{pub.content}</p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button onClick={() => navigate(`/academic/profile/${user._id}`)} className="p-2 text-gray-400 hover:text-blue-600" title="Ver perfil"><FaEye /></button>
                          <button onClick={() => handleDeletePublication(pub._id)} disabled={deletingPub === pub._id} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50" title="Eliminar"><FaTrash /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* ── GUARDAR TODO (bottom) ── */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-800">¿Listo con todos los cambios?</p>
                <p className="text-sm text-gray-500">Guarda todas las secciones a la vez con un solo clic.</p>
              </div>
              <button onClick={saveAll} disabled={savingSection === 'all'}
                className="py-3 px-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm disabled:opacity-60 flex items-center gap-2 shrink-0">
                {savingSection === 'all'
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando todo...</>
                  : <><FaSave /> Guardar todo el perfil</>}
              </button>
            </div>

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
