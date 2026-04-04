// src/layouts/Hero.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPaw, FaHeart, FaSearch, FaMapMarkerAlt, FaClock, FaShieldAlt } from 'react-icons/fa';
import { FiArrowRight, FiStar, FiUsers, FiCheck } from 'react-icons/fi';

const Hero = () => {
  const [query, setQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (selectedZone) params.append('zone', selectedZone);
    navigate(`/paseadores?${params.toString()}`);
  };

  const zones = [
    'El Poblado', 'Laureles', 'Envigado', 'Sabaneta', 'Itagüí', 
    'Bello', 'La Estrella', 'Caldas', 'Copacabana', 'Girardota'
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background con gradiente y patrón */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F3C88] via-[#2A4FA3] to-[#1F3C88]">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        {/* Patrón de huellas de mascotas */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 text-white text-6xl transform rotate-12">
            <FaPaw />
          </div>
          <div className="absolute top-40 right-32 text-white text-4xl transform -rotate-12">
            <FaPaw />
          </div>
          <div className="absolute bottom-32 left-40 text-white text-5xl transform rotate-45">
            <FaPaw />
          </div>
          <div className="absolute bottom-20 right-20 text-white text-3xl transform -rotate-45">
            <FaPaw />
          </div>
          <div className="absolute top-60 left-1/2 text-white text-4xl transform rotate-90">
            <FaPaw />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Badge de confianza */}
        <div className="inline-flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
          <FiStar className="text-yellow-300 mr-2" />
          <span className="text-sm font-medium">4.9/5 • Más de 2,500 mascotas felices</span>
        </div>

        {/* Título principal */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Encuentra el
          <span className="block bg-gradient-to-r from-[#F2B705] to-[#FFD700] bg-clip-text text-transparent">
            paseador perfecto
          </span>
          para tu mascota
        </h1>

        {/* Subtítulo */}
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
          Conectamos a dueños responsables con paseadores certificados y verificados.
          <span className="block mt-2 font-medium">
            Cuidado profesional, seguro y confiable las 24 horas.
          </span>
        </p>

        {/* Características destacadas */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2">
            <FaShieldAlt className="text-[#F2B705] mr-2" />
            <span className="text-sm font-medium">Paseadores Verificados</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2">
            <FaClock className="text-[#FFD700] mr-2" />
            <span className="text-sm font-medium">Disponible 24/7</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2">
            <FaMapMarkerAlt className="text-[#F2B705] mr-2" />
            <span className="text-sm font-medium">Seguimiento GPS</span>
          </div>
        </div>

        {/* Botones de acción principales */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            to="/sign-up?role=OWNER" 
            className="group bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center justify-center"
          >
            <FaHeart className="mr-3 text-red-500" />
            Soy Dueño de Mascota
            <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/sign-up?role=WALKER" 
            className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
          >
            <FaPaw className="mr-3" />
            Soy Paseador Profesional
            <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Barra de búsqueda avanzada */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <h3 className="text-gray-900 text-lg font-semibold mb-4 flex items-center justify-center">
              <FaSearch className="mr-2 text-[#1F3C88]" />
              Busca paseadores en tu zona
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Campo de búsqueda */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F2B705] focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Buscar por servicio, especialidad o nombre..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              {/* Selector de zona */}
              <div>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F2B705] focus:border-transparent text-gray-900"
                  value={selectedZone}
                  onChange={e => setSelectedZone(e.target.value)}
                >
                  <option value="">Todas las zonas</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Botón de búsqueda */}
            <button 
              onClick={handleSearch}
              className="w-full mt-4 bg-[#F2B705] text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#d9a305] transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              Buscar Paseadores
              <FiArrowRight className="ml-2" />
            </button>
            
            {/* Búsquedas populares */}
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm mb-2">Búsquedas populares:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Paseo diario', 'Cuidado en casa', 'Transporte veterinario', 'Perros grandes', 'Emergencias'].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      const params = new URLSearchParams();
                      params.append('q', term);
                      navigate(`/paseadores?${params.toString()}`);
                    }}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#F2B705] mb-2">2,500+</div>
            <div className="text-sm opacity-80">Mascotas Cuidadas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-2">150+</div>
            <div className="text-sm opacity-80">Paseadores Activos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#F2B705] mb-2">15</div>
            <div className="text-sm opacity-80">Zonas de Cobertura</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-2">4.9★</div>
            <div className="text-sm opacity-80">Calificación Promedio</div>
          </div>
        </div>

        {/* Call to action secundario */}
        <div className="mt-16">
          <p className="text-lg opacity-90 mb-4">
            ¿Eres un amante de las mascotas y quieres generar ingresos extra?
          </p>
          <Link 
            to="/walker/apply" 
            className="inline-flex items-center text-[#F2B705] hover:text-[#FFD700] font-semibold text-lg transition-colors"
          >
            Únete como paseador profesional
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
