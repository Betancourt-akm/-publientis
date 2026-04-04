import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const VendedoresAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vendorsRes, productsRes] = await Promise.all([
        axiosInstance.get('/api/admin/vendors/pending'),
        axiosInstance.get('/api/admin/vendors/products/pending'),
      ]);

      setVendors(Array.isArray(vendorsRes.data?.data) ? vendorsRes.data.data : []);
      setProducts(Array.isArray(productsRes.data?.data) ? productsRes.data.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData().catch((err) => console.error('Error cargando vendedores:', err));
  }, []);

  const approveVendor = async (vendorId) => {
    await axiosInstance.patch(`/api/admin/vendors/${vendorId}/approve`);
    await fetchData();
  };

  const rejectVendor = async (vendorId) => {
    await axiosInstance.patch(`/api/admin/vendors/${vendorId}/reject`);
    await fetchData();
  };

  const approveProduct = async (productId) => {
    await axiosInstance.patch(`/api/admin/vendors/products/${productId}/approve`);
    await fetchData();
  };

  const rejectProduct = async (productId) => {
    await axiosInstance.patch(`/api/admin/vendors/products/${productId}/reject`);
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Moderación de Vendedores</h1>
        <p className="text-sm text-gray-500">Aprueba vendedores y publica productos pendientes.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Vendedores pendientes</h2>
          </div>
          <div className="p-4">
            {vendors.length === 0 ? (
              <div className="text-sm text-gray-600">No hay vendedores pendientes.</div>
            ) : (
              <div className="space-y-3">
                {vendors.map((v) => (
                  <div key={v._id} className="border rounded p-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{v.name}</div>
                      <div className="text-sm text-gray-600">{v.email}</div>
                      <div className="text-xs text-gray-500">{v.verificationStatus}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => approveVendor(v._id)}
                        className="px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectVendor(v._id)}
                        className="px-3 py-2 border border-gray-300 text-gray-800 rounded hover:bg-gray-50 text-sm"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Productos de vendedores pendientes</h2>
          </div>
          <div className="p-4">
            {products.length === 0 ? (
              <div className="text-sm text-gray-600">No hay productos pendientes.</div>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p._id} className="border rounded p-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-600">{p.brand}</div>
                      <div className="text-xs text-gray-500">Vendedor: {p.vendor?.name || 'N/A'}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => approveProduct(p._id)}
                        className="px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
                      >
                        Publicar
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectProduct(p._id)}
                        className="px-3 py-2 border border-gray-300 text-gray-800 rounded hover:bg-gray-50 text-sm"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendedoresAdmin;
