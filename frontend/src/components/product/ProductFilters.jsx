/**
 * Componente de Filtros Avanzados de Productos
 */

import React, { useState, useEffect } from 'react';
import { FaFilter, FaTimes, FaStar } from 'react-icons/fa';
import SummaryApi from '../common';

const ProductFilters = ({ filters, updateFilter, updateFilters, clearFilters, hasActiveFilters }) => {
  const [filterOptions, setFilterOptions] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 0
  });

  // Cargar opciones de filtros
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(`${SummaryApi.backendDomain}/api/search/filters`);
        const data = await response.json();
        
        if (data.success) {
          setFilterOptions(data.filters);
          if (!filters.maxPrice) {
            setPriceRange({
              min: 0,
              max: data.filters.priceRange.max
            });
          }
        }
      } catch (error) {
        console.error('Error cargando filtros:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handlePriceChange = (type, value) => {
    const newValue = parseInt(value) || 0;
    setPriceRange(prev => ({
      ...prev,
      [type]: newValue
    }));
  };

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  };

  const FilterSection = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );

  const FilterContent = () => (
    <>
      {/* Categorías */}
      {filterOptions?.categories && filterOptions.categories.length > 0 && (
        <FilterSection title="Categoría">
          <div className="space-y-2">
            {filterOptions.categories.map(category => (
              <label key={category} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category}
                  onChange={() => updateFilter('category', category)}
                  className="w-4 h-4 text-[#F2B705] focus:ring-[#F2B705]"
                />
                <span className="ml-2 text-gray-700 group-hover:text-[#1F3C88]">
                  {category}
                </span>
                {filterOptions.categoryCount && (
                  <span className="ml-auto text-sm text-gray-500">
                    ({filterOptions.categoryCount.find(c => c.category === category)?.count || 0})
                  </span>
                )}
              </label>
            ))}
            {filters.category && (
              <button
                onClick={() => updateFilter('category', '')}
                className="text-sm text-[#1F3C88] hover:text-[#162D66]"
              >
                Limpiar categoría
              </button>
            )}
          </div>
        </FilterSection>
      )}

      {/* Precio */}
      {filterOptions?.priceRange && (
        <FilterSection title="Rango de Precio">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-600">Mínimo</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder="$0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600">Máximo</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder={`$${filterOptions.priceRange.max.toLocaleString()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full px-4 py-2 bg-[#F2B705] text-white rounded hover:bg-[#d9a305] transition-colors"
            >
              Aplicar Precio
            </button>
            {(filters.minPrice > 0 || filters.maxPrice > 0) && (
              <button
                onClick={() => {
                  setPriceRange({ min: 0, max: filterOptions.priceRange.max });
                  updateFilters({ minPrice: 0, maxPrice: 0 });
                }}
                className="w-full text-sm text-[#1F3C88] hover:text-[#162D66]"
              >
                Limpiar precio
              </button>
            )}
          </div>
        </FilterSection>
      )}

      {/* Marcas */}
      {filterOptions?.brands && filterOptions.brands.length > 0 && (
        <FilterSection title="Marca">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filterOptions.brands.slice(0, 10).map(brand => (
              <label key={brand} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="brand"
                  checked={filters.brand === brand}
                  onChange={() => updateFilter('brand', brand)}
                  className="w-4 h-4 text-[#F2B705] focus:ring-[#F2B705]"
                />
                <span className="ml-2 text-gray-700 group-hover:text-[#1F3C88]">
                  {brand}
                </span>
                {filterOptions.brandCount && (
                  <span className="ml-auto text-sm text-gray-500">
                    ({filterOptions.brandCount.find(b => b.brand === brand)?.count || 0})
                  </span>
                )}
              </label>
            ))}
            {filters.brand && (
              <button
                onClick={() => updateFilter('brand', '')}
                className="text-sm text-[#1F3C88] hover:text-[#162D66]"
              >
                Limpiar marca
              </button>
            )}
          </div>
        </FilterSection>
      )}

      {/* Rating */}
      <FilterSection title="Calificación">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => updateFilter('minRating', rating)}
                className="w-4 h-4 text-[#F2B705] focus:ring-[#F2B705]"
              />
              <span className="ml-2 flex items-center gap-1 group-hover:text-[#1F3C88]">
                {[...Array(rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" size={16} />
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                  <FaStar key={i} className="text-gray-300" size={16} />
                ))}
                <span className="ml-1 text-gray-700">y más</span>
              </span>
            </label>
          ))}
          {filters.minRating > 0 && (
            <button
              onClick={() => updateFilter('minRating', 0)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Limpiar calificación
            </button>
          )}
        </div>
      </FilterSection>

      {/* Disponibilidad */}
      <FilterSection title="Disponibilidad">
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.inStock === true}
              onChange={(e) => updateFilter('inStock', e.target.checked ? true : null)}
              className="w-4 h-4 text-[#F2B705] focus:ring-[#F2B705] rounded"
            />
            <span className="ml-2 text-gray-700 group-hover:text-[#1F3C88]">
              En stock
            </span>
          </label>
        </div>
      </FilterSection>

      {/* Botón limpiar todos */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
        >
          <FaTimes />
          Limpiar todos los filtros
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaFilter />
              Filtros
            </h2>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-[#FFF9E6] text-[#1F3C88] text-xs font-semibold rounded-full">
                Activos
              </span>
            )}
          </div>
          
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="bg-[#F2B705] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#d9a305] transition-colors flex items-center gap-2"
        >
          <FaFilter />
          Filtros
          {hasActiveFilters && (
            <span className="bg-white text-[#F2B705] px-2 py-1 rounded-full text-xs font-bold">
              {Object.values(filters).filter(v => v && v !== 'createdAt' && v !== 1).length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FaFilter />
                  Filtros
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Filters Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <FilterContent />
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full px-4 py-3 bg-[#F2B705] text-white rounded-lg hover:bg-[#d9a305] transition-colors font-semibold"
                >
                  Ver Resultados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilters;
