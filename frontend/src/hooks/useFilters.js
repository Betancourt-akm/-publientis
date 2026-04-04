/**
 * Hook para gestión de filtros con persistencia en URL
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Inicializar filtros desde URL
  const getInitialFilters = () => ({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: parseFloat(searchParams.get('minPrice')) || 0,
    maxPrice: parseFloat(searchParams.get('maxPrice')) || 0,
    minRating: parseFloat(searchParams.get('minRating')) || 0,
    inStock: searchParams.get('inStock') === 'true' ? true : searchParams.get('inStock') === 'false' ? false : null,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    page: parseInt(searchParams.get('page')) || 1
  });

  const [filters, setFilters] = useState(getInitialFilters);

  // Sincronizar filtros con URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('q', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice > 0) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating > 0) params.set('minRating', filters.minRating.toString());
    if (filters.inStock !== null) params.set('inStock', filters.inStock.toString());
    if (filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
    if (filters.page > 1) params.set('page', filters.page.toString());

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Actualizar un filtro específico
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset page cuando cambia otro filtro
    }));
  }, []);

  // Actualizar múltiples filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset page cuando cambian filtros
    }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 0,
      minRating: 0,
      inStock: null,
      sortBy: 'createdAt',
      page: 1
    });
  }, []);

  // Limpiar un filtro específico
  const clearFilter = useCallback((key) => {
    const defaultValues = {
      search: '',
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 0,
      minRating: 0,
      inStock: null,
      sortBy: 'createdAt',
      page: 1
    };

    setFilters(prev => ({
      ...prev,
      [key]: defaultValues[key],
      page: 1
    }));
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      filters.category ||
      filters.brand ||
      filters.minPrice > 0 ||
      filters.maxPrice > 0 ||
      filters.minRating > 0 ||
      filters.inStock !== null
    );
  }, [filters]);

  // Construir query string para API
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    if (filters.search) params.append('q', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.minPrice > 0) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice > 0) params.append('maxPrice', filters.maxPrice);
    if (filters.minRating > 0) params.append('minRating', filters.minRating);
    if (filters.inStock !== null) params.append('inStock', filters.inStock);
    params.append('sortBy', filters.sortBy);
    params.append('page', filters.page);
    params.append('limit', '20');

    return params.toString();
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters: hasActiveFilters(),
    queryString: buildQueryString()
  };
};

export default useFilters;
