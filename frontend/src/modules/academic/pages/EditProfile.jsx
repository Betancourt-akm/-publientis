import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../context';
import academicApi from '../services/academicApi';
import Spinner from '../../../components/common/Spinner';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    }
  }, [user]);

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
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Editar Perfil Académico
            </h1>
            <p className="text-gray-600">
              Mantén tu perfil actualizado para destacar tus logros y habilidades
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Información Básica
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Biografía
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength={500}
                    rows={4}
                    placeholder="Cuéntanos sobre ti, tus intereses académicos y profesionales..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/500 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Foto de Perfil (URL)
                  </label>
                  <input
                    type="url"
                    name="photo"
                    value={formData.photo}
                    onChange={handleChange}
                    placeholder="https://cloudinary.com/tu-foto.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Universidad
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="Universidad Nacional"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Facultad
                    </label>
                    <input
                      type="text"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      placeholder="Ingeniería"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Línea de Investigación
                  </label>
                  <input
                    type="text"
                    name="researchLine"
                    value={formData.researchLine}
                    onChange={handleChange}
                    placeholder="Inteligencia Artificial, IoT, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Semillero de Investigación
                  </label>
                  <input
                    type="text"
                    name="semillero"
                    value={formData.semillero}
                    onChange={handleChange}
                    placeholder="Nombre del semillero"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Habilidades
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Python, React, Machine Learning (separadas por comas)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separa las habilidades con comas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CV (URL)
                  </label>
                  <input
                    type="url"
                    name="cvUrl"
                    value={formData.cvUrl}
                    onChange={handleChange}
                    placeholder="https://cloudinary.com/cv.pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Redes Sociales */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Redes Sociales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/tu-perfil"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.github}
                    onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                    placeholder="https://github.com/tu-usuario"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Portafolio
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.portfolio}
                    onChange={(e) => handleSocialLinkChange('portfolio', e.target.value)}
                    placeholder="https://tu-portafolio.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/tu-usuario"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Visibilidad */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Privacidad
              </h2>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="ml-3 text-sm text-gray-700">
                  <span className="font-semibold">Perfil público</span>
                  <p className="text-gray-500">
                    Permite que visitantes y empleadores vean tu perfil sin necesidad de iniciar sesión
                  </p>
                </label>
              </div>
            </section>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(`/academic/profile/${user._id}`)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
