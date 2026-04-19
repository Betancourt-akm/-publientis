import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Context } from '../../../context';
import academicApi from '../services/academicApi';
import Spinner from '../../../components/common/Spinner';
import {
  FaPlus, FaTrash, FaEdit, FaEye, FaArrowLeft,
  FaUserEdit, FaBriefcase, FaAward, FaNewspaper, FaCheckCircle
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
    bio: '',
    photo: '',
    researchLine: '',
    semillero: '',
    university: '',
    faculty: '',
    skills: '',
    isPublic: true,
    cvUrl: '',
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: ''
    },
    practices: [{ company: '', position: '', startDate: '', endDate: '', description: '', current: false }],
    certifications: [{ name: '', issuer: '', date: '', credentialUrl: '', imageUrl: '' }]
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
        const profile = data.data;
        setFormData({
          bio: profile.bio || '',
          photo: profile.photo || '',
          researchLine: profile.researchLine || '',
          semillero: profile.semillero || '',
          university: profile.university || '',
          faculty: profile.faculty || '',
          skills: profile.skills?.join(', ') || '',
          isPublic: profile.isPublic !== false,
          cvUrl: profile.cvUrl || '',
          socialLinks: {
            linkedin: profile.socialLinks?.linkedin || '',
            github: profile.socialLinks?.github || '',
            portfolio: profile.socialLinks?.portfolio || '',
            twitter: profile.socialLinks?.twitter || ''
          },
          practices: profile.practices?.length > 0 ? profile.practices : [{ company: '', position: '', startDate: '', endDate: '', description: '', current: false }],
          certifications: profile.certifications?.length > 0 ? profile.certifications : [{ name: '', issuer: '', date: '', credentialUrl: '', imageUrl: '' }]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);

      const validPractices = formData.practices.filter(
        practice => practice.company.trim() && practice.position.trim()
      );

      const validCertifications = formData.certifications.filter(
        cert => cert.name.trim() && cert.issuer.trim()
      );

      const profileData = {
        bio: formData.bio.trim(),
        photo: formData.photo.trim(),
        researchLine: formData.researchLine.trim(),
        semillero: formData.semillero.trim(),
        university: formData.university.trim(),
        faculty: formData.faculty.trim(),
        skills: skillsArray,
        isPublic: formData.isPublic,
        cvUrl: formData.cvUrl.trim(),
        socialLinks: formData.socialLinks,
        practices: validPractices,
        certifications: validCertifications
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

  const navItems = [
    { id: 'info',         label: 'Información',    icon: FaUserEdit },
    { id: 'practicas',    label: 'Prácticas',       icon: FaBriefcase },
    { id: 'certificaciones', label: 'Certificaciones', icon: FaAward },
    { id: 'publicaciones',label: 'Publicaciones',   icon: FaNewspaper },
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
          <div className="flex-1 min-w-0">

            {/* ── INFORMACIÓN BÁSICA ── */}
            {activeSection === 'info' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg border-b pb-3">Información básica</h2>

                <div>
                  <label className={labelCls}>Biografía</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} maxLength={500} rows={4}
                    placeholder="Cuéntanos sobre tu perfil pedagógico, especialidad y metas..." className={`${inputCls} resize-none`} />
                  <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/500</p>
                </div>

                <div>
                  <label className={labelCls}>Foto de perfil (URL)</label>
                  <input type="url" name="photo" value={formData.photo} onChange={handleChange}
                    placeholder="https://..." className={inputCls} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Universidad</label>
                    <input type="text" name="university" value={formData.university} onChange={handleChange}
                      placeholder="Universidad Nacional" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Facultad</label>
                    <input type="text" name="faculty" value={formData.faculty} onChange={handleChange}
                      placeholder="Ciencias de la Educación" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Habilidades pedagógicas <span className="text-gray-400 font-normal">(separadas por coma)</span></label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange}
                    placeholder="Didáctica, TIC, Evaluación formativa, Primera infancia..." className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Línea de investigación / énfasis</label>
                  <input type="text" name="researchLine" value={formData.researchLine} onChange={handleChange}
                    placeholder="Educación inclusiva, Bilingüismo, etc." className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Semillero de investigación</label>
                  <input type="text" name="semillero" value={formData.semillero} onChange={handleChange}
                    placeholder="Nombre del semillero" className={inputCls} />
                </div>

                <h3 className="font-semibold text-gray-800 pt-2 border-t">Redes y links</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>LinkedIn</label>
                    <input type="url" value={formData.socialLinks.linkedin}
                      onChange={e => handleSocialLinkChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Portafolio web</label>
                    <input type="url" value={formData.socialLinks.portfolio}
                      onChange={e => handleSocialLinkChange('portfolio', e.target.value)}
                      placeholder="https://miportafolio.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>CV (URL PDF)</label>
                    <input type="url" name="cvUrl" value={formData.cvUrl} onChange={handleChange}
                      placeholder="https://..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Twitter / X</label>
                    <input type="url" value={formData.socialLinks.twitter}
                      onChange={e => handleSocialLinkChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/..." className={inputCls} />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t">
                  <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    <span className="font-medium">Perfil público</span> — visible en el marketplace
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button type="button" onClick={() => navigate(`/academic/profile/${user._id}`)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}

            {/* ── PRÁCTICAS ── */}
            {activeSection === 'practicas' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="font-bold text-gray-900 text-lg">Prácticas pedagógicas</h2>
                  <button type="button" onClick={addPractice}
                    className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                    <FaPlus /> Añadir
                  </button>
                </div>

                {formData.practices.map((p, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Práctica #{i + 1}</span>
                      {formData.practices.length > 1 && (
                        <button type="button" onClick={() => removePractice(i)}
                          className="text-red-400 hover:text-red-600 text-sm">
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Institución / Centro</label>
                        <input type="text" value={p.company}
                          onChange={e => handlePracticeChange(i, 'company', e.target.value)}
                          placeholder="Colegio o institución" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Cargo / Rol</label>
                        <input type="text" value={p.position}
                          onChange={e => handlePracticeChange(i, 'position', e.target.value)}
                          placeholder="Practicante docente, tutor, etc." className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Fecha inicio</label>
                        <input type="date" value={p.startDate ? p.startDate.substring(0, 10) : ''}
                          onChange={e => handlePracticeChange(i, 'startDate', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Fecha fin</label>
                        <input type="date" value={p.endDate ? p.endDate.substring(0, 10) : ''}
                          onChange={e => handlePracticeChange(i, 'endDate', e.target.value)}
                          disabled={p.current} className={`${inputCls} disabled:opacity-50`} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={p.current}
                        onChange={e => handlePracticeChange(i, 'current', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded" id={`current-${i}`} />
                      <label htmlFor={`current-${i}`} className="text-sm text-gray-600">Actualmente aquí</label>
                    </div>

                    <div>
                      <label className={labelCls}>Descripción</label>
                      <textarea value={p.description}
                        onChange={e => handlePracticeChange(i, 'description', e.target.value)}
                        rows={2} placeholder="Describe las actividades y logros..." className={`${inputCls} resize-none`} />
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-4 border-t">
                  <button type="button" onClick={() => navigate(`/academic/profile/${user._id}`)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar prácticas'}
                  </button>
                </div>
              </form>
            )}

            {/* ── CERTIFICACIONES ── */}
            {activeSection === 'certificaciones' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="font-bold text-gray-900 text-lg">Certificaciones</h2>
                  <button type="button" onClick={addCertification}
                    className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                    <FaPlus /> Añadir
                  </button>
                </div>

                {formData.certifications.map((c, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Certificación #{i + 1}</span>
                      {formData.certifications.length > 1 && (
                        <button type="button" onClick={() => removeCertification(i)}
                          className="text-red-400 hover:text-red-600 text-sm">
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Nombre del certificado</label>
                        <input type="text" value={c.name}
                          onChange={e => handleCertificationChange(i, 'name', e.target.value)}
                          placeholder="Curso de Didáctica..." className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Institución emisora</label>
                        <input type="text" value={c.issuer}
                          onChange={e => handleCertificationChange(i, 'issuer', e.target.value)}
                          placeholder="MEN, Coursera, Universidad..." className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Fecha</label>
                        <input type="date" value={c.date ? c.date.substring(0, 10) : ''}
                          onChange={e => handleCertificationChange(i, 'date', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>URL de credencial</label>
                        <input type="url" value={c.credentialUrl}
                          onChange={e => handleCertificationChange(i, 'credentialUrl', e.target.value)}
                          placeholder="https://..." className={inputCls} />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-4 border-t">
                  <button type="button" onClick={() => navigate(`/academic/profile/${user._id}`)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar certificaciones'}
                  </button>
                </div>
              </form>
            )}

            {/* ── PUBLICACIONES ── */}
            {activeSection === 'publicaciones' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="font-bold text-gray-900 text-lg">Mis publicaciones</h2>
                  <Link to="/academic/create-publication"
                    className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <FaPlus /> Nueva publicación
                  </Link>
                </div>

                {pubLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : publications.length === 0 ? (
                  <div className="text-center py-12">
                    <FaNewspaper className="text-4xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Aún no has publicado nada en la comunidad.</p>
                    <Link to="/academic/create-publication"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium">
                      <FaPlus /> Crear primera publicación
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {publications.map(pub => (
                      <div key={pub._id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              pub.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              pub.status === 'PENDING'  ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {pub.status === 'APPROVED' ? 'Aprobada' : pub.status === 'PENDING' ? 'Pendiente' : 'Rechazada'}
                            </span>
                            {pub.createdAt && (
                              <span className="text-xs text-gray-400">{new Date(pub.createdAt).toLocaleDateString('es-ES')}</span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 truncate">{pub.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{pub.content}</p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => navigate(`/academic/profile/${user._id}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver perfil"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDeletePublication(pub._id)}
                            disabled={deletingPub === pub._id}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
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
