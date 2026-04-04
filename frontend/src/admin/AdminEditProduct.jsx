import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';
import uploadImage from '../helpers/uploadImage';
import SummaryApi from '../common';

const AdminEditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    productName: '',
    brandName: '',
    category: '',
    productImage: [],
    description: '',
    price: '',
    sellingPrice: '',
    features: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const fetchProductDetails = async () => {
    try {
      const response = await axiosInstance.get(`${SummaryApi.productDetails.url}/${productId}`);
      const productData = response.data.data;
      // Convertir features array a texto con saltos de línea
      if (productData.features && Array.isArray(productData.features)) {
        productData.features = productData.features.join('\n');
      }
      setData(productData);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar los detalles del producto');
    }
  };

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const response = await axiosInstance.get(SummaryApi.getCategory.url);
      setCategories(response.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar las categorías');
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProductDetails(), fetchCategories()]).then(() => {
      setLoading(false);
    });
  }, [productId]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadProduct = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadResponse = await uploadImage(file);
      setData((prev) => ({ ...prev, productImage: [...prev.productImage, uploadResponse.url] }));
    }
  };

  const handleDeleteProductImage = (index) => {
    const newProductImage = [...data.productImage];
    newProductImage.splice(index, 1);
    setData((prev) => ({ ...prev, productImage: newProductImage }));
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
    try {
      await axiosInstance.post(SummaryApi.createCategory.url, { label: newCategory });
      toast.success('Categoría agregada');
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al agregar la categoría');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('¿Seguro que quieres eliminar esta categoría?')) {
      try {
        await axiosInstance.delete(`${SummaryApi.deleteCategory.url}/${categoryId}`);
        toast.success('Categoría eliminada');
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al eliminar la categoría');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir features de texto a array
      const dataToSend = {
        ...data,
        features: data.features ? data.features.split('\n').map(line => line.trim()).filter(line => line) : []
      };
      
      const response = await axiosInstance.put(`${SummaryApi.updateProduct.url}/${productId}`, dataToSend);
      toast.success(response.data.message);
      navigate('/admin-panel/all-products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar el producto');
    }
  };

  if (loading) return <p className="text-center">Cargando...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Editar Producto</h2>
      <form onSubmit={handleSubmit} className="grid p-4 gap-3 bg-white rounded shadow-md">
        <label htmlFor="productName">Nombre del Producto:</label>
        <input type="text" id="productName" name="productName" value={data.productName} onChange={handleOnChange} className="p-2 bg-slate-100 border rounded" />

        <label htmlFor="brandName">Marca:</label>
        <input type="text" id="brandName" name="brandName" value={data.brandName} onChange={handleOnChange} className="p-2 bg-slate-100 border rounded" />

        <label htmlFor="category">Categoría:</label>
        <div className="flex gap-2">
          <select id="category" name="category" value={data.category} onChange={handleOnChange} className="p-2 bg-slate-100 border rounded flex-grow">
            <option value="">Seleccionar Categoría</option>
            {categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.label}</option>))}
          </select>
        </div>

        <div className="mt-2">
          <p className="font-medium">Gestionar Categorías:</p>
          <div className="flex items-center gap-2 mt-1">
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nueva categoría" className="p-2 bg-slate-100 border rounded" />
            <button type="button" onClick={handleAddCategory} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Agregar</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(cat => (
              <div key={cat._id} className="flex items-center gap-2 bg-slate-200 px-2 py-1 rounded-full">
                <span>{cat.label}</span>
                <MdDelete className="cursor-pointer text-red-600" onClick={() => handleDeleteCategory(cat._id)} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="font-medium mt-2">Imágenes:</label>
          <div className="flex items-center gap-2">
            {data.productImage.map((imgUrl, index) => (
              <div key={index} className="relative group">
                <img src={imgUrl} alt={`product ${index}`} width={80} height={80} className="bg-slate-100 border cursor-pointer" onClick={() => { setFullScreenImage(imgUrl); setOpenFullScreenImage(true); }} />
                <div className="absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full hidden group-hover:block cursor-pointer" onClick={() => handleDeleteProductImage(index)}> <MdDelete /> </div>
              </div>
            ))}
            <label className="w-32 h-32 border-2 border-dashed rounded flex justify-center items-center cursor-pointer">
              <div className="text-slate-500 text-center">
                <FaCloudUploadAlt size={30} /><p>Subir Imagen</p>
              </div>
              <input type="file" className="hidden" onChange={handleUploadProduct} />
            </label>
          </div>
        </div>

        <label htmlFor="price">Precio:</label>
        <input type="number" id="price" name="price" value={data.price} onChange={handleOnChange} className="p-2 bg-slate-100 border rounded" />

        <label htmlFor="sellingPrice">Precio de Venta:</label>
        <input type="number" id="sellingPrice" name="sellingPrice" value={data.sellingPrice} onChange={handleOnChange} className="p-2 bg-slate-100 border rounded" />

        <label htmlFor="description">Descripción:</label>
        <input type="text" id="description" name="description" value={data.description} onChange={handleOnChange} className="p-2 bg-slate-100 border rounded" placeholder="Descripción del producto..." />

        <label htmlFor="features">Características:</label>
        <textarea 
          id="features" 
          name="features" 
          value={data.features || ''} 
          onChange={handleOnChange} 
          rows="6" 
          placeholder={"Escribe una característica por línea:\nRecargable USB\nResistente al agua\nBatería de 90 minutos\nCuchillas de acero inoxidable"}
          className="p-2 bg-slate-100 border rounded">
        </textarea>
        <p className="text-xs text-slate-500 italic">💡 Tip: Escribe cada característica en una línea nueva</p>

        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Actualizar Producto</button>
      </form>

      {openFullScreenImage && (
        <div className="fixed w-full h-full bg-black bg-opacity-70 top-0 left-0 flex justify-center items-center z-50">
          <button onClick={() => setOpenFullScreenImage(false)} className="absolute top-2 right-2 text-white text-2xl">&times;</button>
          <img src={fullScreenImage} alt="full screen" className="max-w-full max-h-full" />
        </div>
      )}
    </div>
  );
};

export default AdminEditProduct;
