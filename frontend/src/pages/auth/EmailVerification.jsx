import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaArrowRight, FaRedo, FaExclamationTriangle } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Obtener datos del state de navegación
    const state = location.state;
    if (state?.email) {
      setEmail(state.email);
      setUserName(state.name || '');
    } else {
      // Si no hay email, redirigir al registro
      navigate('/sign-up');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Cooldown timer para reenvío
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !email) return;

    setResendLoading(true);
    try {
      const response = await axiosInstance.post(SummaryApi.resendVerification?.url || '/api/auth/resend-verification', {
        email: email
      });

      if (response.data.success) {
        toast.success('Nuevo email de verificación enviado. Revisa tu bandeja de entrada.');
        setResendCooldown(60); // 60 segundos de cooldown
      } else {
        toast.error(response.data.message || 'Error al reenviar el email');
      }
    } catch (error) {
      console.error('Error al reenviar email:', error);
      toast.error('Error al reenviar el email de verificación');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* Icono principal */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaEnvelope className="text-green-600 text-3xl" />
          </div>
          <FaCheckCircle className="text-green-500 text-2xl mx-auto" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ¡Casi terminamos!
        </h1>
        
        {userName && (
          <p className="text-lg text-gray-600 mb-4">
            ¡Hola <span className="font-semibold text-indigo-600">{userName}</span>!
          </p>
        )}

        {/* Mensaje principal */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4 text-lg">
            Tu registro fue exitoso. Para completar el proceso y activar tu cuenta, hemos enviado un email de verificación a:
          </p>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-4 border border-indigo-200">
            <p className="font-semibold text-indigo-700 break-all text-lg">
              {email}
            </p>
          </div>
          
          {/* Mensaje importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <FaExclamationTriangle className="text-yellow-600 mr-2" />
              <p className="font-semibold text-yellow-800">Importante:</p>
            </div>
            <p className="text-yellow-700 text-sm">
              Tu cuenta no estará activa hasta que verifiques tu correo electrónico. No podrás iniciar sesión hasta completar este paso.
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 rounded-lg p-5 mb-6">
          <h3 className="font-semibold text-blue-800 mb-3 text-center">Qué hacer ahora:</h3>
          <ol className="text-left text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
              <span>Abre tu cliente de correo electrónico o aplicación de email</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
              <span>Busca un email de <strong>MachTAI</strong> con el asunto "Verificación de cuenta"</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
              <span>Haz clic en el botón <strong>"Verificar mi cuenta"</strong> del email</span>
            </li>
            <li className="flex items-start">
              <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">✓</span>
              <span><strong>¡Listo!</strong> Tu cuenta estará activada y podrás iniciar sesión</span>
            </li>
          </ol>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {/* Botón reenviar */}
          <button
            onClick={handleResendEmail}
            disabled={resendLoading || resendCooldown > 0}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              resendCooldown > 0 || resendLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            <FaRedo className={`${resendLoading ? 'animate-spin' : ''}`} />
            {resendCooldown > 0 
              ? `Reenviar en ${resendCooldown}s` 
              : resendLoading 
                ? 'Reenviando...' 
                : 'Reenviar Email'
            }
          </button>

          {/* Botón ir al login */}
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Ir al Login
            <FaArrowRight />
          </Link>
        </div>

        {/* Nota adicional */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              <strong>¿No encuentras el email?</strong>
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Revisa tu carpeta de <strong>spam</strong> o <strong>correo no deseado</strong></p>
              <p>• Puede tardar unos minutos en llegar</p>
              <p>• Verifica que escribiste bien tu email</p>
              <p>• Si no llega, usa el botón "Reenviar Email"</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailVerification;
