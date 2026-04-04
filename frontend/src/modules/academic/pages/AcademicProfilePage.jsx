import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import academicApi from '../services/academicApi';
import PublicationCard from '../components/PublicationCard';
import Spinner from '../../../components/common/Spinner';

const AcademicProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    fetchProfile();
    fetchUserPublications();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = academicApi.getProfileByUserId(userId);
      const response = await fetch(endpoint.url, {
        method: endpoint.method
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.message || 'Error al cargar el perfil');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPublications = async () => {
    try {
      const response = await fetch(
        `${academicApi.getPublicationFeed.url}?authorId=${userId}&status=APPROVED`,
        {
          method: 'GET'
        }
      );

      const data = await response.json();

      if (data.success) {
        setPublications(data.data);
      }
    } catch (err) {
      console.error('Error fetching publications:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error || 'Perfil no encontrado'}</p>
          <Link
            to="/academic/feed"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver al Feed
          </Link>
        </div>
      </div>
    );
  }

  const user = profile.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-48"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                {profile.photo || user?.profilePic ? (
                  <img
                    src={profile.photo || user.profilePic}
                    alt={user?.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'Usuario'}</h1>
                <p className="text-gray-600 mt-1">{user?.email}</p>
                
                {profile.university && (
                  <p className="text-gray-700 mt-2">
                    <span className="font-semibold">{profile.university}</span>
                    {profile.faculty && ` - ${profile.faculty}`}
                  </p>
                )}

                {profile.researchLine && (
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      🔬 {profile.researchLine}
                    </span>
                  </div>
                )}

                {profile.semillero && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      🌱 {profile.semillero}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                {profile.socialLinks?.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
                
                {profile.socialLinks?.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="text-sm">GitHub</span>
                  </a>
                )}

                {profile.socialLinks?.portfolio && (
                  <a
                    href={profile.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="text-sm">Portafolio</span>
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <div className="flex space-x-4 border-b">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-3 px-4 font-medium ${
                    activeTab === 'about'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Acerca de
                </button>
                <button
                  onClick={() => setActiveTab('publications')}
                  className={`pb-3 px-4 font-medium ${
                    activeTab === 'publications'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Publicaciones ({publications.length})
                </button>
                {profile.certifications && profile.certifications.length > 0 && (
                  <button
                    onClick={() => setActiveTab('certifications')}
                    className={`pb-3 px-4 font-medium ${
                      activeTab === 'certifications'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Certificaciones
                  </button>
                )}
              </div>

              <div className="mt-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {profile.bio && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Biografía</h3>
                        <p className="text-gray-700">{profile.bio}</p>
                      </div>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Habilidades</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.practices && profile.practices.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Experiencia Práctica</h3>
                        <div className="space-y-4">
                          {profile.practices.map((practice, index) => (
                            <div key={index} className="border-l-4 border-blue-600 pl-4">
                              <h4 className="font-semibold text-gray-900">{practice.position}</h4>
                              <p className="text-gray-600">{practice.company}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(practice.startDate).toLocaleDateString('es-ES')} - 
                                {practice.current ? ' Presente' : new Date(practice.endDate).toLocaleDateString('es-ES')}
                              </p>
                              {practice.description && (
                                <p className="text-gray-700 mt-2">{practice.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'publications' && (
                  <div>
                    {publications.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {publications.map((publication) => (
                          <PublicationCard
                            key={publication._id}
                            publication={publication}
                            showActions={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No hay publicaciones aún</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'certifications' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        {cert.imageUrl && (
                          <img
                            src={cert.imageUrl}
                            alt={cert.name}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        )}
                        <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                        <p className="text-gray-600 text-sm">{cert.issuer}</p>
                        {cert.date && (
                          <p className="text-gray-500 text-sm mt-1">
                            {new Date(cert.date).toLocaleDateString('es-ES')}
                          </p>
                        )}
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                          >
                            Ver credencial →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicProfilePage;
