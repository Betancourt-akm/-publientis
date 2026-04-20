// src/App.js

import React, { Suspense, useState, useEffect } from 'react';
import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
// ✅ ToastContainer ELIMINADO - Sin toasts molestos
// import FloatingWhatsApp from './layouts/whatsapp/FloatingWhatsApp';
import ChatWidget from './components/chat/ChatWidget';
import GlobalChatManager from './components/chat/GlobalChatManager';
import SessionManager from './components/auth/SessionManager';

function App() {
  const location = useLocation();
  
  // Rutas donde se muestra el footer
  const showFooter = ['/perfil', '/about', '/contacto'].includes(location.pathname) || 
                     location.pathname.startsWith('/academic/profile/') ||
                     location.pathname.startsWith('/admin-panel');
  
  return (
    <>
      {/* Gestor de sesión global */}
      <SessionManager />
      
      {/* ✅ ToastContainer ELIMINADO - Sin toasts molestos en toda la aplicación */}
      
      <Header />
      <main className='min-h-screen pt-16'>
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg font-medium text-gray-600">Cargando...</div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      
      {/* Chat entre amigos - estilo Facebook */}
      <GlobalChatManager />
      
      {/* Chat Flotante con IA */}
      <ChatWidget />
      
      {/* Footer condicional - solo en ciertas páginas como /perfil */}
      {showFooter && <Footer />}
    </>
  );
}

export default App;
