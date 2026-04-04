import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';

const ResendVerificationEmail = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.post(SummaryApi.resendVerificationEmail.url, { email });
            const data = response.data;

            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Ocurrió un error. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id='resend-verification'>
            <div className='mx-auto container p-4 mt-12'>
                <div className='bg-white p-6 w-full max-w-md mx-auto shadow-lg rounded-md'>
                    <h2 className='text-2xl font-bold mb-4 text-center'>Reenviar Correo de Verificación</h2>
                    <p className='mb-6 text-center text-gray-600'>Si no recibiste el correo de verificación o el enlace expiró, puedes solicitar uno nuevo aquí.</p>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <div className='grid'>
                            <label htmlFor='email' className='mb-1 font-semibold'>Correo electrónico:</label>
                            <div className='bg-slate-100 p-2 rounded-md'>
                                <input
                                    type='email'
                                    id='email'
                                    placeholder='tu.correo@ejemplo.com'
                                    name='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className='w-full h-full outline-none bg-transparent'
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <button 
                            disabled={loading}
                            className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full rounded-md hover:scale-105 transition-all mt-4 disabled:bg-slate-400 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Enviando...' : 'Reenviar Correo'}
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

export default ResendVerificationEmail;
