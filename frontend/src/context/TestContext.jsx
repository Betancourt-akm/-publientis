import React, { createContext, useState, useEffect } from 'react';

export const TestContext = createContext(null);

const TestContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar usuario desde localStorage
        const loadUserFromStorage = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('token');
                
                console.log('🔄 Cargando usuario desde localStorage...');
                console.log('📦 Usuario almacenado:', storedUser);
                console.log('🔑 Token presente:', token ? 'Sí' : 'No');
                
                if (storedUser && token) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    console.log('✅ Usuario cargado desde localStorage:', userData);
                } else {
                    console.log('⚠️ No hay usuario o token en localStorage');
                    setUser(null);
                }
            } catch (error) {
                console.error('❌ Error cargando usuario desde localStorage:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUserFromStorage();

        // Escuchar cambios en localStorage
        const handleStorageChange = (e) => {
            if (e.key === 'user' || e.key === 'token') {
                console.log('🔄 Cambio detectado en localStorage, recargando usuario...');
                loadUserFromStorage();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        console.log('🚪 Usuario deslogueado');
    };

    const value = {
        user,
        setUser,
        loading,
        logout,
        // Funciones dummy para compatibilidad
        fetchUserDetails: () => {},
        fetchUserAddToCart: () => {}
    };

    return (
        <TestContext.Provider value={value}>
            {children}
        </TestContext.Provider>
    );
};

export default TestContextProvider;
