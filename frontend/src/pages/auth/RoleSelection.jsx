import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaUserGraduate, FaBuilding, FaChalkboardTeacher, FaGoogle } from 'react-icons/fa';
import getBackendUrl from '../../utils/getBackendUrl';

const ROLES = [
  {
    id: 'STUDENT',
    label: 'Egresado / Estudiante',
    description: 'Busco empleo, prácticas profesionales o quiero publicar mi perfil de talento',
    icon: FaUserGraduate,
    accent: 'blue',
  },
  {
    id: 'ORGANIZATION',
    label: 'Empresa / Institución Educativa',
    description: 'Publico vacantes, busco talento universitario o centro de prácticas',
    icon: FaBuilding,
    accent: 'green',
  },
  {
    id: 'FACULTY',
    label: 'Docente / Personal de Facultad',
    description: 'Gestiono seguimiento de egresados, prácticas y matchmaking académico',
    icon: FaChalkboardTeacher,
    accent: 'purple',
  },
];

const accentStyles = {
  blue:   { border: 'border-blue-500 bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   radio: 'border-blue-500 bg-blue-500' },
  green:  { border: 'border-green-500 bg-green-50', icon: 'bg-green-100 text-green-600', radio: 'border-green-500 bg-green-500' },
  purple: { border: 'border-purple-500 bg-purple-50', icon: 'bg-purple-100 text-purple-600', radio: 'border-purple-500 bg-purple-500' },
};

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const provider = searchParams.get('provider') || 'google';

  const handleContinue = () => {
    if (!selectedRole) return;
    const backendUrl = getBackendUrl();
    window.location.href = `${backendUrl}/api/auth/${provider}?role=${selectedRole}`;
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4">
            <FaGoogle className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">¿Cómo usarás Publientis?</h2>
          <p className="text-gray-500 text-sm">Elige tu perfil para personalizar tu experiencia</p>
        </div>

        <div className="space-y-3 mb-8">
          {ROLES.map(({ id, label, description, icon: Icon, accent }) => {
            const s = accentStyles[accent];
            const active = selectedRole === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedRole(id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  active ? s.border : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${
                  active ? s.icon : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="text-xl" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  active ? s.radio : 'border-gray-300'
                }`}>
                  {active && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/login')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`flex-1 py-3 font-semibold rounded-xl transition-colors ${
              selectedRole
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar con Google
          </button>
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;
