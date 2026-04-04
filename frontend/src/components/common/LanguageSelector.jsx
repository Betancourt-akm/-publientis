/**
 * Componente Selector de Idioma
 * Permite cambiar entre Español e Inglés
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaCheck } from 'react-icons/fa';

const LanguageSelector = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    {
      code: 'es',
      name: 'Español',
      flag: '🇪🇸',
      country: 'España'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
      country: 'United States'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    
    // Actualizar HTML lang attribute
    document.documentElement.lang = langCode;
    
    // Opcional: Recargar página para actualizar SEO
    // window.location.reload();
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FaGlobe className="text-gray-600" />
        <span className="hidden md:inline text-sm font-medium text-gray-700">
          {currentLanguage.name}
        </span>
        <span className="text-lg">{currentLanguage.flag}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {languages.map((language) => {
            const isActive = language.code === i18n.language;
            
            return (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50' : ''
                }`}
              >
                {/* Flag */}
                <span className="text-2xl">{language.flag}</span>
                
                {/* Language info */}
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {language.name}
                  </p>
                  <p className="text-xs text-gray-500">{language.country}</p>
                </div>
                
                {/* Check icon */}
                {isActive && (
                  <FaCheck className="text-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
