import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Context } from '../../../context';
import academicApi from '../services/academicApi';
import Spinner from '../../../components/common/Spinner';
import {
  FaPlus, FaTrash, FaEye, FaArrowLeft,
  FaUserEdit, FaBriefcase, FaAward, FaNewspaper, FaCheckCircle,
  FaGraduationCap, FaLanguage, FaShareAlt, FaMapMarkerAlt, FaPlane, FaHome
} from 'react-icons/fa';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('info');
  const [publications, setPublications] = useState([]);
  const [pubLoading, setPubLoading] = useState(false);
  const [deletingPub, setDeletingPub] = useState(null);

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
      setError('Error al cargar el perfil');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);

      const validPractices = formData.practices.filter(p => p.company?.trim() && p.position?.trim());
      const validCertifications = formData.certifications.filter(c => c.name?.trim() && c.issuer?.trim());
      const validEducation = formData.educationHistory.filter(e => e.institution?.trim());
      const validLanguages = formData.languages.filter(l => l.language?.trim());

      const profileData = {
        headline: formData.headline.trim(),
        bio: formData.bio.trim(),
        photo: formData.photo.trim(),
        location: formData.location,
        willingToTravel: formData.willingToTravel,
        willingToRelocate: formData.willingToRelocate,
        availability: formData.availability,
        university: formData.university.trim(),
        faculty: formData.faculty.trim(),
        researchLine: formData.researchLine.trim(),
        semillero: formData.semillero.trim(),
        skills: skillsArray,
        languages: validLanguages,
        educationHistory: validEducation,
        practices: validPractices,
        certifications: validCertifications,
        socialLinks: formData.socialLinks,
        isPublic: formData.isPublic,
        cvUrl: formData.cvUrl.trim()
      };

      const endpoint = academicApi.updateProfile(user._id);
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        credentials: endpoint.credentials,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Perfil actualizado exitosamente');
        setTimeout(() => {
          navigate(`/academic/profile/${user._id}`);
        }, 1500);
      } else {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

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

  const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";
  const selectCls = `${inputCls} bg-white`;

  const SaveBar = () => (
    <div className="flex gap-3 pt-4 border-t">
      <button type="button" onClick={() => navigate(`/academic/profile/${user._id}`)}
        className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
        Ver perfil
      </button>
      <button type="submit" disabled={saving}
        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold disabled:opacity-50">
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );

  const navItems = [
    { id: 'presentacion',  label: 'Presentación',        icon: FaUserEdit },
    { id: 'ubicacion',     label: 'Ubicación',            icon: FaMapMarkerAlt },
    { id: 'formacion',     label: 'Formación académica',  icon: FaGraduationCap },
    { id: 'experiencia',   label: 'Experiencia',          icon: FaBriefcase },
    { id: 'habilidades',   label: 'Habilidades e idiomas',icon: FaLanguage },
    { id: 'certificaciones', label: 'Certificaciones',    icon: FaAward },
    { id: 'publicaciones', label: 'Publicaciones',        icon: FaNewspaper },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(`/academic/profile/${user._id}`)} className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
            <FaArrowLeft /> Ver mi perfil
          </button>
          <h1 className="text-white font-bold text-lg">Editar Perfil</h1>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">{error}</div>}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm flex items-center gap-2">
            <FaCheckCircle className="text-green-500" /> {success}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-52 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${
                      activeSection === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="shrink-0" /> {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-0">

            {/* ── 1. PRESENTACIÓN ── */}
            {activeSection === 'presentacion' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
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
                    placeholder="Describe tu perfil pedagógico, especialidad, logros y lo que te hace único como docente o egresado..." className={`${inputCls} resize-none`} />
                  <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/800</p>
                </div>

                <div>
                  <label className={labelCls}>Foto de perfil (URL)</label>
                  <input type="url" name="photo" value={formData.photo} onChange={handleChange}
                    placeholder="https://res.cloudinary.com/..." className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Sube tu foto en <a href="/perfil" className="text-blue-600 hover:underline">Mi cuenta</a> y pega aquí la URL.</p>
                </div>

                <div>
                  <label className={labelCls}>Línea de investigación / Énfasis pedagógico</label>
                  <input type="text" name="researchLine" value={formData.researchLine} onChange={handleChange}
                    placeholder="Educación inclusiva, Bilingüismo, Educación rural..." className={inputCls} />
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
                      <label className={labelCls}>Portafolio web</label>
                      <input type="url" value={formData.socialLinks.portfolio} onChange={e => handleSocialLinkChange('portfolio', e.target.value)} placeholder="https://miportafolio.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>CV (PDF en la nube)</label>
                      <input type="url" name="cvUrl" value={formData.cvUrl} onChange={handleChange} placeholder="https://..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Twitter / X</label>
                      <input type="url" value={formData.socialLinks.twitter} onChange={e => handleSocialLinkChange('twitter', e.target.value)} placeholder="https://twitter.com/..." className={inputCls} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t">
                  <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    <span className="font-medium">Perfil público</span> — visible en el marketplace para instituciones
                  </label>
                </div>
                <SaveBar />
              </form>
            )}

            {/* ── 2. UBICACIÓN Y DISPONIBILIDAD ── */}
            {activeSection === 'ubicacion' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
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
                <SaveBar />
              </form>
            )}

            {/* ── 3. FORMACIÓN ACADÉMICA ── */}
            {activeSection === 'formacion' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Formación académica</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Agrega todos tus títulos y estudios.</p>
                  </div>
                  <button type="button" onClick={addEducation} className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                    <FaPlus /> Añadir
                  </button>
                </div>

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
                <SaveBar />
              </form>
            )}

            {/* ── 4. EXPERIENCIA / PRÁCTICAS ── */}
            {activeSection === 'experiencia' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Experiencia y prácticas</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Prácticas pedagógicas, trabajo docente y experiencias relevantes.</p>
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
                <SaveBar />
              </form>
            )}

            {/* ── 5. HABILIDADES E IDIOMAS ── */}
            {activeSection === 'habilidades' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg border-b pb-3">Habilidades e idiomas</h2>

                <div>
                  <label className={labelCls}>Habilidades pedagógicas <span className="text-gray-400 font-normal">(separadas por coma)</span></label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange}
                    placeholder="Didáctica, TIC educativas, Evaluación formativa, Atención a diversidad, Primera infancia..." className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Separa cada habilidad con una coma. Las instituciones buscan por estas palabras.</p>
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
                <SaveBar />
              </form>
            )}

            {/* ── 6. CERTIFICACIONES ── */}
            {activeSection === 'certificaciones' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
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
                <SaveBar />
              </form>
            )}

            {/* ── 7. PUBLICACIONES ── */}
            {activeSection === 'publicaciones' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Mis publicaciones</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Artículos, recursos pedagógicos y aportes a la comunidad.</p>
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
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
