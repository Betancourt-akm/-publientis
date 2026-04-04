import React, { useState, useContext } from 'react';
import { Context } from '../../context';
import axiosInstance from '../../utils/axiosInstance';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';

const TestAuth = () => {
  const { user } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testOrdersAPI = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      console.log('🧪 TESTING ORDERS API');
      console.log('👤 Usuario:', user);
      console.log('🔑 Rol:', user?.role);
      console.log('📡 URL:', SummaryApi.getAllOrders.url);
      console.log('🍪 Cookies:', document.cookie);
      
      const response = await axiosInstance.get(SummaryApi.getAllOrders.url);
      
      console.log('✅ Respuesta exitosa:', response.data);
      setResult({
        success: true,
        data: response.data,
        status: response.status
      });
      
      toast.success(`Órdenes cargadas: ${response.data.data?.length || 0}`);
      
    } catch (error) {
      console.error('❌ Error en test:', error);
      console.error('❌ Error response:', error.response);
      
      const errorInfo = {
        success: false,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      
      setResult(errorInfo);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUserDetails = async () => {
    try {
      setLoading(true);
      console.log('🧪 TESTING USER DETAILS API');
      
      const response = await axiosInstance.get(SummaryApi.userDetails.url);
      console.log('✅ User details:', response.data);
      
      setResult({
        success: true,
        data: response.data,
        type: 'userDetails'
      });
      
    } catch (error) {
      console.error('❌ Error user details:', error);
      setResult({
        success: false,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        type: 'userDetails'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Test de Autenticación y APIs</h1>
      
      {/* Información del Usuario */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">👤 Usuario Actual</h2>
        {user ? (
          <div>
            <p><strong>Nombre:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.role}</p>
            <p><strong>ID:</strong> {user._id}</p>
          </div>
        ) : (
          <p className="text-red-600">❌ No hay usuario cargado</p>
        )}
      </div>

      {/* Botones de Prueba */}
      <div className="space-y-4 mb-6">
        <button
          onClick={testUserDetails}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-4"
        >
          {loading ? '⏳ Cargando...' : '🔍 Test User Details'}
        </button>
        
        <button
          onClick={testOrdersAPI}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '⏳ Cargando...' : '📦 Test Orders API'}
        </button>
      </div>

      {/* Cookies Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">🍪 Cookies</h2>
        <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
          {document.cookie || 'No hay cookies disponibles'}
        </pre>
      </div>

      {/* Resultado */}
      {result && (
        <div className={`border rounded-lg p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h2 className="text-xl font-semibold mb-2">
            {result.success ? '✅ Resultado Exitoso' : '❌ Error'}
          </h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestAuth;
