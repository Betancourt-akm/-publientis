import React, { useState, useEffect, useCallback } from 'react';
import { FaShoppingCart, FaMoneyBillWave, FaUsers, FaBoxOpen, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import axiosInstance from '../../utils/axiosInstance';

const VentasPanel = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalOrdenes: 0,
    ordenesHoy: 0,
    productosVendidos: 0,
    ventasMes: 0,
    ventasMesAnterior: 0,
    promedioOrden: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ventasPorMes, setVentasPorMes] = useState([]);

  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      // Obtener todas las órdenes
      const ordersResponse = await axiosInstance.get(SummaryApi.getAllOrders.url);
      
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.data;
        calculateStats(orders);
        setRecentOrders(orders.slice(0, 5));
      }

      // Obtener productos
      const productsResponse = await fetch(SummaryApi.getAllProducts.url);
      const productsData = await productsResponse.json();
      
      if (productsData.success) {
        const sorted = productsData.data
          .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
          .slice(0, 5);
        setTopProducts(sorted);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos de ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const calculateStats = (orders) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Filtrar órdenes pagadas
    const paidOrders = orders.filter(order => order.paymentStatus === 'Pagado');

    // Total de ventas
    const totalVentas = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Órdenes de hoy
    const ordenesHoy = paidOrders.filter(order => 
      new Date(order.createdAt) >= startOfToday
    ).length;

    // Productos vendidos
    const productosVendidos = paidOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Ventas del mes actual
    const ventasMes = paidOrders
      .filter(order => new Date(order.createdAt) >= startOfMonth)
      .reduce((sum, order) => sum + order.totalPrice, 0);

    // Ventas del mes anterior
    const ventasMesAnterior = paidOrders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
      })
      .reduce((sum, order) => sum + order.totalPrice, 0);

    // Promedio por orden
    const promedioOrden = paidOrders.length > 0 ? totalVentas / paidOrders.length : 0;

    // Ventas por mes (últimos 6 meses)
    const ventasPorMes = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const ventasDelMes = paidOrders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthStart && orderDate <= monthEnd;
        })
        .reduce((sum, order) => sum + order.totalPrice, 0);

      ventasPorMes.push({
        mes: monthStart.toLocaleDateString('es-CO', { month: 'short' }),
        ventas: ventasDelMes,
      });
    }

    setStats({
      totalVentas,
      totalOrdenes: paidOrders.length,
      ordenesHoy,
      productosVendidos,
      ventasMes,
      ventasMesAnterior,
      promedioOrden,
    });

    setVentasPorMes(ventasPorMes);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateGrowth = () => {
    if (stats.ventasMesAnterior === 0) return 0;
    return ((stats.ventasMes - stats.ventasMesAnterior) / stats.ventasMesAnterior * 100).toFixed(1);
  };

  const growth = calculateGrowth();
  const isPositiveGrowth = growth >= 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Ventas</h1>
        <p className="text-gray-600">Métricas y estadísticas de ventas en tiempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Ventas */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FaMoneyBillWave className="text-3xl opacity-80" />
            <div className={`flex items-center gap-1 text-sm ${isPositiveGrowth ? 'bg-white/20' : 'bg-red-500/20'} px-2 py-1 rounded-full`}>
              {isPositiveGrowth ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(growth)}%
            </div>
          </div>
          <p className="text-sm opacity-80 mb-1">Total Ventas</p>
          <p className="text-3xl font-bold">{formatPrice(stats.totalVentas)}</p>
        </div>

        {/* Total Órdenes */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FaShoppingCart className="text-3xl opacity-80" />
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              Hoy: {stats.ordenesHoy}
            </div>
          </div>
          <p className="text-sm opacity-80 mb-1">Total Órdenes</p>
          <p className="text-3xl font-bold">{stats.totalOrdenes}</p>
        </div>

        {/* Productos Vendidos */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FaBoxOpen className="text-3xl opacity-80" />
          </div>
          <p className="text-sm opacity-80 mb-1">Productos Vendidos</p>
          <p className="text-3xl font-bold">{stats.productosVendidos}</p>
        </div>

        {/* Promedio por Orden */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FaUsers className="text-3xl opacity-80" />
          </div>
          <p className="text-sm opacity-80 mb-1">Promedio por Orden</p>
          <p className="text-3xl font-bold">{formatPrice(stats.promedioOrden)}</p>
        </div>
      </div>

      {/* Gráfico de Ventas por Mes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Ventas por Mes (Últimos 6 meses)</h2>
        <div className="space-y-4">
          {ventasPorMes.map((data, index) => {
            const maxVenta = Math.max(...ventasPorMes.map(v => v.ventas));
            const percentage = maxVenta > 0 ? (data.ventas / maxVenta) * 100 : 0;
            
            return (
              <div key={index}>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium capitalize">{data.mes}</span>
                  <span className="font-bold text-teal-600">{formatPrice(data.ventas)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Productos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Productos Más Vendidos</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-full font-bold text-teal-600">
                  #{index + 1}
                </div>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {product.salesCount || 0} vendidos
                  </p>
                </div>
                <p className="font-bold text-teal-600">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Órdenes Recientes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Órdenes Recientes</h2>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-teal-600">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(order.totalPrice)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.paymentStatus === 'Pagado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentasPanel;
