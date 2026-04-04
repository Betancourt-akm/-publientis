// src/components/Footer.jsx
import React, { useState } from 'react';
import { FaGraduationCap, FaHeart, FaEnvelope, FaWhatsapp, FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsSubscribing(true);
    try {
      // TODO: Implementar suscripción al newsletter
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('¡Te has suscrito exitosamente! 🐾');
      setEmail('');
    } catch (error) {
      toast.error('Error al suscribirse. Intenta nuevamente.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `¡Hola! Me gustaría obtener más información sobre Publientis. 🎓`;
    window.open(`https://wa.me/573001234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <footer className="bg-[#1a1a1a] text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Información de la empresa */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg mr-3">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <h2 className="text-xl font-bold text-white">Publientis</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Publientis es la red social académica donde estudiantes, facultad y 
              empresas se conectan. Comparte tus logros, descubre oportunidades 
              y construye tu futuro profesional.
            </p>
            
            {/* Redes sociales */}
            <div className="flex space-x-3">
              <button 
                onClick={() => window.open('https://linkedin.com', '_blank')}
                className="bg-[#2a2a2a] p-2.5 rounded-md hover:bg-blue-600 hover:text-white transition-all duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-base" />
              </button>
              <button 
                onClick={() => window.open('https://github.com', '_blank')}
                className="bg-[#2a2a2a] p-2.5 rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200"
                aria-label="GitHub"
              >
                <FaGithub className="text-base" />
              </button>
              <button 
                onClick={() => window.open('https://twitter.com', '_blank')}
                className="bg-[#2a2a2a] p-2.5 rounded-md hover:bg-blue-400 hover:text-white transition-all duration-200"
                aria-label="Twitter"
              >
                <FaTwitter className="text-base" />
              </button>
              <button 
                onClick={handleWhatsApp}
                className="bg-[#2a2a2a] p-2.5 rounded-md hover:bg-green-600 hover:text-white transition-all duration-200"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-base" />
              </button>
            </div>
          </div>
    
          {/* Plataforma */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <FaGraduationCap className="text-blue-500 mr-2 text-sm" />
              Plataforma
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/academic/feed" className="text-gray-400 hover:text-blue-500 transition-colors text-sm">
                  Feed Académico
                </a>
              </li>
              <li>
                <a href="/academic/create-publication" className="text-gray-400 hover:text-blue-500 transition-colors text-sm">
                  Crear Publicación
                </a>
              </li>
              <li>
                <a href="/academic/edit-profile" className="text-gray-400 hover:text-blue-500 transition-colors text-sm">
                  Mi Perfil Académico
                </a>
              </li>
              <li>
                <a href="/academic/dashboard" className="text-gray-400 hover:text-blue-500 transition-colors text-sm">
                  Dashboard Facultad
                </a>
              </li>
            </ul>
          </div>

          {/* Compañía */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <FaHeart className="text-blue-500 mr-2 text-sm" />
              Compañía
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/" className="text-gray-400 hover:text-blue-500 transition-colors text-sm">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/contacto" className="text-gray-400 hover:text-blue-500 transition-colors text-sm">
                  Contacto
                </a>
              </li>
              <li>
                <a href="/politica-privacidad" className="text-gray-400 hover:text-blue-500 transition-colors text-sm">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="/terminos" className="text-gray-400 hover:text-blue-500 transition-colors text-sm">
                  Términos de Servicio
                </a>
              </li>
            </ul>
          </div>
    
          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <FaEnvelope className="text-blue-500 mr-2 text-sm" />
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Recibe novedades, oportunidades y consejos académicos.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-white placeholder-gray-500 text-sm transition-all"
                required
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center text-sm"
              >
                {isSubscribing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Suscribiendo...
                  </>
                ) : (
                  'Suscribirse'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    
      {/* Pie de página */}
      <div className="bg-[#141414] border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-500 text-xs">
              © 2026 Publientis. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-xs">
              <a href="/politica-privacidad" className="text-gray-500 hover:text-blue-500 transition-colors">
                Política de Privacidad
              </a>
              <a href="/terminos" className="text-gray-500 hover:text-blue-500 transition-colors">
                Términos de Servicio
              </a>
              <a href="/cookies" className="text-gray-500 hover:text-blue-500 transition-colors">
                Política de Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
