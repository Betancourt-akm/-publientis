import { Link } from 'react-router-dom';
import './NotFound.css'; // Import the CSS file
import { FaGraduationCap, FaHome, FaUser, FaBriefcase, FaSearch } from 'react-icons/fa';
import { useContext } from 'react';
import { Context } from '../context';

const NotFound = () => {
    const { user } = useContext(Context);
    
    return (
        <div className="not-found-container">
            <div className="not-found-box">
                <div className="not-found-icon">
                    <FaGraduationCap />
                </div>
                <h1>404</h1>
                <h2>Página no encontrada</h2>
                <p>La página que buscas no existe o fue movida. Explora el Marketplace de Talento o navega por las oportunidades disponibles.</p>
                
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
                    
                    <Link to="/jobs" className="action-button jobs-button">
                        <FaBriefcase className="button-icon" />
                        Ver Oportunidades
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
