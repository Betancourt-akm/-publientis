import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Context } from '../../context';

// Componente para mostrar los requisitos de la contraseña
const PasswordRequirement = ({ met, label }) => (
  <p className={`flex items-center text-sm ${met ? 'text-green-500' : 'text-gray-500'}`}>
    <span className='mr-2'>{met ? '✔' : '❌'}</span>
    {label}
  </p>
);

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { fetchUserDetails, fetchUserAddToCart } = useContext(Context);

    const [data, setData] = useState({
        password: '',
        confirmPassword: ''
    });
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

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    // Validar la contraseña en tiempo real mientras el usuario escribe
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isPasswordValid = Object.values(passwordValidation).every(Boolean);

        if (data.password !== data.confirmPassword) {
            return toast.error('Las contraseñas no coinciden.');
        }
        if (!isPasswordValid) {
            return toast.error('La nueva contraseña no cumple con todos los requisitos de seguridad.');
        }

        setLoading(true);
        
        console.log('=== INICIANDO RESET DE CONTRASEÑA ===');
        console.log('Token:', token);
        
        try {
            const response = await axiosInstance.patch(`/api/auth/reset-password/${token}`, { password: data.password });
            
            console.log('=== RESPUESTA RECIBIDA ===');
            console.log('Status:', response.status);
            console.log('Data:', response.data);
            
            const responseData = response.data;

            if (responseData.success && responseData.token) {
                console.log('=== RESET EXITOSO ===');
                toast.success(responseData.message || 'Contraseña actualizada con éxito.');
                

                
                // Iniciar sesión automáticamente con el nuevo token
                localStorage.setItem('token', responseData.token);
                console.log('Token guardado, actualizando contexto...');
                
                try {
                    const userResponse = await fetchUserDetails();
                    console.log('fetchUserDetails completado');
                    
                    try {
                        await fetchUserAddToCart();
                        console.log('fetchUserAddToCart completado');
                    } catch (cartError) {
                        console.warn('Error con carrito (ignorado):', cartError);
                    }
                    
                    // Navegación basada en el rol del usuario
                    console.log('=== DATOS PARA NAVEGACIÓN ===');
                    console.log('userResponse:', userResponse);
                    console.log('responseData.user:', responseData?.user);
                    
                    const userRole = userResponse?.data?.role || responseData?.user?.role;
                    console.log('Rol del usuario detectado:', userRole);
                    
                    let redirectPath = '/'; // Default: home
                    
                    if (userRole === 'WALKER') {
                        redirectPath = '/walker/dashboard'; // Dashboard de paseador
                        console.log('=== WALKER DETECTADO - Redirigiendo a dashboard ===');
                    } else if (userRole === 'OWNER') {
                        redirectPath = '/'; // Home
                        console.log('=== OWNER DETECTADO - Redirigiendo a home ===');
                    } else {
                        console.log('=== ROL NO DETECTADO - Redirigiendo al home ===');
                    }
                    
                    console.log('Ruta de redirección:', redirectPath);
                    
                    // REDIRECCIÓN A PÁGINA DE ÉXITO
                    console.log('=== REDIRIGIENDO A PÁGINA DE ÉXITO ===');
                    console.log('Rol del usuario:', userRole);
                    console.log('Datos del usuario:', userResponse?.data);
                    
                    // Navegar a la página de éxito con datos del usuario
                    navigate('/password-changed-success', {
                        state: {
                            userRole: userRole,
                            userName: userResponse?.data?.name || responseData?.user?.name || ''
                        },
                        replace: true
                    });
                    
                    console.log('Navegación a página de éxito completada');
                    
                } catch (contextError) {
                    console.warn('Error actualizando contexto (no crítico):', contextError);
                    
                    // Incluso con error, mostrar página de éxito (la contraseña sí se cambió)
                    console.log('Redirigiendo a página de éxito a pesar del error de contexto...');
                    navigate('/password-changed-success', {
                        state: {
                            userRole: responseData?.user?.role || 'OWNER',
                            userName: responseData?.user?.name || ''
                        },
                        replace: true
                    });
                }
            } else {
                console.log('=== RESET FALLIDO ===');
                console.log('Condición fallida - success:', responseData.success, 'token:', !!responseData.token);
                throw new Error(responseData.message || 'No se pudo restablecer la contraseña.');
            }
        } catch (error) {
            console.log('=== ERROR EN RESET ===');
            console.error('Error completo:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || error.message || 'Ocurrió un error al restablecer la contraseña.';
            console.log('Mensaje de error final:', errorMessage);
            toast.error(errorMessage);
        } finally {
            console.log('=== FINALIZANDO RESET ===');
            setLoading(false);
        }
    };

    return (
        <section id='reset-password'>
            <div className='mx-auto container p-4 mt-12'>
                <div className='bg-white p-6 w-full max-w-md mx-auto shadow-lg rounded-md'>
                    <h2 className='text-2xl font-bold mb-4 text-center'>Crea tu Nueva Contraseña</h2>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <div>
                            <label className='mb-1 font-semibold'>Nueva Contraseña:</label>
                            <div className='form-input flex items-center p-0 overflow-hidden'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='••••••••'
                                    name='password'
                                    value={data.password}
                                    onChange={handleOnChange}
                                    required
                                    className='w-full p-2 border-none outline-none flex-grow bg-transparent'
                                    disabled={loading}
                                />
                                <div className='cursor-pointer text-xl text-gray-500 p-2' onClick={() => setShowPassword(prev => !prev)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                            {data.password && (
                                <div className='mt-2'>
                                    <PasswordRequirement label='Al menos 8 caracteres' met={passwordValidation.minLength} />
                                    <PasswordRequirement label='Una letra mayúscula' met={passwordValidation.hasUpper} />
                                    <PasswordRequirement label='Una letra minúscula' met={passwordValidation.hasLower} />
                                    <PasswordRequirement label='Un número' met={passwordValidation.hasNumber} />
                                    <PasswordRequirement label='Un carácter especial' met={passwordValidation.hasSpecial} />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className='mb-1 font-semibold'>Confirmar Nueva Contraseña:</label>
                            <div className='form-input flex items-center p-0 overflow-hidden'>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder='••••••••'
                                    name='confirmPassword'
                                    value={data.confirmPassword}
                                    onChange={handleOnChange}
                                    required
                                    className='w-full p-2 border-none outline-none flex-grow bg-transparent'
                                    disabled={loading}
                                />
                                <div className='cursor-pointer text-xl text-gray-500 p-2' onClick={() => setShowConfirmPassword(prev => !prev)}>
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>
                        <button 
                            disabled={loading}
                            className='btn btn-primary w-full mt-4'
                        >
                            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ResetPassword;