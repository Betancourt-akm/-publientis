import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        console.log('=== INICIANDO RECUPERACIÓN DE CONTRASEÑA ===');
        console.log('Email:', email);
        
        try {
            const response = await axiosInstance.post(SummaryApi.forgotPassword.url, { email });
            
            console.log('=== RESPUESTA RECIBIDA ===');
            console.log('Status:', response.status);
            console.log('Data:', response.data);
            
            const data = response.data;

            if (data.success) {
                toast.success(data.message);
                console.log('Email de recuperación enviado exitosamente');
            } else {
                toast.error(data.message || 'Error al enviar el email de recuperación');
                console.log('Error en respuesta:', data);
            }
        } catch (error) {
            console.error('Error en forgot password:', error);
            
            // Manejo más específico de errores
            if (error.response) {
                // El servidor respondió con un código de error
                const errorMessage = error.response.data?.message || 'Error del servidor';
                toast.error(errorMessage);
                console.error('Error del servidor:', error.response.status, error.response.data);
            } else if (error.request) {
                // La petición se hizo pero no hubo respuesta
                toast.error('No se pudo conectar con el servidor. Verifique su conexión.');
                console.error('Error de conexión:', error.request);
            } else {
                // Algo más pasó
                toast.error('Error inesperado. Inténtelo de nuevo.');
                console.error('Error:', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id='forgot-password'>
            <div className='mx-auto container p-4 mt-12'>
                <div className='bg-white p-6 w-full max-w-md mx-auto shadow-lg rounded-md'>
                    <h2 className='text-2xl font-bold mb-4 text-center'>¿Olvidaste tu contraseña?</h2>
                    <p className='mb-6 text-center text-gray-600'>No te preocupes. Ingresa tu correo electrónico y te enviaremos un enlace para que puedas crear una nueva.</p>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <div className='grid'>
                            <label htmlFor='email' className='mb-1 font-semibold'>Correo electrónico:</label>
                            <input
                                type='email'
                                id='email'
                                placeholder='tu.correo@ejemplo.com'
                                name='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className='form-input'
                                disabled={loading}
                            />
                        </div>
                        <button 
                            disabled={loading}
                            className='btn btn-primary w-full mt-4'
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>
                    </form>
                    <p className='my-5 text-center'>
                        <Link to={'/login'} className='text-red-600 hover:text-red-700 hover:underline'>
                            Volver al inicio de sesión
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ForgotPassword;
