import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaSearch, FaCheckCircle, FaTruck, FaUserCircle } from 'react-icons/fa';
import { useLocation } from '../../context/LocationContext';

const Ubicacion = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const {
    userLocation,
    detectedLocation,
    colombianCities,
    saveUserLocation
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [filteredCities, setFilteredCities] = useState(colombianCities);

  // Verificar autenticación
  useEffect(() => {
    if (!user?._id) {
      // Guardar la URL actual para redirigir después del login
      sessionStorage.setItem('redirectAfterLogin', '/ubicacion');
      navigate('/login');
    }
  }, [user, navigate]);

  // Pre-seleccionar ubicación detectada o guardada
  useEffect(() => {
    if (userLocation) {
      const savedCity = colombianCities.find(c => c.id === userLocation.cityId);
      if (savedCity) {
        setSelectedCity(savedCity);
      }
    } else if (detectedLocation?.matchedCity) {
      setSelectedCity(detectedLocation.matchedCity);
    }
  }, [userLocation, detectedLocation, colombianCities]);

  // Filtrar ciudades según búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCities(colombianCities);
    } else {
      const filtered = colombianCities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchQuery, colombianCities]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  const handleConfirm = () => {
    if (selectedCity) {
      saveUserLocation({
        cityId: selectedCity.id,
        cityName: selectedCity.name,
        department: selectedCity.department,
        shippingCost: selectedCity.shippingCost,
        shippingDays: selectedCity.shippingDays,
        savedAt: new Date().toISOString()
      });
      
      // Redirigir a la página anterior o al home
      const redirectPath = sessionStorage.getItem('redirectAfterLocation') || '/';
      sessionStorage.removeItem('redirectAfterLocation');
      navigate(redirectPath);
    }
  };

  // Si no hay usuario, mostrar loading mientras redirige
  if (!user?._id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F2B705]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header con info del usuario */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#1F3C88] to-[#F2B705] rounded-full flex items-center justify-center">
              <FaUserCircle className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hola, {user.name || 'Usuario'}</h1>
              <p className="text-gray-600">Configura tu ubicación de entrega</p>
            </div>
          </div>

          {detectedLocation && (
            <div className="bg-[#FFF9E6] border border-[#F2B705]/20 rounded-lg p-4">
              <p className="text-sm flex items-center gap-2 text-[#1F3C88]">
                <FaCheckCircle className="text-[#F2B705]" />
                <span>Detectamos que estás en: <strong>{detectedLocation.city}, {detectedLocation.region}</strong></span>
              </p>
            </div>
          )}
        </div>

        {/* Card principal de selección */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header del card */}
          <div className="bg-gradient-to-r from-[#1F3C88] to-[#2A4FA3] p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <FaMapMarkerAlt className="text-3xl text-[#F2B705]" />
              <div>
                <h2 className="text-2xl font-bold">¿Dónde quieres recibir tus pedidos?</h2>
                <p className="text-sm opacity-90 mt-1">
                  Selecciona tu ciudad para calcular costos y tiempos de envío
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b bg-gray-50">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Busca tu ciudad o departamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#F2B705] focus:outline-none text-gray-700 placeholder-gray-400 text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Cities Grid */}
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4 font-medium">
              {filteredCities.length} {filteredCities.length === 1 ? 'ciudad disponible' : 'ciudades disponibles'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className={`text-left p-5 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                    selectedCity?.id === city.id
                      ? 'border-[#F2B705] bg-[#FFF9E6] shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-[#F2B705] hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{city.name}</h3>
                        {selectedCity?.id === city.id && (
                          <FaCheckCircle className="text-[#F2B705] text-xl animate-bounce" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{city.department}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-[#1F3C88] font-semibold">
                          <FaTruck className="text-base" />
                          <span>{city.shippingDays} días</span>
                        </div>
                        <div className="text-gray-700">
                          {city.shippingCost === 0 ? (
                            <span className="text-green-600 font-bold">Envío GRATIS</span>
                          ) : (
                            <span className="font-semibold">${city.shippingCost.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredCities.length === 0 && (
              <div className="text-center py-16">
                <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No encontramos ciudades con ese nombre</p>
                <p className="text-sm text-gray-400 mt-2">Intenta con otra búsqueda</p>
              </div>
            )}
          </div>

          {/* Footer con botones */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedCity}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all text-lg ${
                  selectedCity
                    ? 'bg-[#F2B705] text-white hover:bg-[#d9a305] shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedCity ? `Confirmar: ${selectedCity.name}` : 'Selecciona una ciudad'}
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-[#FFF9E6] rounded-lg">
              <p className="text-sm text-[#1F3C88] text-center font-medium">
                💡 Envío gratis en compras superiores a $100,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ubicacion;
