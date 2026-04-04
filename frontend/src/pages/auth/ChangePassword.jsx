import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import { useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePassword = () => {
    const [data, setData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({});
    const [loading, setLoading] = useState(false);
    const user = useSelector(state => state.user.user);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const toggleShowPassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (data.newPassword !== data.confirmPassword) {
            toast.error('Las nuevas contraseñas no coinciden.');
            return;
        }
        if (data.newPassword.length < 6) {
            toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        const payload = {
            userId: user?._id,
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword
        };

        try {
            const response = await axiosInstance.post(SummaryApi.changePassword.url, payload);

            const result = response.data;

            if (result.success) {
                toast.success(result.message);
                setData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Ocurrió un error al cambiar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    const passwordFields = [
        { label: 'Contraseña Actual', name: 'currentPassword' },
        { label: 'Nueva Contraseña', name: 'newPassword' },
        { label: 'Confirmar Nueva Contraseña', name: 'confirmPassword' },
    ];

    return (
        <div className='mx-auto container p-4 max-w-lg mt-12'>
            <div className='bg-white p-6 shadow-lg rounded-md'>
                <h2 className='text-2xl font-bold mb-6 text-center'>Cambiar Contraseña</h2>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    {passwordFields.map(field => (
                        <div key={field.name}>
                            <label className='mb-1 font-semibold'>{field.label}:</label>
                            <div className='bg-slate-100 p-2 flex items-center rounded-md'>
                                <input
                                    type={showPasswords[field.name] ? 'text' : 'password'}
                                    name={field.name}
                                    placeholder='••••••••'
                                    value={data[field.name]}
                                    onChange={handleOnChange}
                                    required
                                    className='w-full h-full outline-none bg-transparent'
                                    disabled={loading}
                                />
                                <div className='cursor-pointer text-xl text-gray-500' onClick={() => toggleShowPassword(field.name)}>
                                    {showPasswords[field.name] ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button 
                        type='submit' 
                        disabled={loading}
                        className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full rounded-md hover:scale-105 transition-all mt-4 disabled:bg-slate-400 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
