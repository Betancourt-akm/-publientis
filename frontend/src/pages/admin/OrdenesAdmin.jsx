import React, { useState, useEffect, useContext } from 'react';
import { FaSearch, FaEye, FaTimes, FaBox } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import axiosInstance from '../../utils/axiosInstance';
import { Context } from '../../context';

const OrdenesAdmin = () => {
  const { user } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    // Solo cargar órdenes si el usuario está cargado
    if (user) {
      fetchAllOrders();
    } else {
      console.log('⏳ Esperando a que se cargue el usuario...');
    }
  }, [user]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      console.log('🔍 Intentando cargar órdenes...');
      console.log('👤 Usuario actual:', user);
      console.log('🔑 Rol del usuario:', user?.role);
      console.log('📡 URL:', SummaryApi.getAllOrders.url);
      console.log('🍪 Cookies disponibles:', document.cookie);
      
      // Primero hacer test de autenticación
      console.log('🧪 Probando autenticación admin...');
      const testResponse = await axiosInstance.get(SummaryApi.testAdminAuth.url);
      console.log('🧪 Respuesta test auth:', testResponse.data);
      
      const response = await axiosInstance.get(SummaryApi.getAllOrders.url);
      console.log('✅ Respuesta recibida:', response.data);
      
      if (response.data.success) {
        setOrders(response.data.data);
        console.log('📦 Órdenes cargadas:', response.data.data.length);
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      if (error.response) {
        console.error('❌ Status:', error.response.status);
        console.error('❌ Data:', error.response.data);
        
        if (error.response.status === 401) {
          // ✅ No mostrar toast molesto, el ProtectedRoute ya maneja esto
          console.log('ℹ️ No autenticado, el ProtectedRoute redirigirá');
        } else if (error.response.status === 403) {
          toast.error('No tienes permisos de administrador.');
        } else {
          toast.error(`Error al cargar las órdenes: ${error.response.data.message || error.message}`);
        }
      } else {
        toast.error('Error de conexión al servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.put(
        SummaryApi.updateOrderStatus(orderId).url,
        { orderStatus: newStatus }
      );
      if (response.data.success) {
        toast.success('Estado de orden actualizado');
        fetchAllOrders();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.put(
        SummaryApi.updatePaymentStatus(orderId).url,
        { paymentStatus: newStatus }
      );
      if (response.data.success) {
        toast.success('Estado de pago actualizado');
        fetchAllOrders();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el pago');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Procesando': 'bg-blue-100 text-blue-800',
      'Enviado': 'bg-purple-100 text-purple-800',
      'Entregado': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Pagado': 'bg-green-100 text-green-800',
      'Fallido': 'bg-red-100 text-red-800',
      'Reembolsado': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Verificar permisos de admin
  if (user && user.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
          <p className="text-red-600">No tienes permisos para acceder a esta sección.</p>
          <p className="text-sm text-red-500 mt-2">Rol actual: {user.role}</p>
        </div>
      </div>
    );
  }

  // Mostrar loading si el usuario aún no se ha cargado
  if (!user) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="ml-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  const OrderModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Orden {order.orderNumber}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del cliente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Información del Cliente</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Nombre</p>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600">Teléfono</p>
                <p className="font-medium">{order.shippingAddress.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Dirección</p>
                <p className="font-medium">
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </p>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-semibold mb-3">Productos</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 border rounded-lg p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (19%):</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Estados */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Estado de Orden</label>
              <select
                value={order.orderStatus}
                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Procesando">Procesando</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado de Pago</label>
              <select
                value={order.paymentStatus}
                onChange={(e) => handleUpdatePaymentStatus(order._id, e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
                <option value="Fallido">Fallido</option>
                <option value="Reembolsado">Reembolsado</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Órdenes</h1>
        <p className="text-gray-600">Administra todas las órdenes de la tienda</p>
        <p className="text-sm text-gray-500">Usuario: {user.name} ({user.role})</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Procesando">Procesando</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabla de órdenes */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron órdenes</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Número de Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-teal-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-teal-600 hover:text-teal-800 font-medium flex items-center gap-2"
                      >
                        <FaEye /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default OrdenesAdmin;
