import React, { useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setUserDetails } from '../../store/userSlice';
import SummaryApi from '../../common';
import Context from '../../context';

/**
 * Esta página maneja la redirección después de un inicio de sesión exitoso de OAuth.
 * Captura el token de la URL, lo guarda y actualiza el estado del usuario.
 */
const OAuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { fetchUserAddToCart } = useContext(Context);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        const handleLogin = async (authToken) => {
            // 1. Guardar el token en localStorage para persistir la sesión
            localStorage.setItem('token', authToken);

            // 2. Obtener los detalles del usuario usando el token
            const response = await axiosInstance.get(SummaryApi.current_user.url);
            const data = response.data;

            if (data.success) {
                // 3. Actualizar el estado de Redux con los datos del usuario
                dispatch(setUserDetails(data.data));
                toast.success(data.message || '¡Inicio de sesión exitoso!');
                
                // 4. Actualizar el carrito
                fetchUserAddToCart();

                // 5. Redirigir a la página principal
                navigate('/');
            } else {
                toast.error(dataApi.message || 'No se pudieron obtener los detalles del usuario.');
                navigate('/login');
            }
        };

        if (token) {
            handleLogin(token);
        } else if (error) {
            toast.error('La autenticación falló. Por favor, intenta de nuevo.');
            navigate('/login');
        } else {
            toast.error('No se encontró un token de autenticación.');
            navigate('/login');
        }

    }, [location, navigate, dispatch, fetchUserAddToCart]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Procesando inicio de sesión...</p>
        </div>
    );
};

export default OAuthCallback;
