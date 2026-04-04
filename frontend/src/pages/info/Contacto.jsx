// src/pages/Contacto.jsx
import React from 'react';
import { FaEnvelope, FaWhatsapp, FaPaw, FaHeart, FaPhone } from 'react-icons/fa';
import FormContact from '../../form/FormContact';

const Contacto = () => {
  const supportNumber = "573001234567";
  
  const handleWhatsApp = () => {
    const message = `¡Hola! Me gustaría obtener más información sobre Sako Pets. 🐾`;
    window.open(`https://wa.me/${supportNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <FaPaw className="mr-3 text-blue-600" />
            Contáctanos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            En Sako Pets estamos comprometidos con el bienestar de tu mascota. 
            ¿Tienes preguntas o necesitas ayuda? ¡Estamos aquí para ti!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Formas de contacto</h2>
              
              <div className="space-y-6">
                {/* WhatsApp */}
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <FaWhatsapp className="text-green-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">WhatsApp</h3>
                      <p className="text-gray-600 mb-3">
                        La forma más rápida de contactarnos. Respuesta inmediata para consultas urgentes.
                      </p>
                      <button
                        onClick={handleWhatsApp}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <FaWhatsapp className="mr-2" />
                        Escribir por WhatsApp
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <FaEnvelope className="text-blue-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                      <p className="text-gray-600 mb-3">
                        Para consultas detalladas o solicitudes específicas.
                      </p>
                      <a
                        href="mailto:contacto@sakopets.com"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        contacto@sakopets.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                      <FaPhone className="text-purple-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Teléfono</h3>
                      <p className="text-gray-600 mb-3">
                        Atención telefónica de lunes a viernes de 8:00 AM a 6:00 PM.
                      </p>
                      <a
                        href="tel:+573001234567"
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        +57 300 123 4567
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaHeart className="mr-2 text-red-500" />
                ¿Por qué elegirnos?
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Paseadores verificados y confiables
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Servicio 100% online y conveniente
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Soporte 24/7 para emergencias
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Precios justos y transparentes
                </li>
              </ul>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Envíanos un mensaje</h2>
            <FormContact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
