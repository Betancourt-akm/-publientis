import { useState, useEffect} from 'react';
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../helpers/uploadImage';
import DisplayImage from '../components/ui/Card/DisplayImage';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { getCategories, createCategory, deleteCategory } from '../helpers/categoryApi';
import { MdDelete, MdAdd } from 'react-icons/md';
import axiosInstance from '../utils/axiosInstance';




const UploadProduct = ({ onClose, fetchData }) => {
  const [data, setData] = useState({
    
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
    sellingPrice: "",
    stock: 0,
    features: "", // Campo de características como texto
    serviceDuration: "",
    serviceIncludes: "",
    serviceRecommendations: "",
    serviceIntensity: "",
    serviceAdditionalBenefits: "",
    serviceRecommendedFrequency: "",
    serviceDiscountsPromotions: "",
  });
const [categories, setCategories]         = useState([]);
const [newCategoryName, setNewCategoryName] = useState("");
const [loadingCats, setLoadingCats]       = useState(false);


useEffect(() => {
  setLoadingCats(true);
  getCategories()
    .then(setCategories)
    .catch(() => toast.error("No pude cargar categorías"))
    .finally(() => setLoadingCats(false));
}, []);


  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUploadProduct = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploadImageCloudinary = await uploadImage(file);
      setData((prev) => ({
        ...prev,
        productImage: [...prev.productImage, uploadImageCloudinary.url],
      }));
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      toast.error('Error al subir la imagen.');
    }
  };

  const handleDeleteProductImage = (index) => {
    const newProductImage = [...data.productImage];
    newProductImage.splice(index, 1);
    setData((prev) => ({
      ...prev,
      productImage: newProductImage,
    }));
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.productImage.length === 0) {
      toast.error('Por favor, sube al menos una imagen del producto.');
      return;
    }

    try {
      // Convertir features de texto a array
      const dataToSend = {
        ...data,
        features: data.features ? data.features.split('\n').map(line => line.trim()).filter(line => line) : []
      };
      
      const response = await axiosInstance.post(SummaryApi.uploadProduct.url, dataToSend);
      const responseData = response.data;

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        fetchData();
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error('Error al subir el producto:', error);
      toast.error(error?.response?.data?.message || 'Error al subir el producto.');
    }
  };

const handleAddCategory = async () => {
  if (!newCategoryName.trim()) return toast.error('Nombre vacío');
  try {
    const created = await createCategory(newCategoryName.trim());
    setCategories(prev => [...prev, created]);
    setData(prev => ({ ...prev, category: created._id }));
    setNewCategoryName("");
    toast.success(`Categoría “${created.label}” creada.`);
  } catch (err) {
    toast.error(err.message);
  }
};

const handleDeleteCategory = async (id) => {
  if (!window.confirm(`¿Borrar categoría?`)) return;
  try {
    await deleteCategory(id);
    setCategories(prev => prev.filter(c => c._id !== id));
    toast.success('Categoría eliminada');
    if (data.category === id) setData(prev => ({ ...prev, category: "" }));
  } catch (err) {
    toast.error(err.message);
  }
};



  return (
    <div className="fixed w-full h-full bg-slate-200 bg-opacity-35 top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl h-full max-h-[95vh] flex flex-col">
        {/* Header fijo */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="font-bold text-xl">Subir producto o servicio</h2>
          <button 
            type="button"
            className="text-2xl hover:text-red-600 cursor-pointer transition-colors p-2 hover:bg-gray-100 rounded-full" 
            onClick={onClose}
          >
            <CgClose />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4" style={{scrollBehavior: 'smooth'}}>
          <form className="grid gap-4" onSubmit={handleSubmit}>
          {/* Campos básicos del producto */}
          <label htmlFor="productName">Nombre del producto :</label>
          <input
            type="text"
            id="productName"
            placeholder="Servicio"
            name="productName"
            value={data.productName}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
            required
          />

          <label htmlFor="brandName" className="mt-3">Marca :</label>
          <input
            type="text"
            id="brandName"
            placeholder="Linea de Spa Bronze"
            name="brandName"
            value={data.brandName}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
          
          />
{/* — Sección para agregar nueva categoría — */}
<div className="border border-dashed rounded p-3 bg-slate-50 mt-4">
  <p className="text-sm mb-2">
    <strong>¿No ves la categoría que necesitas?</strong> Agrega una aquí.
  </p>
  <div className="flex gap-2">
    <input
      value={newCategoryName}
      onChange={e => setNewCategoryName(e.target.value)}
      placeholder="Nueva categoría"
      className="p-2 bg-white border rounded flex-1"
    />
    <button
      type="button"
      onClick={handleAddCategory}
      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      <MdAdd />
    </button>
  </div>
</div>

{/* — Lista de categorías existentes con opción de eliminar — */}
<ul className="mt-2 space-y-1 max-h-32 overflow-auto">
  {categories.map(cat => (
    <li key={cat._id} className="flex justify-between items-center px-2">
      <span>{cat.label}</span>
      <button
        type="button"
        onClick={() => handleDeleteCategory(cat._id)}
        className="text-red-500 hover:text-red-700"
      >
        🗑️
      </button>
    </li>
  ))}
</ul>

{/* — Select dinámico de categorías — */}
<label htmlFor="category" className="font-medium mt-4">
  Categoría:
</label>
<select
  id="category"
  name="category"
  value={data.category}
  onChange={handleOnChange}
  disabled={loadingCats}
  required
  className="p-2 bg-slate-100 border rounded"
>
  {loadingCats
    ? <option>Cargando categorías…</option>
    : <option value="">-- Seleccionar Categoría --</option>
  }
  {!loadingCats && categories.map(cat => (
    <option key={cat._id} value={cat._id}>
      {cat.label}
    </option>
  ))}
</select>

          <label htmlFor="stock" className="mt-3">Stock :</label>
          <input
            type="number"
            id="stock"
            placeholder="Cantidad disponible"
            name="stock"
            value={data.stock}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
          
            min="0"
          />

          <label htmlFor="productImage" className="mt-3">Producto Imagen:</label>
          <label htmlFor="uploadImageInput">
            <div className="p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer">
              <div className="text-slate-500 flex justify-center items-center flex-col gap-2">
                <span className="text-4xl">
                  <FaCloudUploadAlt />
                </span>
                <p className="text-sm">Subir Imagen del Producto</p>
                <input type="file" id="uploadImageInput" className="hidden" onChange={handleUploadProduct} />
              </div>
            </div>
          </label>
          <div>
            {data?.productImage.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {data.productImage.map((el, index) => (
                  <div className="relative group" key={index}>
                    <img
                      src={el}
                      alt={`Imagen ${index + 1}`}
                      width={80}
                      height={80}
                      className="bg-slate-100 border cursor-pointer object-cover"
                      onClick={() => {
                        setOpenFullScreenImage(true);
                        setFullScreenImage(el);
                      }}
                    />
                    <div
                      className="absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full hidden group-hover:block cursor-pointer"
                      onClick={() => handleDeleteProductImage(index)}
                    >
                      <MdDelete />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600 text-xs">*Por favor sube una imagen del producto</p>
            )}
          </div>


          

          <label htmlFor="price" className="mt-3">Precio :</label>
          <input
            type="number"
            id="price"
            placeholder="Precio original"
            name="price"
            value={data.price}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
            
            min="0"
            step="any"
          />

          <label htmlFor="sellingPrice" className="mt-3">Precio de venta :</label>
          <input
            type="number"
            id="sellingPrice"
            placeholder="Precio de venta o promoción"
            name="sellingPrice"
            value={data.sellingPrice}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
            
            min="0"
            step="any"
          />

          


          <label htmlFor="description" className="mt-3">Descripción :</label>
          <input
            type="text"
            id="description"
            className="p-2 bg-slate-100 border rounded"
            placeholder="Descripción del producto..."
            name="description"
            value={data.description}
            onChange={handleOnChange}
          />

          <label htmlFor="features" className="mt-3">Características :</label>
          <textarea
            id="features"
            className="h-32 bg-slate-100 border resize-none p-2"
            placeholder={"Escribe una característica por línea:\nRecargable USB\nResistente al agua\nBatería de 90 minutos\nCuchillas de acero inoxidable"}
            rows={6}
            name="features"
            value={data.features}
            onChange={handleOnChange}
          ></textarea>
          <p className="text-xs text-slate-500 italic">💡 Tip: Escribe cada característica en una línea nueva</p>

          {/* Campos adicionales para el servicio */}
          <div className="mt-5 border-t pt-3">
            <h3 className="font-bold text-lg mb-2">Detalles del Servicio</h3>
            <label htmlFor="serviceDuration">Duración (minutos):</label>
            <input
              type="number"
              id="serviceDuration"
              placeholder="Ej: 120"
              name="serviceDuration"
              value={data.serviceDuration}
              onChange={handleOnChange}
              className="p-2 bg-slate-100 border rounded"
            
              min="0"
            />

            <label htmlFor="serviceIncludes" className="mt-3">Incluye:</label>
            <textarea
              id="serviceIncludes"
              placeholder="Ej: Bikini de cinta adhesiva, exfoliación, hidratación"
              name="serviceIncludes"
              value={data.serviceIncludes}
              onChange={handleOnChange}
              className="h-20 bg-slate-100 border resize-none p-1"
              
            ></textarea>

            <label htmlFor="serviceRecommendations" className="mt-3">Recomendaciones:</label>
            <textarea
              id="serviceRecommendations"
              placeholder="Ej: Hidratarse bien antes de la sesión, evitar ducharse en las primeras 8 horas después del spray tan"
              name="serviceRecommendations"
              value={data.serviceRecommendations}
              onChange={handleOnChange}
              className="h-20 bg-slate-100 border resize-none p-1"
              
            ></textarea>

            <label htmlFor="serviceIntensity" className="mt-3">Nivel de intensidad:</label>
            <select
              id="serviceIntensity"
              name="serviceIntensity"
              value={data.serviceIntensity}
              onChange={handleOnChange}
              className="p-2 bg-slate-100 border rounded"
              
            >
              <option value="">Seleccionar intensidad</option>
              <option value="ligero">Ligero</option>
              <option value="medio">Medio</option>
              <option value="intenso">Intenso</option>
            </select>

            <label htmlFor="serviceAdditionalBenefits" className="mt-3">Beneficios adicionales:</label>
            <textarea
              id="serviceAdditionalBenefits"
              placeholder="Ej: Hidratación profunda, reducción de líneas de expresión, aclarado de vellos"
              name="serviceAdditionalBenefits"
              value={data.serviceAdditionalBenefits}
              onChange={handleOnChange}
              className="h-20 bg-slate-100 border resize-none p-1"
              
            ></textarea>





            <label htmlFor="serviceRecommendedFrequency" className="mt-3">Frecuencia recomendada:</label>
            <input
              type="text"
              id="serviceRecommendedFrequency"
              placeholder="Ej: Cada 2-3 semanas"
              name="serviceRecommendedFrequency"
              value={data.serviceRecommendedFrequency}
              onChange={handleOnChange}
              className="p-2 bg-slate-100 border rounded"
              
            />

            <label htmlFor="serviceDiscountsPromotions" className="mt-3">Descuentos o promociones:</label>
            <textarea
              id="serviceDiscountsPromotions"
              placeholder="Ej: Paquetes o precios especiales por sesiones múltiples"
              name="serviceDiscountsPromotions"
              value={data.serviceDiscountsPromotions}
              onChange={handleOnChange}
              className="h-20 bg-slate-100 border resize-none p-1"
            
            ></textarea>
          </div>

          <button 
            className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg mt-6 mb-4 w-full sticky bottom-0" 
            type="submit"
          >
            Subir Producto / Servicio
          </button>
        </form>
        </div>
      </div>

      {openFullScreenImage && (
        <DisplayImage onClose={() => setOpenFullScreenImage(false)} imgUrl={fullScreenImage} />
      )}
    </div>
  );
};

export default UploadProduct;
