/**
 * Componente de Ordenamiento de Productos
 */

import React from 'react';
import { FaSortAmountDown } from 'react-icons/fa';

const ProductSort = ({ sortBy, onChange, className = '' }) => {
  const sortOptions = [
    { value: 'createdAt', label: 'Más recientes' },
    { value: 'price-asc', label: 'Precio: Menor a Mayor' },
    { value: 'price-desc', label: 'Precio: Mayor a Menor' },
    { value: 'rating', label: 'Mejor calificados' },
    { value: 'popularity', label: 'Más populares' },
    { value: 'name', label: 'Nombre A-Z' }
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FaSortAmountDown className="text-gray-500" />
      <span className="text-sm text-gray-700 font-medium">Ordenar por:</span>
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductSort;
