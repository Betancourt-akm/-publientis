import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUser, FaChalkboardTeacher, FaHome } from 'react-icons/fa';

const PasswordChangedSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);
    
    // Obtener datos del usuario desde el estado de navegación
    const userRole = location.state?.userRole || 'OWNER';
    const userName = location.state?.userName || '';
    
    // Determinar la ruta de redirección según el rol
    const getRedirectPath = () => {
        if (userRole === 'WALKER') {
            return '/walker/dashboard';
        } else if (userRole === 'OWNER') {
            return '/';
        } else {
            return '/';
        }
    };
    
    const redirectPath = getRedirectPath();
    
    // Obtener el nombre de la página de destino
    const getDestinationName = () => {
        if (userRole === 'WALKER') {
            return 'Dashboard de Paseador';
        } else if (userRole === 'OWNER') {
            return 'Página Principal';
        } else {
            return 'Página Principal';
        }
    };
    
    const destinationName = getDestinationName();
    
    // Obtener el icono según el rol
    const getIcon = () => {
        if (userRole === 'TEACHER') {
            return <FaChalkboardTeacher className="text-blue-500 text-2xl" />;
        } else if (userRole === 'STUDENT') {
            return <FaUser className="text-green-500 text-2xl" />;
        } else {
            return <FaHome className="text-gray-500 text-2xl" />;
        }
    };

    // Countdown y redirección automática
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate(redirectPath, { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, redirectPath]);

    // Función para redirección manual
    const handleRedirectNow = () => {
        navigate(redirectPath, { replace: true });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Icono de éxito principal */}
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <FaCheckCircle className="text-green-500 text-4xl" />
                </div>

                {/* Título principal */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    ¡Contraseña Actualizada!
                </h1>

                {/* Mensaje de confirmación */}
                <p className="text-lg text-gray-600 mb-6">
                    Tu contraseña ha sido cambiada exitosamente.
                </p>

                {/* Saludo personalizado si hay nombre */}
                {userName && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 font-medium">
                            ¡Bienvenido de vuelta, {userName}!
                        </p>
                        <p className="text-blue-600 text-sm mt-1">
                            Ya puedes acceder a tu cuenta con tu nueva contraseña.
                        </p>
                    </div>
                )}

                {/* Información de redirección */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center mb-3">
                        {getIcon()}
                        <span className="ml-3 font-semibold text-gray-700">
                            {userRole === 'WALKER' ? 'Paseador' : userRole === 'OWNER' ? 'Dueño de Mascota' : 'Usuario'}
                        </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                        Serás redirigido automáticamente a:
                    </p>
                    
                    <div className="bg-white rounded-md p-3 border-2 border-dashed border-gray-300">
                        <span className="font-medium text-gray-800">
                            {destinationName}
                        </span>
                    </div>
                </div>

                {/* Countdown */}
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                        <span className="text-2xl font-bold text-blue-600">
                            {countdown}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Redirección automática en {countdown} segundo{countdown !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Botón de redirección manual */}
                <button
                    onClick={handleRedirectNow}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors mb-4"
                >
                    Ir Ahora a {destinationName}
                </button>

                {/* Enlaces alternativos */}
                <div className="space-y-2 text-sm">
                    <button
                        onClick={() => navigate('/', { replace: true })}
                        className="block w-full text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Ir al Inicio
                    </button>
                    <button
                        onClick={() => navigate('/perfil', { replace: true })}
                        className="block w-full text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Ver Mi Perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordChangedSuccess;
