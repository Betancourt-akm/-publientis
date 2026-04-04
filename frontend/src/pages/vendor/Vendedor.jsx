import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Context } from '../../context';
import uploadImage from '../../helpers/uploadImage';

const Vendedor = () => {
  const { user } = useContext(Context);

  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [vendorNotFound, setVendorNotFound] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    name: '',
    paymentAccount: '',
  });

  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const [salesLoading, setSalesLoading] = useState(false);
  const [salesSummary, setSalesSummary] = useState(null);
  const [salesItems, setSalesItems] = useState([]);

  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Máquinas de Afeitar',
    brand: '',
    images: [],
    stock: 0,
    featuresText: '',
  });

  const categories = useMemo(
    () => [
      'Máquinas de Afeitar',
      'Recortadoras de Barba',
      'Productos para el Afeitado',
      'Cuidado Facial',
      'Accesorios',
      'Sets y Kits',
    ],
    []
  );

  const fetchVendor = async () => {
    if (!user?._id) return;

    setVendorLoading(true);
    try {
      const res = await axiosInstance.get('/api/vendors/me');
      setVendor(res.data?.data || null);
      setVendorNotFound(false);
    } catch (err) {
      if (err?.response?.status === 404) {
        setVendor(null);
        setVendorNotFound(true);
        return;
      }
      throw err;
    } finally {
      setVendorLoading(false);
    }
  };

  const fetchMySales = async () => {
    if (!user?._id) return;
    if (!vendor?._id) return;

    setSalesLoading(true);
    try {
      const [summaryRes, itemsRes] = await Promise.all([
        axiosInstance.get('/api/vendors/sales', { params: { paymentStatus: 'Pagado' } }),
        axiosInstance.get('/api/vendors/sales/items', { params: { paymentStatus: 'Pagado' } }),
      ]);

      setSalesSummary(summaryRes.data?.data || null);
      setSalesItems(Array.isArray(itemsRes.data?.data) ? itemsRes.data.data : []);
    } catch (err) {
      console.error('Error cargando ventas del vendedor:', err);
      setSalesSummary(null);
      setSalesItems([]);
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    if (!user?._id) return;
    if (!vendor?._id) return;

    setProductsLoading(true);
    try {
      const res = await axiosInstance.get('/api/vendors/products');
      setProducts(Array.isArray(res.data?.data) ? res.data.data : []);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor().catch((err) => console.error('Error cargando vendor:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    fetchMyProducts().catch((err) => console.error('Error cargando productos del vendor:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?._id]);

  useEffect(() => {
    fetchMySales().catch((err) => console.error('Error cargando ventas del vendor:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?._id]);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.name.trim()) return;

    setLoading(true);
    try {
      await axiosInstance.post('/api/vendors/register', {
        name: registerForm.name.trim(),
        paymentAccount: registerForm.paymentAccount.trim() || null,
      });
      await fetchVendor();
    } catch (err) {
      console.error('Error registrando vendedor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await uploadImage(file, 'vendors/products');
      setProductForm((prev) => ({ ...prev, images: [...prev.images, result.url] }));
      e.target.value = '';
    } catch (err) {
      console.error('Error subiendo imagen:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeProductImage = (index) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const submitCreateProduct = async (e) => {
    e.preventDefault();
    if (!vendor?._id) return;

    setLoading(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        category: productForm.category,
        brand: productForm.brand.trim(),
        images: productForm.images,
        stock: Number(productForm.stock),
        features: productForm.featuresText
          ? productForm.featuresText
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
          : [],
      };

      await axiosInstance.post('/api/vendors/products', payload);
      setCreateProductOpen(false);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: 'Máquinas de Afeitar',
        brand: '',
        images: [],
        stock: 0,
        featuresText: '',
      });
      await fetchMyProducts();
    } catch (err) {
      console.error('Error creando producto:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user?._id) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Vendedor</h1>
        <p className="mt-3 text-gray-600">
          Inicia sesión para crear tu perfil de vendedor y subir productos.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 bg-[#F2B705] text-white rounded-md hover:bg-[#d9a305] font-semibold transition-colors shadow-sm text-sm"
          >
            Ingresar
          </Link>
          <Link
            to="/sign-up"
            className="px-5 py-2 border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50 font-semibold transition-colors shadow-sm text-sm"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Vendedor</h1>
          <p className="mt-2 text-gray-600">
            Aquí subes productos y gestionas tu catálogo.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {vendorLoading ? (
          <div className="text-gray-600">Cargando...</div>
        ) : vendor ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-sm text-gray-500">Vendedor</div>
                <div className="text-lg font-semibold text-gray-900">{vendor.name}</div>
                <div className="text-sm text-gray-600">Estado: {vendor.verificationStatus}</div>
              </div>
              <button
                type="button"
                onClick={() => setCreateProductOpen(true)}
                className="px-5 py-2 bg-[#F2B705] text-white rounded-md hover:bg-[#d9a305] font-semibold transition-colors shadow-sm text-sm"
              >
                Subir producto
              </button>
            </div>

            {createProductOpen && (
              <div className="mt-6 border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900">Nuevo producto</h2>

                <form className="mt-4 grid gap-4" onSubmit={submitCreateProduct}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input
                        name="name"
                        value={productForm.name}
                        onChange={handleProductChange}
                        className="mt-1 w-full p-2 bg-slate-100 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marca</label>
                      <input
                        name="brand"
                        value={productForm.brand}
                        onChange={handleProductChange}
                        className="mt-1 w-full p-2 bg-slate-100 border rounded"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductChange}
                      className="mt-1 w-full p-2 bg-slate-100 border rounded min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio</label>
                      <input
                        name="price"
                        type="number"
                        value={productForm.price}
                        onChange={handleProductChange}
                        className="mt-1 w-full p-2 bg-slate-100 border rounded"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock</label>
                      <input
                        name="stock"
                        type="number"
                        value={productForm.stock}
                        onChange={handleProductChange}
                        className="mt-1 w-full p-2 bg-slate-100 border rounded"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Categoría</label>
                      <select
                        name="category"
                        value={productForm.category}
                        onChange={handleProductChange}
                        className="mt-1 w-full p-2 bg-slate-100 border rounded"
                        required
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Imágenes</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="mt-1"
                    />

                    {productForm.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {productForm.images.map((url, idx) => (
                          <div key={url} className="relative border rounded overflow-hidden">
                            <img src={url} alt="product" className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => removeProductImage(idx)}
                              className="absolute top-2 right-2 bg-white/90 border border-gray-200 rounded px-2 py-1 text-xs"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Características (una por línea)</label>
                    <textarea
                      name="featuresText"
                      value={productForm.featuresText}
                      onChange={handleProductChange}
                      className="mt-1 w-full p-2 bg-slate-100 border rounded min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-[#F2B705] text-white rounded-md hover:bg-[#d9a305] font-semibold transition-colors shadow-sm text-sm disabled:opacity-60"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateProductOpen(false)}
                      className="px-5 py-2 border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50 font-semibold transition-colors shadow-sm text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900">Ventas y ganancias</h2>

              {salesLoading ? (
                <div className="mt-3 text-gray-600">Cargando...</div>
              ) : !salesSummary ? (
                <div className="mt-3 text-gray-600">Aún no hay ventas registradas.</div>
              ) : (
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500">Unidades vendidas</div>
                    <div className="text-lg font-semibold text-gray-900">{salesSummary.unitsSold || 0}</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500">Ventas brutas</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(salesSummary.grossSales || 0)}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500">Ganancia (vendedor)</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(salesSummary.vendorAmount || 0)}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500">Comisión plataforma</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(salesSummary.platformAmount || 0)}
                    </div>
                  </div>
                </div>
              )}

              {!salesLoading && salesItems.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Ventas recientes</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4">Orden</th>
                          <th className="py-2 pr-4">Producto</th>
                          <th className="py-2 pr-4">Cant.</th>
                          <th className="py-2 pr-4">Total</th>
                          <th className="py-2 pr-4">Neto</th>
                          <th className="py-2 pr-4">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesItems.slice(0, 20).map((row) => {
                          const total = Number(row?.item?.price || 0) * Number(row?.item?.quantity || 0);
                          return (
                            <tr key={`${row.orderId}-${row.item?.productId}`} className="border-t">
                              <td className="py-2 pr-4 text-gray-900">{row.orderNumber || '-'}</td>
                              <td className="py-2 pr-4 text-gray-900">{row.item?.name || '-'}</td>
                              <td className="py-2 pr-4 text-gray-900">{row.item?.quantity || 0}</td>
                              <td className="py-2 pr-4 text-gray-900">
                                {new Intl.NumberFormat('es-CO', {
                                  style: 'currency',
                                  currency: 'COP',
                                  minimumFractionDigits: 0,
                                }).format(total)}
                              </td>
                              <td className="py-2 pr-4 text-gray-900">
                                {new Intl.NumberFormat('es-CO', {
                                  style: 'currency',
                                  currency: 'COP',
                                  minimumFractionDigits: 0,
                                }).format(row.item?.vendorAmount || 0)}
                              </td>
                              <td className="py-2 pr-4 text-gray-700">{row.orderStatus || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Mis productos</h2>

              {productsLoading ? (
                <div className="mt-3 text-gray-600">Cargando...</div>
              ) : products.length === 0 ? (
                <div className="mt-3 text-gray-600">Aún no has subido productos.</div>
              ) : (
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div key={p._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{p.brand}</div>
                      <div className="text-sm text-gray-600 mt-1">Stock: {p.stock}</div>
                      <div className="text-sm text-gray-900 font-semibold mt-2">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                        }).format(p.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : vendorNotFound ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <h2 className="text-xl font-semibold text-gray-900">Crea tu perfil de vendedor</h2>
            <p className="mt-2 text-gray-600">
              Completa lo mínimo para empezar a vender.
            </p>

            <form className="mt-5 grid gap-4" onSubmit={submitRegister}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre (tienda o negocio)</label>
                <input
                  name="name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  className="mt-1 w-full p-2 bg-slate-100 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cuenta de pago (opcional)</label>
                <input
                  name="paymentAccount"
                  value={registerForm.paymentAccount}
                  onChange={handleRegisterChange}
                  className="mt-1 w-full p-2 bg-slate-100 border rounded"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#F2B705] text-white rounded-md hover:bg-[#d9a305] font-semibold transition-colors shadow-sm text-sm disabled:opacity-60"
                >
                  Crear perfil
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-gray-600">No se pudo cargar el perfil.</div>
        )}
      </div>
    </div>
  );
};

export default Vendedor;
