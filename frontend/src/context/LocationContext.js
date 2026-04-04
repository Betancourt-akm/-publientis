import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

export const LocationContext = createContext(null);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation debe usarse dentro de LocationProvider');
  }
  return context;
};

const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Ciudades principales de Colombia con costos de envío
  const colombianCities = [
    { id: 'BOG', name: 'Bogotá', department: 'Cundinamarca', shippingCost: 0, shippingDays: '1-2' },
    { id: 'MDE', name: 'Medellín', department: 'Antioquia', shippingCost: 10000, shippingDays: '2-3' },
    { id: 'CLO', name: 'Cali', department: 'Valle del Cauca', shippingCost: 12000, shippingDays: '2-4' },
    { id: 'BAQ', name: 'Barranquilla', department: 'Atlántico', shippingCost: 15000, shippingDays: '3-5' },
    { id: 'CTG', name: 'Cartagena', department: 'Bolívar', shippingCost: 15000, shippingDays: '3-5' },
    { id: 'BUC', name: 'Bucaramanga', department: 'Santander', shippingCost: 12000, shippingDays: '2-4' },
    { id: 'PER', name: 'Pereira', department: 'Risaralda', shippingCost: 11000, shippingDays: '2-3' },
    { id: 'CUC', name: 'Cúcuta', department: 'Norte de Santander', shippingCost: 14000, shippingDays: '3-4' },
    { id: 'IBG', name: 'Ibagué', department: 'Tolima', shippingCost: 10000, shippingDays: '2-3' },
    { id: 'ARM', name: 'Armenia', department: 'Quindío', shippingCost: 11000, shippingDays: '2-3' },
    { id: 'MAN', name: 'Manizales', department: 'Caldas', shippingCost: 11000, shippingDays: '2-3' },
    { id: 'SMR', name: 'Santa Marta', department: 'Magdalena', shippingCost: 15000, shippingDays: '3-5' },
    { id: 'VIL', name: 'Villavicencio', department: 'Meta', shippingCost: 8000, shippingDays: '1-2' },
    { id: 'PAS', name: 'Pasto', department: 'Nariño', shippingCost: 18000, shippingDays: '4-6' },
    { id: 'NEI', name: 'Neiva', department: 'Huila', shippingCost: 13000, shippingDays: '2-4' },
  ];

  // Cargar ubicación guardada al iniciar
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
        console.log('📍 Ubicación cargada desde localStorage:', location);
      } catch (error) {
        console.error('Error al cargar ubicación:', error);
        localStorage.removeItem('userLocation');
      }
    } else {
      // Si no hay ubicación guardada, detectar automáticamente
      detectLocationByIP();
    }
  }, []);

  // Detectar ubicación por IP usando ipapi.co (gratuito, 1000 requests/día)
  const detectLocationByIP = useCallback(async () => {
    setIsDetecting(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data && data.city) {
        // Intentar hacer match con nuestras ciudades
        const matchedCity = colombianCities.find(
          city => city.name.toLowerCase() === data.city.toLowerCase() ||
                  city.department.toLowerCase() === data.region?.toLowerCase()
        );

        const detected = {
          country: data.country_name || 'Colombia',
          countryCode: data.country_code || 'CO',
          city: data.city,
          region: data.region,
          ip: data.ip,
          matchedCity: matchedCity || null
        };

        setDetectedLocation(detected);
        console.log('🌍 Ubicación detectada por IP:', detected);
        
        // Si no hay ubicación guardada, mostrar modal
        if (!userLocation) {
          setIsLocationModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error al detectar ubicación por IP:', error);
    } finally {
      setIsDetecting(false);
    }
  }, [userLocation, colombianCities]);

  // Guardar ubicación del usuario
  const saveUserLocation = useCallback((location) => {
    setUserLocation(location);
    localStorage.setItem('userLocation', JSON.stringify(location));
    setIsLocationModalOpen(false);
    console.log('✅ Ubicación guardada:', location);
  }, []);

  // Limpiar ubicación
  const clearUserLocation = useCallback(() => {
    setUserLocation(null);
    localStorage.removeItem('userLocation');
    console.log('🗑️ Ubicación eliminada');
  }, []);

  // Abrir modal de ubicación
  const openLocationModal = useCallback(() => {
    setIsLocationModalOpen(true);
  }, []);

  // Cerrar modal de ubicación
  const closeLocationModal = useCallback(() => {
    setIsLocationModalOpen(false);
  }, []);

  // Calcular costo de envío según ubicación
  const getShippingInfo = useCallback((purchaseAmount = 0) => {
    if (!userLocation) {
      return {
        cost: 15000,
        days: '3-5',
        isFree: false,
        city: 'Sin definir'
      };
    }

    const cityData = colombianCities.find(c => c.id === userLocation.cityId);
    const baseCost = cityData?.shippingCost || 15000;
    
    // Envío gratis en compras superiores a $100,000
    const isFree = purchaseAmount >= 100000;
    
    return {
      cost: isFree ? 0 : baseCost,
      days: cityData?.shippingDays || '3-5',
      isFree,
      city: userLocation.cityName
    };
  }, [userLocation, colombianCities]);

  const contextValue = {
    userLocation,
    detectedLocation,
    isDetecting,
    colombianCities,
    isLocationModalOpen,
    saveUserLocation,
    clearUserLocation,
    openLocationModal,
    closeLocationModal,
    detectLocationByIP,
    getShippingInfo
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationProvider;
