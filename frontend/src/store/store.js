// src/store/store.js

import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import cartReducer from './cartSlice' // Importa el cartReducer

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer, // Añade el cartReducer al store
  },
})

export default store
