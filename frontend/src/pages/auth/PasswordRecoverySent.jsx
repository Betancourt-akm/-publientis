import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaRedo, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance';
import SummaryApi from '../../common';

const PasswordRecoverySent = () => {
    const location = useLocation();
    const email = location.state?.email || '';
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleResendEmail = async () => {
        if (!canResend || !email) return;
        
        setLoading(true);
        try {
            const response = await axiosInstance.post(SummaryApi.forgotPassword.url, { email });
            
            if (response.data.success) {
                toast.success('Email de recuperación reenviado exitosamente');
                setCountdown(60);
                setCanResend(false);
            } else {
                toast.error('Error al reenviar el email');
            }
        } catch (error) {
            toast.error('Error al reenviar el email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Icono de éxito */}
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <FaCheckCircle className="text-green-500 text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        ¡Email Enviado!
                    </h1>
                    <p className="text-gray-600">
                        Revisa tu bandeja de entrada
                    </p>
                </div>

                {/* Información del email */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-3">
                        <FaEnvelope className="text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Email enviado a:</span>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                        <span className="font-medium text-gray-800">{email}</span>
                    </div>
                </div>

                {/* Instrucciones */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Pasos a seguir:</h3>
                    <ol className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                            <span>Revisa tu bandeja de entrada (y spam/promociones)</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                            <span>Busca un email de "Recuperación de Contraseña"</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                            <span>Haz clic en el enlace para crear tu nueva contraseña</span>
                        </li>
                    </ol>
                </div>

                {/* Aviso importante */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                        <FaClock className="text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-800">Importante:</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                        El enlace de recuperación expira en <strong>10 minutos</strong>. 
                        Si no lo encuentras, revisa tu carpeta de spam.
                    </p>
                </div>

                {/* Botón de reenvío */}
                <div className="mb-6">
                    {!canResend ? (
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">
                                ¿No recibiste el email?
                            </p>
                            <p className="text-sm text-gray-500">
                                Podrás reenviar en <span className="font-medium text-blue-600">{countdown}s</span>
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleResendEmail}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <FaRedo className="mr-2" />
                                    Reenviar Email
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Enlaces de navegación */}
                <div className="text-center space-y-2">
                    <Link 
                        to="/login" 
                        className="block text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        Volver al inicio de sesión
                    </Link>
                    <Link 
                        to="/" 
                        className="block text-gray-500 hover:text-gray-600 text-sm transition-colors"
                    >
                        Ir al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PasswordRecoverySent;
