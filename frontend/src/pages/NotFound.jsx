import { Link } from 'react-router-dom';
import './NotFound.css'; // Import the CSS file
import { FaPaw, FaHome, FaUser, FaHeart } from 'react-icons/fa';
import { useContext } from 'react';
import { Context } from '../context';

const NotFound = () => {
    const { user } = useContext(Context);
    
    return (
        <div className="not-found-container">
            <div className="not-found-box">
                <div className="paw-icon">
                    <FaPaw />
                </div>
                <h1>404</h1>
                <h2>¡Ups! Página no encontrada</h2>
                <p>Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
                
                <div className="not-found-actions">
                    <Link to="/" className="action-button home-button">
                        <FaHome className="button-icon" />
                        Ir al Inicio
                    </Link>
                    
                    {user ? (
                        <Link to="/perfil" className="action-button profile-button">
                            <FaUser className="button-icon" />
                            Mi Perfil
                        </Link>
                    ) : (
                        <Link to="/login" className="action-button login-button">
                            <FaUser className="button-icon" />
                            Iniciar Sesión
                        </Link>
                    )}
                    
                    <Link to="/paseadores" className="action-button walkers-button">
                        <FaHeart className="button-icon" />
                        Ver Paseadores
                    </Link>
                </div>
                
                <div className="support-info">
                    <p>¿Necesitas ayuda? <a href="/contacto">Contáctanos</a></p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
