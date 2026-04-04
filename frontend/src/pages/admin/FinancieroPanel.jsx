import React, { useState, useEffect, useCallback } from 'react';
import { FaMoneyBillWave, FaChartLine, FaCalculator, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import axiosInstance from '../../utils/axiosInstance';

const FinancieroPanel = () => {
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    ingresos: 0,
    costos: 0,
    beneficioNeto: 0,
    margenBeneficio: 0,
    gastosOperativos: 0,
    impuestos: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);

  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      const ordersResponse = await axiosInstance.get(SummaryApi.getAllOrders.url);
      
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.data;
        calculateFinancials(orders);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos financieros');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const calculateFinancials = (orders) => {
    const now = new Date();
    const paidOrders = orders.filter(order => order.paymentStatus === 'Pagado');

    const ingresos = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const costos = paidOrders.reduce((sum, order) => sum + (order.subtotal * 0.70), 0);
    const gastosEnvios = paidOrders.reduce((sum, order) => sum + order.shippingCost, 0);
    const gastosOperativos = gastosEnvios + (ingresos * 0.10);
    const impuestos = paidOrders.reduce((sum, order) => sum + order.tax, 0);
    const beneficioNeto = ingresos - costos - gastosOperativos;
    const margenBeneficio = ingresos > 0 ? ((beneficioNeto / ingresos) * 100) : 0;

    setFinancialData({
      ingresos,
      costos,
      beneficioNeto,
      margenBeneficio,
      gastosOperativos,
      impuestos,
    });

    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = paidOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const monthIngresos = monthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const monthCostos = monthOrders.reduce((sum, order) => sum + (order.subtotal * 0.70), 0);
      const monthGastos = monthOrders.reduce((sum, order) => sum + order.shippingCost, 0) + (monthIngresos * 0.10);
      const monthBeneficio = monthIngresos - monthCostos - monthGastos;

      monthlyStats.push({
        mes: monthStart.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
        ingresos: monthIngresos,
        costos: monthCostos,
        gastos: monthGastos,
        beneficio: monthBeneficio,
      });
    }

    setMonthlyData(monthlyStats);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel Financiero</h1>
        <p className="text-gray-600">Análisis de costos, ingresos y beneficios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FaMoneyBillWave className="text-2xl text-green-600" />
            </div>
            <FaArrowUp className="text-green-500 text-xl" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
          <p className="text-3xl font-bold text-gray-800">{formatPrice(financialData.ingresos)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FaCalculator className="text-2xl text-red-600" />
            </div>
            <FaArrowDown className="text-red-500 text-xl" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Costos Totales</p>
          <p className="text-3xl font-bold text-gray-800">{formatPrice(financialData.costos)}</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <FaChartLine className="text-2xl" />
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {financialData.margenBeneficio.toFixed(1)}%
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Beneficio Neto</p>
          <p className="text-3xl font-bold">{formatPrice(financialData.beneficioNeto)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Distribución de Costos</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Costo de Productos</span>
                <span className="text-sm font-bold text-red-600">{formatPrice(financialData.costos)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: `${(financialData.costos / financialData.ingresos * 100)}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{((financialData.costos / financialData.ingresos) * 100).toFixed(1)}% de ingresos</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Gastos Operativos</span>
                <span className="text-sm font-bold text-orange-600">{formatPrice(financialData.gastosOperativos)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${(financialData.gastosOperativos / financialData.ingresos * 100)}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{((financialData.gastosOperativos / financialData.ingresos) * 100).toFixed(1)}% de ingresos</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Beneficio Neto</span>
                <span className="text-sm font-bold text-teal-600">{formatPrice(financialData.beneficioNeto)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-teal-500 h-3 rounded-full" style={{ width: `${financialData.margenBeneficio}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{financialData.margenBeneficio.toFixed(1)}% margen</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Balance General</h2>
          <div className="space-y-4">
            <div className="pb-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-green-600">INGRESOS</span>
                <span className="text-xl font-bold text-green-600">{formatPrice(financialData.ingresos)}</span>
              </div>
              <p className="text-xs text-gray-500">Total de ventas pagadas</p>
            </div>

            <div className="pb-4 border-b">
              <p className="font-medium text-red-600 mb-3">EGRESOS</p>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Costo de productos</span>
                  <span className="font-medium">{formatPrice(financialData.costos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gastos operativos</span>
                  <span className="font-medium">{formatPrice(financialData.gastosOperativos)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t">
                  <span className="text-red-600">Total Egresos</span>
                  <span className="text-red-600">{formatPrice(financialData.costos + financialData.gastosOperativos)}</span>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-teal-800">BENEFICIO NETO</span>
                <span className="text-2xl font-bold text-teal-600">{formatPrice(financialData.beneficioNeto)}</span>
              </div>
              <p className="text-xs text-teal-700 mt-2">Margen: {financialData.margenBeneficio.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Evolución Financiera Mensual</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gastos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Beneficio</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyData.map((data, index) => {
                const margen = data.ingresos > 0 ? ((data.beneficio / data.ingresos) * 100) : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium capitalize">{data.mes}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{formatPrice(data.ingresos)}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">{formatPrice(data.costos)}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">{formatPrice(data.gastos)}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-teal-600">{formatPrice(data.beneficio)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${margen > 0 ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                        {margen.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancieroPanel;
