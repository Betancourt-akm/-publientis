import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes/index.js'; // Importamos el router que creamos
import { Provider } from 'react-redux';
import { store } from './store/store';
// ✅ ToastContainer ELIMINADO - Sin toasts molestos
import ContextProvider from './context/index.js';
import LocationProvider from './context/LocationContext.js';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ContextProvider>
        <LocationProvider>
          {/* ✅ ToastContainer ELIMINADO - Sin toasts molestos */}
          {/* En lugar de AppRouter, usamos RouterProvider y le pasamos nuestro router */}
          <RouterProvider router={router} />
        </LocationProvider>
      </ContextProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();