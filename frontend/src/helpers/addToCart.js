import { toast } from 'react-toastify';
import { addToCartAsync } from '../store/cartSlice';

/**
 * Helper para agregar productos al carrito con Redux
 * Debe usarse con dispatch desde componentes React
 * 
 * Ejemplo de uso:
 * import { useDispatch } from 'react-redux';
 * const dispatch = useDispatch();
 * addToCart(e, productId, dispatch);
 */
const addToCart = async (e, productId, dispatch, quantity = 1) => {
  e?.stopPropagation();
  e?.preventDefault();

  try {
    // Dispatch de la acción asíncrona de Redux
    await dispatch(addToCartAsync({ productId, quantity })).unwrap();
    
    toast.success('Producto agregado al carrito');
    return { success: true };
  } catch (error) {
    toast.error(error || 'Error al agregar al carrito');
    return { success: false, error };
  }
};

export default addToCart;