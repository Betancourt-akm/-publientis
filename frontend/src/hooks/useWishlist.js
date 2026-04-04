import { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { Context } from '../context';

const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(Context);

  // Cargar IDs de productos en wishlist
  const loadWishlistProductIds = useCallback(async () => {
    if (!user?._id) {
      setWishlistProductIds([]);
      setWishlistCount(0);
      return;
    }

    try {
      const response = await fetch(SummaryApi.getWishlistProductIds.url, {
        method: SummaryApi.getWishlistProductIds.method,
        credentials: SummaryApi.getWishlistProductIds.credentials,
      });

      const responseData = await response.json();

      if (responseData.success) {
        setWishlistProductIds(responseData.data.productIds || []);
      }
    } catch (error) {
      console.error('Error al cargar IDs de wishlist:', error);
    }
  }, [user]);

  // Cargar contador de wishlist
  const loadWishlistCount = useCallback(async () => {
    if (!user?._id) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await fetch(SummaryApi.getWishlistCount.url, {
        method: SummaryApi.getWishlistCount.method,
        credentials: SummaryApi.getWishlistCount.credentials,
      });

      const responseData = await response.json();

      if (responseData.success) {
        setWishlistCount(responseData.data.count || 0);
      }
    } catch (error) {
      console.error('Error al cargar contador de wishlist:', error);
    }
  }, [user]);

  // Toggle producto en wishlist
  const toggleWishlist = async (productId, showToast = true) => {
    if (!user?._id) {
      toast.error('Debes iniciar sesión para agregar favoritos');
      return false;
    }

    try {
      setLoading(true);
      
      const response = await fetch(SummaryApi.toggleWishlist.url, {
        method: SummaryApi.toggleWishlist.method,
        credentials: 'include',
        headers: SummaryApi.toggleWishlist.headers,
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();

      if (responseData.success) {
        const { action, inWishlist, count } = responseData.data;
        
        // Actualizar estado local
        if (inWishlist) {
          setWishlistProductIds(prev => [...prev, productId]);
        } else {
          setWishlistProductIds(prev => prev.filter(id => id !== productId));
        }
        
        setWishlistCount(count);

        // Mostrar toast si está habilitado
        if (showToast) {
          if (action === 'added') {
            toast.success('Producto agregado a favoritos');
          } else {
            toast.success('Producto removido de favoritos');
          }
        }

        return inWishlist;
      } else {
        if (showToast) {
          toast.error(responseData.message || 'Error al actualizar favoritos');
        }
        return null;
      }
    } catch (error) {
      console.error('Error al toggle wishlist:', error);
      if (showToast) {
        toast.error('Error al actualizar favoritos');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un producto está en wishlist
  const isInWishlist = (productId) => {
    return wishlistProductIds.includes(productId);
  };

  // Agregar a wishlist
  const addToWishlist = async (productId, showToast = true) => {
    if (isInWishlist(productId)) {
      return true; // Ya está en wishlist
    }
    return await toggleWishlist(productId, showToast);
  };

  // Remover de wishlist
  const removeFromWishlist = async (productId, showToast = true) => {
    if (!isInWishlist(productId)) {
      return false; // No está en wishlist
    }
    const result = await toggleWishlist(productId, showToast);
    return result === false; // true si se removió exitosamente
  };

  // Limpiar wishlist completa
  const clearWishlist = async () => {
    if (!user?._id) {
      return false;
    }

    try {
      const response = await fetch(SummaryApi.clearWishlist.url, {
        method: SummaryApi.clearWishlist.method,
        credentials: SummaryApi.clearWishlist.credentials,
      });

      const responseData = await response.json();

      if (responseData.success) {
        setWishlistProductIds([]);
        setWishlistCount(0);
        setWishlistItems([]);
        toast.success('Favoritos eliminados');
        return true;
      } else {
        toast.error(responseData.message || 'Error al limpiar favoritos');
        return false;
      }
    } catch (error) {
      console.error('Error al limpiar wishlist:', error);
      toast.error('Error al limpiar favoritos');
      return false;
    }
  };

  // Cargar wishlist completa (para página de wishlist)
  const loadWishlist = async (page = 1, limit = 20) => {
    if (!user?._id) {
      setWishlistItems([]);
      return { items: [], total: 0, hasMore: false };
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${SummaryApi.getWishlist.url}?page=${page}&limit=${limit}`, {
        method: SummaryApi.getWishlist.method,
        credentials: SummaryApi.getWishlist.credentials,
      });

      const responseData = await response.json();

      if (responseData.success) {
        const data = responseData.data;
        
        if (page === 1) {
          setWishlistItems(data.items || []);
        } else {
          setWishlistItems(prev => [...prev, ...(data.items || [])]);
        }

        return {
          items: data.items || [],
          total: data.total || 0,
          hasMore: data.hasMore || false,
          page: data.page || 1,
          pages: data.pages || 1
        };
      } else {
        toast.error(responseData.message || 'Error al cargar favoritos');
        return { items: [], total: 0, hasMore: false };
      }
    } catch (error) {
      console.error('Error al cargar wishlist:', error);
      toast.error('Error al cargar favoritos');
      return { items: [], total: 0, hasMore: false };
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales cuando el usuario cambia
  useEffect(() => {
    if (user?._id) {
      loadWishlistProductIds();
      loadWishlistCount();
    } else {
      setWishlistProductIds([]);
      setWishlistCount(0);
      setWishlistItems([]);
    }
  }, [user, loadWishlistProductIds, loadWishlistCount]);

  return {
    // Estado
    wishlistItems,
    wishlistProductIds,
    wishlistCount,
    loading,
    
    // Funciones
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loadWishlist,
    loadWishlistCount,
    loadWishlistProductIds,
  };
};

export default useWishlist;
