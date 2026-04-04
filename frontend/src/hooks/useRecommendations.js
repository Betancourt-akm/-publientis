/**
 * Hook para Sistema de Recomendaciones
 */

import { useState, useEffect, useCallback } from 'react';

const useRecommendations = (type, options = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    productId = null,
    userId = null,
    limit = 6,
    autoFetch = true
  } = options;

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let endpoint = '';

      switch (type) {
        case 'also-bought':
          if (!productId) {
            setLoading(false);
            return;
          }
          endpoint = `/api/recommendations/also-bought/${productId}?limit=${limit}`;
          break;
        case 'similar':
          if (!productId) {
            setLoading(false);
            return;
          }
          endpoint = `/api/recommendations/similar/${productId}?limit=${limit}`;
          break;
        case 'personalized':
          endpoint = `/api/recommendations/personalized?limit=${limit}`;
          break;
        case 'recently-viewed':
          endpoint = `/api/recommendations/recently-viewed?limit=${limit}`;
          break;
        case 'trending':
          endpoint = `/api/recommendations/trending?limit=${limit}`;
          break;
        case 'dashboard':
          const params = new URLSearchParams();
          if (productId) params.append('productId', productId);
          endpoint = `/api/recommendations/dashboard?${params}`;
          break;
        default:
          endpoint = `/api/recommendations/trending?limit=${limit}`;
      }

      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        if (type === 'dashboard') {
          setProducts(data.recommendations);
        } else {
          setProducts(data.products || []);
        }
      } else {
        setError(data.message || 'Error al cargar recomendaciones');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Error al cargar recomendaciones');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [type, productId, userId, limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchRecommendations();
    }
  }, [autoFetch, fetchRecommendations]);

  const recordView = async (product) => {
    try {
      await fetch('/api/recommendations/record-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ product })
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const refresh = () => {
    fetchRecommendations();
  };

  return {
    products,
    loading,
    error,
    refresh,
    recordView
  };
};

export default useRecommendations;
