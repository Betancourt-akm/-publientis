import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Context } from '../../context/index.js';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const { user, fetchUserDetails, fetchUserAddToCart } = useContext(Context);

    // Redirigir si el usuario ya está autenticado
    useEffect(() => {
        if (user?._id) {
            console.log('Usuario ya autenticado, redirigiendo al home...');
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        console.log('=== INICIANDO LOGIN ===');
        console.log('Datos de login:', data);
        
        try {
            const response = await axiosInstance.post('/api/auth/login', data);
            
            console.log('=== RESPUESTA DE LOGIN ===');
            console.log('Status:', response.status);
            console.log('Response completa:', response);
            
            const dataApi = response.data;
            console.log('Datos de respuesta:', dataApi);
            console.log('dataApi.success:', dataApi.success, 'tipo:', typeof dataApi.success);
            console.log('dataApi.token:', dataApi.token ? 'Presente' : 'Ausente');

            if (dataApi.success) {
                console.log('=== LOGIN EXITOSO ===');
                toast.success(dataApi.message || 'Inicio de sesión exitoso');
                
                // ✅ NO guardar token en localStorage - se usa cookie httpOnly
                // El backend ya envió la cookie automáticamente
                
                console.log('Actualizando contexto de usuario...');
                await fetchUserDetails();
                
                console.log('Actualizando carrito...');
                try {
                    await fetchUserAddToCart();
                } catch (cartError) {
                    console.warn('Error actualizando carrito (no crítico):', cartError);
                    // Continuar aunque falle el carrito
                }
                
                // Detener loading ANTES de navegar
                setLoading(false);
                
                // ✅ Verificar si hay una URL guardada para redirigir después del login
                const redirectPath = sessionStorage.getItem('redirectAfterLogin');
                if (redirectPath) {
                    console.log('Redirigiendo a la página anterior:', redirectPath);
                    sessionStorage.removeItem('redirectAfterLogin'); // Limpiar después de usar
                    navigate(redirectPath, { replace: true });
                } else {
                    console.log('Navegando al home...');
                    navigate("/", { replace: true });
                }
                
                // Backup: forzar navegación después de un delay si algo falla
                setTimeout(() => {
                    if (window.location.pathname === '/login') {
                        console.log('Forzando navegación...');
                        window.location.href = redirectPath || '/';
                    }
                }, 2000);
            } else {
                console.log('=== LOGIN FALLIDO ===');
                console.log('Condición fallida - success:', dataApi.success, 'token:', !!dataApi.token);
                // Si la respuesta no es exitosa o no trae token, lanzamos un error
                throw new Error(dataApi.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            console.log('=== ERROR EN LOGIN ===');
            console.error('Error completo:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);
            
            // Un solo lugar para manejar todos los errores (de red o de lógica de negocio)
            const errorMessage = err.response?.data?.message || err.message || 'Credenciales inválidas o error del servidor';
            console.log('Mensaje de error final:', errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar Google OAuth
    const handleGoogleLogin = () => {
        const backendUrl = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8070')
            .replace(/\/+$/, '')
            .replace(/\/api$/, '');
        window.location.href = `${backendUrl}/api/auth/google`;
    };

    // Función para manejar Facebook OAuth
    const handleFacebookLogin = () => {
        const backendUrl = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8070')
            .replace(/\/+$/, '')
            .replace(/\/api$/, '');
        window.location.href = `${backendUrl}/api/auth/facebook`;
    };

    return (
        <section id='login' className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4'>
            <div className='max-w-md w-full'>
                <div className='text-center mb-8'>
                    <div className='inline-flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl mb-4'>
                        <span className='text-white font-bold text-2xl'>P</span>
                    </div>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>Bienvenido a Publientis</h1>
                    <p className='text-gray-600'>Inicia sesión para continuar</p>
                </div>
                <div className='bg-white p-8 rounded-2xl shadow-xl'>
                    <h2 className='text-2xl font-bold mb-6 text-center text-gray-900'>Iniciar Sesión</h2>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                        <div className='grid'>
                            <label>Email:</label>
                            <input 
                                type='email'
                                placeholder='Ingrese su email'
                                name='email'
                                value={data.email}
                                onChange={handleOnChange}
                                className='form-input'
                                required
                            />
                        </div>
                        <div>
                            <label>Contraseña:</label>
                            <input 
                                type='password' 
                                placeholder='Ingrese su contraseña'
                                name='password'
                                value={data.password}
                                onChange={handleOnChange}
                                className='form-input'
                                required
                            />
                            <Link to={'/forgot-password'} className='block w-fit ml-auto hover:underline hover:text-red-600 text-sm mt-1'>
                                ¿Olvidó su contraseña?
                            </Link>
                        </div>
                        <button disabled={loading} className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-all mt-6'>
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                    <div className='my-6'>
                        <div className='relative'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-300'></div>
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-4 bg-white text-gray-500'>o continuar con</span>
                            </div>
                        </div>
                        
                        <div className='mt-6 space-y-3'>
                            <button 
                                onClick={handleGoogleLogin}
                                className='w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2'
                            >
                                <FaGoogle className='text-red-500' />
                                Google
                            </button>

                            <button 
                                onClick={handleFacebookLogin}
                                className='w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2'
                            >
                                <FaFacebook className='text-blue-600' />
                                Facebook
                            </button>
                        </div>
                    </div>
                    <p className='mt-6 text-center text-gray-600'>¿No tienes cuenta? <Link to={"/sign-up"} className='text-blue-600 hover:text-blue-700 font-semibold hover:underline'>Regístrate gratis</Link></p>
                </div>
            </div>
        </section>
    );
}

export default Login;
