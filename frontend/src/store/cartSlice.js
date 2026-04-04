// src/store/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import SummaryApi from '../common';

// ============ ACCIONES ASÍNCRONAS CON BACKEND ============

// Obtener carrito desde el servidor
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(SummaryApi.getCart.url, {
        method: SummaryApi.getCart.method,
        credentials: SummaryApi.getCart.credentials,
      });
      
      // Si es 401, el usuario no está autenticado
      if (response.status === 401) {
        return rejectWithValue('No autenticado. Por favor inicia sesión.');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Agregar producto al carrito
export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await fetch(SummaryApi.addToCart.url, {
        method: SummaryApi.addToCart.method,
        credentials: SummaryApi.addToCart.credentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });
      
      // Si es 401, el usuario no está autenticado
      if (response.status === 401) {
        return rejectWithValue('No autenticado. Por favor inicia sesión.');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Actualizar cantidad de producto
export const updateCartItemAsync = createAsyncThunk(
  'cart/updateItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await fetch(SummaryApi.updateCartItem.url, {
        method: SummaryApi.updateCartItem.method,
        credentials: SummaryApi.updateCartItem.credentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Eliminar producto del carrito
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetch(SummaryApi.removeFromCart(productId).url, {
        method: SummaryApi.removeFromCart(productId).method,
        credentials: SummaryApi.removeFromCart(productId).credentials,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Limpiar carrito
export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(SummaryApi.clearCart.url, {
        method: SummaryApi.clearCart.method,
        credentials: SummaryApi.clearCart.credentials,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener contador de items
export const fetchCartCount = createAsyncThunk(
  'cart/fetchCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(SummaryApi.getCartCount.url, {
        method: SummaryApi.getCartCount.method,
        credentials: SummaryApi.getCartCount.credentials,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data.data.count;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============ SLICE ============

const initialState = {
  cart: null, // Objeto completo del carrito desde backend
  loading: false,
  error: null,
  shippingInfo: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to Cart
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Cart Item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from Cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Clear Cart
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Cart Count
      .addCase(fetchCartCount.fulfilled, (state, action) => {
        if (state.cart) {
          state.cart.totalItems = action.payload;
        }
      });
  },
});

export const { setShippingInfo, clearError } = cartSlice.actions;

export default cartSlice.reducer;
