import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchCart,
  addToCartAsync,
  updateCartItemAsync,
  removeFromCartAsync,
  clearCartAsync,
  fetchCartCount,
  setShippingInfo,
  clearError,
} from '../store/cartSlice';

/**
 * Hook personalizado para gestionar el carrito de compras
 * Proporciona todas las funciones necesarias para trabajar con el carrito
 * 
 * @returns {Object} - Estado y funciones del carrito
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const { cart, loading, error, shippingInfo } = useSelector((state) => state.cart);

  // Cargar carrito desde el servidor
  const loadCart = useCallback(() => {
    return dispatch(fetchCart());
  }, [dispatch]);

  // Agregar producto al carrito
  const addToCart = useCallback((productId, quantity = 1) => {
    return dispatch(addToCartAsync({ productId, quantity }));
  }, [dispatch]);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback((productId, quantity) => {
    return dispatch(updateCartItemAsync({ productId, quantity }));
  }, [dispatch]);

  // Eliminar producto del carrito
  const removeItem = useCallback((productId) => {
    return dispatch(removeFromCartAsync(productId));
  }, [dispatch]);

  // Vaciar carrito completamente
  const clearCart = useCallback(() => {
    return dispatch(clearCartAsync());
  }, [dispatch]);

  // Obtener contador de items
  const getCartCount = useCallback(() => {
    return dispatch(fetchCartCount());
  }, [dispatch]);

  // Establecer información de envío
  const updateShippingInfo = useCallback((info) => {
    return dispatch(setShippingInfo(info));
  }, [dispatch]);

  // Limpiar errores
  const clearCartError = useCallback(() => {
    return dispatch(clearError());
  }, [dispatch]);

  // Calcular totales
  const totals = {
    items: cart?.totalItems || 0,
    subtotal: cart?.totalPrice || 0,
    shipping: cart?.totalPrice > 100000 ? 0 : 10000,
    total: (cart?.totalPrice || 0) + (cart?.totalPrice > 100000 ? 0 : 10000),
  };

  return {
    // Estado
    cart,
    loading,
    error,
    shippingInfo,
    totals,
    
    // Funciones
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getCartCount,
    updateShippingInfo,
    clearCartError,
  };
};

export default useCart;
