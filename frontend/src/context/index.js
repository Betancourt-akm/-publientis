import React, { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import SummaryApi from '../common';
// ✅ Toast eliminado - Sin notificaciones molestas
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';

export const Context = createContext(null);

const ContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [cartProductCount, setCartProductCount] = useState(0);
    const dispatch = useDispatch();

    // *** INICIO DE LA CORRECCIÓN ***
    // Envolvemos las funciones en useCallback para evitar que se recreen en cada render,
    // lo que causaba el bucle infinito en los componentes que las usan como dependencia.

    const fetchUserDetails = useCallback(async () => {
        try {
            const response = await axiosInstance.get(SummaryApi.userDetails.url);
            const userData = response.data.data;
            setUser(userData);
            // Sincronizar con Redux
            dispatch(setUserDetails(userData));
            console.log('Usuario cargado en Context y Redux:', userData);
        } catch (err) {
            console.error("Error fetching user details:", err);
            setUser(null); // Limpiamos el usuario si hay error o no está autorizado
            dispatch(setUserDetails(null));
        }
    }, [dispatch]);

    const fetchUserAddToCart = useCallback(async () => {
        try {
            const response = await axiosInstance.get(SummaryApi.getCartCount.url);
            setCartProductCount(response.data.data.count || 0);
        } catch (err) {
            console.error("Error fetching cart count:", err);
            setCartProductCount(0); // Reseteamos el contador si hay error
        }
    }, []);

    const logout = useCallback(async (showMessage = true) => {
        console.log('🔓 Iniciando logout...');
        
        try {
            // Intentar cerrar sesión en el backend
            await axiosInstance.get(SummaryApi.logout_user.url).catch(() => {
                // Ignorar errores (ej: token ya expirado)
                console.log('Error al contactar backend, limpiando sesión local');
            });
        } catch (err) {
            console.log('Error en logout, limpiando sesión local');
        } finally {
            // Marcar que estamos cerrando sesión ANTES de limpiar
            sessionStorage.setItem('loggingOut', 'true');
            
            // Limpiar TODA la sesión, incluso si el backend falla
            setUser(null);
            setCartProductCount(0);
            
            // Limpiar localStorage COMPLETAMENTE
            localStorage.clear();
            
            // Sincronizar con Redux
            dispatch(setUserDetails(null));
            
            // ✅ Toast eliminado - Redirección silenciosa
            if (showMessage) {
                console.log('✅ Sesión cerrada correctamente');
            }
            
            console.log('🔓 Sesión limpiada, redirigiendo...');
            
            // Redirigir al login
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
        }
    }, [dispatch]);
    // *** FIN DE LA CORRECCIÓN ***


    // Este useEffect se ejecuta solo una vez al cargar la aplicación
    // ✅ CAMBIO: Ya no verificamos localStorage porque el token está en cookie httpOnly
    // Simplemente intentamos cargar los datos, si falla es porque no está autenticado
    useEffect(() => {
        // ⚠️ NO cargar usuario si acabamos de cerrar sesión o estamos redirigiendo
        const isLoggingOut = sessionStorage.getItem('loggingOut');
        
        if (isLoggingOut) {
            // Limpiar flag después de un momento
            sessionStorage.removeItem('loggingOut');
            console.log('🚫 Sesión cerrada recientemente, no recargar usuario');
            return;
        }
        
        // Intentar cargar usuario automáticamente (la cookie se envía automáticamente)
        fetchUserDetails().catch(() => {
            console.log('ℹ️ Usuario no autenticado (esperado si no hay login)');
        });
        fetchUserAddToCart().catch(() => {
            console.log('ℹ️ Carrito no disponible (esperado sin login)');
        });
    }, [fetchUserDetails, fetchUserAddToCart]);

    const contextValue = {
        user,
        setUser,
        fetchUserDetails,
        cartProductCount,
        fetchUserAddToCart,
        logout
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
};

export default ContextProvider;
