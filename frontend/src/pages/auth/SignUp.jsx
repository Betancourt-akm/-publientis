// src/pages/SignUp.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import loginIcons from '../../assest/signin.png';
import imageTobase64 from '../../helpers/imageTobase64';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';
import CascadingSelect from '../../components/hierarchy/CascadingSelect';



const PasswordRequirement = ({ met, label }) => (
  <p className={`flex items-center ${met ? 'text-green-500' : 'text-gray-500'}`}>
    <span className='mr-2'>{met ? '✔' : '❌'}</span>
    {label}
  </p>
);

export default function SignUp() {
  const navigate = useNavigate();
  
  const { search } = useLocation();

  // Obtener el role de la query string o por defecto STUDENT
  const paramRole = new URLSearchParams(search).get('role');
  const validRoles = ['STUDENT', 'FACULTY', 'VISITOR'];
  const initialRole = validRoles.includes(paramRole) ? paramRole : 'STUDENT';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [data, setData] = useState({
    name: "",
    email: "",
    tel: "",
    role: initialRole,
    password: "",
    confirmPassword: "",
    profilePic: "",
  });
  
  // Estado para jerarquía académica (STUDENT y DOCENTE)
  const [academicHierarchy, setAcademicHierarchy] = useState({
    universityId: '',
    facultyId: '',
    programId: ''
  });

  // Si la URL cambia, actualizar role
  useEffect(() => {
    const param = new URLSearchParams(search).get('role');
    if (validRoles.includes(param)) {
      setData(prev => ({ ...prev, role: param }));
    }
  }, [search]);

  // Validar la contraseña en tiempo real
  useEffect(() => {
    const { password } = data;
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    });
  }, [data.password, data]);

  const generateSecurePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specials = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const allChars = upper + lower + numbers + specials;

    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specials[Math.floor(Math.random() * specials.length)];

    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const handleSuggestPassword = () => {
    const newPassword = generateSecurePassword();
    setData(prev => ({
      ...prev,
      password: newPassword,
      confirmPassword: newPassword
    }));
    toast.success('¡Se ha generado una contraseña segura!');
  };

  const handleOnChange = e => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadPic = async e => {
    const file = e.target.files[0];
    if (file) {
      const imagePic = await imageTobase64(file);
      setData(prev => ({ ...prev, profilePic: imagePic }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      name: data.name,
      email: data.email,
      tel: data.tel,
      role: data.role,
      password: data.password,
      profilePic: data.profilePic,
    };

    if (data.password !== data.confirmPassword) {
      return toast.error("Las contraseñas no coinciden.");
    }

    const isPasswordValid = Object.values(passwordValidation).every(Boolean);

    if (!isPasswordValid) {
        return toast.error("La contraseña no cumple con todos los requisitos de seguridad.");
    }

    try {
      console.log('=== INICIO REGISTRO ===');
      console.log('Datos a enviar:', formData);
      
      const response = await axiosInstance.post(SummaryApi.signUP.url, formData);
      
      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      
      // FORZAR NAVEGACIÓN INDEPENDIENTEMENTE DE LA RESPUESTA
      // Si llegamos aquí sin error, el registro fue exitoso
      if (response.status === 200 || response.status === 201) {
        console.log('=== REGISTRO EXITOSO - NAVEGANDO ===');
        
        // Limpiar todos los toasts
        toast.dismiss();
        
        // Navegar inmediatamente
        console.log('Navegando a email-verification...');
        navigate("/email-verification", {
          state: {
            email: data.email,
            name: data.name
          },
          replace: true
        });
        
        console.log('=== NAVEGACIÓN COMPLETADA ===');
        return;
      }
      
      // Si por alguna razón el status no es 200/201, mostrar error
      console.log('Status inesperado:', response.status);
      toast.error('Error inesperado en el registro');
      
    } catch (err) {
      console.log('=== ERROR EN REGISTRO ===');
      console.error('Error completo:', err);
      
      // Si el "error" es realmente un éxito (status 201)
      if (err.response?.status === 201 || err.response?.status === 200) {
        console.log('Error que es realmente éxito, navegando...');
        
        toast.dismiss();
        navigate("/email-verification", {
          state: {
            email: data.email,
            name: data.name
          },
          replace: true
        });
        return;
      }
      
      // Error real
      const errorMessage = err?.response?.data?.message || "Error en el registro. Intenta nuevamente.";
      console.log('Error real:', errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('=== FINALIZANDO REGISTRO ===');
      setLoading(false);
    }
  };

  return (
    <section id="signup" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Únete a Publientis</h1>
          <p className="text-gray-600">Construye tu futuro académico</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <img
                src={data.profilePic || loginIcons}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <label>
                <div className="absolute bottom-0 w-full bg-gray-200 bg-opacity-80 text-center py-1 cursor-pointer text-xs">
                  Subir foto
                </div>
                <input type="file" className="hidden" onChange={handleUploadPic} />
              </label>
            </div>
          </div>

          <form className="pt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Rol */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">¿Cuál es tu rol?</label>
              <select
                name="role"
                value={data.role}
                onChange={handleOnChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="STUDENT">🎓 Estudiante</option>
                <option value="FACULTY">👨‍🏫 Facultad/Profesor</option>
                <option value="VISITOR">👔 Empresa/Reclutador</option>
              </select>
            </div>

            {/* Nombre */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Nombre completo</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleOnChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Juan Pérez"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={handleOnChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
              />
            </div>
            {/* Teléfono */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Celular</label>
              <input
                type="tel"
                name="tel"
                value={data.tel}
                onChange={handleOnChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="3001234567"
              />
            </div>

            {/* Jerarquía Académica para STUDENT y FACULTY */}
            {['STUDENT', 'FACULTY'].includes(data.role) && (
              <div className='mb-6'>
                <CascadingSelect
                  onSelectionComplete={(selection) => {
                    setAcademicHierarchy({
                      universityId: selection.universityId,
                      facultyId: selection.facultyId,
                      programId: selection.programId
                    });
                  }}
                  required={true}
                />
              </div>
            )}

            {/* Contraseña */}
            <div>
              <div className='flex justify-between items-center mb-2'>
              <label className="font-semibold text-gray-700">Contraseña</label>
              <button type='button' onClick={handleSuggestPassword} className='text-xs text-blue-600 hover:underline font-medium'>Sugerir contraseña</button>
            </div>
              <div className="w-full border border-gray-300 rounded-lg flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={data.password}
                  onChange={handleOnChange}
                  required
                  className="w-full px-4 py-3 border-none outline-none flex-grow"
                  placeholder="••••••••"
                />
                <div
                  className="px-3 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {data.password && (
                <div className='mt-2 text-sm'>
                  <PasswordRequirement label='Al menos 8 caracteres' met={passwordValidation.minLength} />
                  <PasswordRequirement label='Una letra mayúscula' met={passwordValidation.hasUpper} />
                  <PasswordRequirement label='Una letra minúscula' met={passwordValidation.hasLower} />
                  <PasswordRequirement label='Un número' met={passwordValidation.hasNumber} />
                  <PasswordRequirement label='Un carácter especial' met={passwordValidation.hasSpecial} />
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Confirmar contraseña</label>
              <div className="w-full border border-gray-300 rounded-lg flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={handleOnChange}
                  required
                  className="w-full px-4 py-3 border-none outline-none flex-grow"
                  placeholder="••••••••"
                />
                <div
                  className="px-3 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {/* Botón */}
            <button disabled={loading} className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-all mt-6'>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
