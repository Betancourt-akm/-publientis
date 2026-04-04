import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { Context } from '../../context';

const VerifyEmailPage = () => {
    // Usamos useParams para obtener el token directamente de la URL. Es más robusto.
    const { token } = useParams(); 
    const navigate = useNavigate();
    const context = useContext(Context);
    const { fetchUserDetails } = context || {};
    
    const [message, setMessage] = useState('Verificando tu correo electrónico...');
    const [error, setError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [autoLogin, setAutoLogin] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setMessage('Token de verificación no encontrado o inválido.');
                setError(true);
                return;
            }

            try {
                console.log('=== INICIANDO VERIFICACIÓN ===');
                console.log('Token:', token);
                console.log('URL de verificación:', `/api/auth/verify/${token}`);
                
                // Hacemos la llamada al endpoint del backend que espera el token como parte de la URL
                // La ruta en el backend es /api/auth/verify/:token
                const response = await axiosInstance.get(`/api/auth/verify/${token}`);
                
                console.log('=== RESPUESTA RECIBIDA ===');
                console.log('Status de respuesta:', response.status);
                console.log('Headers de respuesta:', response.headers);
                console.log('Respuesta completa:', response);
                
                const data = response.data;
                console.log('Datos de respuesta:', data);
                console.log('Tipo de data.success:', typeof data.success);
                console.log('Valor de data.success:', data.success);

                if (data.success === true) {
                    console.log('=== VERIFICACIÓN EXITOSA ===');
                    // Verificación exitosa
                    setMessage(data.message);
                    setError(false);
                    
                    // Si hay auto-login (usuario autenticado automáticamente)
                    if (data.autoLogin && data.user) {
                        console.log('Auto-login detectado, procesando...');
                        setAutoLogin(true);
                        
                        // Guardar token en localStorage para autenticación
                        if (data.token) {
                            localStorage.setItem('token', data.token);
                            console.log('Token de autenticación guardado exitosamente');
                        }
                        
                        // CLAVE: Actualizar el contexto de usuario inmediatamente
                        if (fetchUserDetails && typeof fetchUserDetails === 'function') {
                            try {
                                console.log('Actualizando contexto de usuario...');
                                await fetchUserDetails();
                                console.log('Contexto actualizado exitosamente - Usuario autenticado');
                            } catch (contextError) {
                                console.error('Error actualizando contexto:', contextError);
                                // Continuamos aunque falle el contexto
                            }
                        } else {
                            console.warn('fetchUserDetails no disponible');
                        }
                        
                        console.log('Auto-login completado, usuario autenticado');
                        console.log('Datos del usuario:', data.user);
                        
                        // Mostrar mensaje de éxito
                        toast.success('¡Bienvenido! Tu cuenta ha sido verificada y ya estás autenticado.', {
                            autoClose: 3000
                        });
                        
                        // Redirigir automáticamente después de 2 segundos
                        setTimeout(() => {
                            console.log('Redirigiendo al home...');
                            navigate('/', { replace: true });
                        }, 2000);
                    } else {
                        // Verificación exitosa pero sin auto-login
                        toast.success(data.message);
                    }
                } else {
                    console.log('=== VERIFICACIÓN FALLIDA ===');
                    console.log('data.success no es true:', data.success);
                    console.log('Mensaje del backend:', data.message);
                    
                    // Si el backend responde con éxito pero success no es true
                    toast.error(data.message || 'Ocurrió un error inesperado.');
                    setMessage(data.message || 'Ocurrió un error inesperado.');
                    setError(true);
                }
            } catch (err) {
                console.log('=== ERROR EN PETICIÓN ===');
                console.error('Error completo:', err);
                console.error('Error response:', err.response);
                console.error('Error status:', err.response?.status);
                console.error('Error data:', err.response?.data);
                
                // Verificar si el "error" es realmente un éxito (status 200)
                if (err.response?.status === 200 && err.response?.data?.success === true) {
                    console.log('Error 200 con success=true detectado, procesando como éxito...');
                    const data = err.response.data;
                    
                    setMessage(data.message);
                    setError(false);
                    
                    if (data.autoLogin && data.user) {
                        setAutoLogin(true);
                        
                        if (data.token) {
                            localStorage.setItem('token', data.token);
                            console.log('Token guardado desde catch');
                        }
                        
                        // Actualizar contexto desde catch también
                        if (fetchUserDetails && typeof fetchUserDetails === 'function') {
                            try {
                                console.log('Actualizando contexto desde catch...');
                                await fetchUserDetails();
                                console.log('Contexto actualizado desde catch');
                            } catch (contextError) {
                                console.error('Error actualizando contexto desde catch:', contextError);
                            }
                        }
                        
                        toast.success('¡Bienvenido! Tu cuenta ha sido verificada y ya estás autenticado.', {
                            autoClose: 3000
                        });
                        
                        setTimeout(() => {
                            navigate('/', { replace: true });
                        }, 2000);
                    } else {
                        toast.success(data.message);
                    }
                } else {
                    // Error real
                    const errorMessage = err.response?.data?.message || 'Error al verificar el correo.';
                    console.log('Error real:', errorMessage);
                    toast.error(errorMessage);
                    setMessage(errorMessage);
                    setError(true);
                }
            } finally {
                console.log('=== FINALIZANDO VERIFICACIÓN ===');
                setIsVerifying(false);
            }
        };

        verifyEmail();
    }, [token, fetchUserDetails, navigate]); // El efecto se ejecuta solo cuando el 'token' de la URL cambia.

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
            <div className='bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full'>
                {/* Ícono de estado */}
                <div className="mb-6">
                    {isVerifying ? (
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    ) : (
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Título dinámico */}
                <h2 className={`text-2xl font-bold mb-4 ${
                    isVerifying ? 'text-blue-600' : 
                    error ? 'text-red-600' : 
                    autoLogin ? 'text-green-600' : 'text-green-600'
                }`}>
                    {isVerifying ? 'Verificando...' :
                     error ? 'Error de Verificación' :
                     autoLogin ? '¡Bienvenido!' : 'Verificación Exitosa'}
                </h2>
                
                {/* Mensaje */}
                <p className='text-gray-700 mb-6'>
                    {isVerifying ? 'Verificando tu correo electrónico...' : message}
                </p>

                {/* Estado de auto-login */}
                {autoLogin && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-800 text-sm mb-2">
                            <strong>¡Perfecto!</strong> Tu cuenta ha sido verificada.
                        </p>
                        <p className="text-green-700 text-sm">
                            Redirigiendo automáticamente en unos segundos...
                        </p>
                        <div className="mt-3">
                            <div className="animate-pulse flex items-center justify-center">
                                <div className="rounded-full h-2 w-2 bg-green-400 mr-1"></div>
                                <div className="rounded-full h-2 w-2 bg-green-400 mr-1"></div>
                                <div className="rounded-full h-2 w-2 bg-green-400"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                {!isVerifying && !autoLogin && (
                    <div className="space-y-3">
                        {!error ? (
                            <div>
                                <Link 
                                    to='/login' 
                                    className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block'
                                >
                                    Ir a Iniciar Sesión
                                </Link>
                                <p className="text-xs text-gray-500 mt-2">
                                    O puedes ir directamente al <Link to="/" className="text-blue-600 hover:underline">inicio</Link>
                                </p>
                            </div>
                        ) : (
                            <div>
                                <Link 
                                    to='/sign-up' 
                                    className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block mb-3'
                                >
                                    Intentar Registro Nuevamente
                                </Link>
                                <p className="text-xs text-gray-500">
                                    ¿Problemas? <Link to="/" className="text-blue-600 hover:underline">Contacta soporte</Link>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Botón manual si auto-login falla */}
                {autoLogin && (
                    <div className="mt-4">
                        <Link 
                            to='/'
                            className='text-blue-600 hover:text-blue-800 text-sm underline'
                        >
                            Ir al inicio manualmente
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;