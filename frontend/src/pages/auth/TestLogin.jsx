import React, { useState } from 'react';
import { toast } from 'react-toastify';

const TestLogin = () => {
  const [loading, setLoading] = useState(false);

  const loginAsTestWalker = async () => {
    try {
      setLoading(true);
      
      // Simular login con el usuario de prueba
      const testUser = {
        _id: '689562f80562b2f7a2064db',
        name: 'Walker de Prueba',
        email: 'walker.test@sakopets.com',
        role: 'WALKER',
        profilePic: ''
      };
      
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTU2MjNmODA1NjJiMmY3YTIwNjRkYiIsImVtYWlsIjoid2Fsa2VyLnRlc3RAc2Frb3BldHMuY29tIiwicm9sZSI6IldBTEtFUiIsImlhdCI6MTc1NDYyMDQ4MCwiZXhwIjoxNzU1MjI1MjgwfQ.sSdQNma0j4oqpiBLJXwHY91B0OxIt4uSBOLubqIvPdE';
      
      // Guardar en localStorage
      localStorage.setItem('token', testToken);
      localStorage.setItem('user', JSON.stringify(testUser));
      
      toast.success('Login de prueba exitoso');
      
      // Recargar la página para que el contexto se actualice
      window.location.reload();
      
    } catch (error) {
      console.error('Error en login de prueba:', error);
      toast.error('Error en login de prueba');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logout exitoso');
    window.location.reload();
  };

  const currentUser = localStorage.getItem('user');

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🧪 Página de Prueba - Autenticación Walker</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Estado Actual:</h3>
        <p><strong>Token:</strong> {localStorage.getItem('token') ? '✅ Presente' : '❌ Ausente'}</p>
        <p><strong>Usuario:</strong> {currentUser ? '✅ Presente' : '❌ Ausente'}</p>
        {currentUser && (
          <div>
            <p><strong>Datos del usuario:</strong></p>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(JSON.parse(currentUser), null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={loginAsTestWalker}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Cargando...' : '🔑 Login como Walker de Prueba'}
        </button>
        
        <button 
          onClick={logout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚪 Logout
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Enlaces de Prueba:</h3>
        <ul>
          <li><a href="/test-walker-dashboard">🧪 Test Walker Dashboard (Recomendado)</a></li>
          <li><a href="/walker/dashboard">🎯 Walker Dashboard Original</a></li>
          <li><a href="/walker">📋 Walker Routes</a></li>
        </ul>
      </div>
    </div>
  );
};

export default TestLogin;
