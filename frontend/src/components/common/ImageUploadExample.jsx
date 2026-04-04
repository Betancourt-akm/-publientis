import { useState } from 'react';
import { toast } from 'react-toastify';
import uploadImage from '../helpers/uploadImage';
import SummaryApi from '../common';
import { FaCloudUploadAlt, FaTrash, FaImages } from 'react-icons/fa';

/**
 * Componente de Ejemplo: Sistema de Upload de Imágenes
 * 
 * Características:
 * - Upload único y múltiple
 * - Validaciones de tamaño y tipo
 * - Preview de imágenes
 * - Eliminación de imágenes
 * - Estados de carga
 */
const ImageUploadExample = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ==================== UPLOAD ÚNICO ====================
  const handleSingleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagen muy grande. Máximo 10MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    setUploading(true);
    try {
      toast.info('Subiendo imagen...');
      
      // Subir a través del backend (seguro)
      const result = await uploadImage(file, 'products');
      
      setImages(prev => [...prev, {
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }]);
      
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  // ==================== UPLOAD MÚLTIPLE ====================
  const handleMultipleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validar cantidad (máximo 10)
    if (files.length > 10) {
      toast.error('Máximo 10 imágenes a la vez');
      return;
    }

    // Validar cada archivo
    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} es muy grande. Máximo 10MB`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      toast.info(`Subiendo ${files.length} imágenes...`);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('folder', 'products');

      const response = await fetch(SummaryApi.uploadMultipleImages.url, {
        method: SummaryApi.uploadMultipleImages.method,
        credentials: 'include',
        body: formData
      });

      const responseData = await response.json();

      if (responseData.success) {
        setImages(prev => [...prev, ...responseData.data]);
        toast.success(`${responseData.data.length} imágenes subidas`);
      } else {
        throw new Error(responseData.message);
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al subir imágenes');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ==================== ELIMINAR IMAGEN ====================
  const handleDeleteImage = async (public_id, index) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;

    try {
      const response = await fetch(SummaryApi.deleteImage.url, {
        method: SummaryApi.deleteImage.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ public_id })
      });

      const responseData = await response.json();

      if (responseData.success) {
        setImages(prev => prev.filter((_, i) => i !== index));
        toast.success('Imagen eliminada');
      } else {
        throw new Error(responseData.message);
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar imagen');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Sistema de Upload de Imágenes</h2>

      {/* ==================== BOTONES DE UPLOAD ==================== */}
      <div className="flex gap-4 mb-8">
        {/* Upload Único */}
        <label className="flex-1 cursor-pointer">
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center hover:bg-blue-50 transition">
            <FaCloudUploadAlt className="text-4xl text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Subir una imagen</p>
            <p className="text-xs text-gray-500 mt-1">Máx. 10MB</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleSingleUpload}
            disabled={uploading}
          />
        </label>

        {/* Upload Múltiple */}
        <label className="flex-1 cursor-pointer">
          <div className="border-2 border-dashed border-green-400 rounded-lg p-8 text-center hover:bg-green-50 transition">
            <FaImages className="text-4xl text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Subir múltiples</p>
            <p className="text-xs text-gray-500 mt-1">Hasta 10 imágenes</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleMultipleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* ==================== ESTADO DE CARGA ==================== */}
      {uploading && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">
              Subiendo imágenes...
            </span>
            <span className="text-sm text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ==================== GALERÍA DE IMÁGENES ==================== */}
      {images.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Imágenes Subidas ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.public_id || index}
                className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                
                {/* Overlay con información */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition text-center">
                    <button
                      onClick={() => handleDeleteImage(image.public_id, index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                    >
                      <FaTrash />
                      Eliminar
                    </button>
                    <p className="text-white text-xs mt-2">
                      {image.width}x{image.height}px
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== INFORMACIÓN ==================== */}
      {images.length === 0 && !uploading && (
        <div className="text-center text-gray-500 py-12">
          <FaCloudUploadAlt className="text-6xl mx-auto mb-4 opacity-20" />
          <p>No hay imágenes subidas</p>
          <p className="text-sm mt-2">
            Sube imágenes usando los botones de arriba
          </p>
        </div>
      )}

      {/* ==================== CARACTERÍSTICAS ==================== */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold mb-3">✨ Características del Sistema:</h4>
        <ul className="text-sm space-y-2 text-gray-700">
          <li>✅ Subida segura a través del backend</li>
          <li>✅ API Keys de Cloudinary protegidas</li>
          <li>✅ Validación de tamaño (máx. 10MB)</li>
          <li>✅ Solo imágenes permitidas</li>
          <li>✅ Autenticación requerida</li>
          <li>✅ Optimización automática (1000x1000px)</li>
          <li>✅ Upload individual y múltiple</li>
          <li>✅ Eliminación de imágenes</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadExample;
