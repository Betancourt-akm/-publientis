import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCloudUploadAlt } from 'react-icons/fa';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';
import uploadImage from '../../helpers/uploadImage';

const ProductosAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: 0,
    category: 'Máquinas de Afeitar',
    brand: '',
    images: [],
    stock: '',
    features: [],
    isFeatured: false,
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = [
    'Máquinas de Afeitar',
    'Recortadoras de Barba',
    'Productos para el Afeitado',
    'Cuidado Facial',
    'Accesorios',
    'Sets y Kits',
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getAllProducts.url);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen es muy grande. Máximo 10MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    setUploadingImage(true);
    try {
      toast.info('Subiendo imagen...');
      
      // Subir imagen de forma segura a través del backend
      const result = await uploadImage(file, 'products');
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.url]
      }));
      
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureAdd = () => {
    const feature = prompt('Ingresa una característica:');
    if (feature) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const handleFeatureRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        discount: Number(formData.discount),
        stock: Number(formData.stock),
      };

      let response;
      if (editingProduct) {
        response = await fetch(SummaryApi.updateProduct(editingProduct._id).url, {
          method: SummaryApi.updateProduct(editingProduct._id).method,
          credentials: 'include', // ✅ Usar cookies httpOnly
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        response = await fetch(SummaryApi.createProduct.url, {
          method: SummaryApi.createProduct.method,
          credentials: 'include', // ✅ Usar cookies httpOnly
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      const data = await response.json();

      if (data.success) {
        toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado');
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        toast.error(data.message || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar el producto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      discount: product.discount || 0,
      category: product.category,
      brand: product.brand,
      images: product.images,
      stock: product.stock,
      features: product.features || [],
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(SummaryApi.deleteProduct(id).url, {
        method: SummaryApi.deleteProduct(id).method,
        credentials: SummaryApi.deleteProduct(id).credentials,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Producto eliminado');
        fetchProducts();
      } else {
        toast.error(data.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      discount: 0,
      category: 'Máquinas de Afeitar',
      brand: '',
      images: [],
      stock: '',
      features: [],
      isFeatured: false,
      isActive: true,
    });
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <FaPlus />
          Nuevo Producto
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.images[0] || '/placeholder.png'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                    {product.discount > 0 && (
                      <div className="text-xs text-red-600">-{product.discount}%</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock} unidades
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    {product.isFeatured && (
                      <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Destacado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nombre *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Marca *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Categoría *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Precio *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Descuento (%)</label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Descripción *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Imágenes */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Imágenes</label>
                  
                  {/* Botón de Upload */}
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition mb-2">
                      <FaCloudUploadAlt className="text-blue-600" size={20} />
                      <span className="text-blue-700 font-medium">
                        {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                      </span>
                      <span className="text-xs text-gray-500">(Máx. 10MB)</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>

                  {/* Preview de imágenes */}
                  <div className="grid grid-cols-4 gap-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={img} 
                          alt="" 
                          className="w-full h-24 object-cover rounded border-2 border-gray-200" 
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Imagen {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.images.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No hay imágenes. Sube al menos una imagen del producto.
                    </p>
                  )}
                </div>

                {/* Características */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Características</label>
                  <button
                    type="button"
                    onClick={handleFeatureAdd}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 mb-2"
                  >
                    + Agregar Característica
                  </button>
                  <ul className="space-y-1">
                    {formData.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="flex-1">{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleFeatureRemove(index)}
                          className="text-red-600"
                        >
                          <FaTrash size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm font-semibold">Producto Destacado</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm font-semibold">Producto Activo</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosAdmin;
