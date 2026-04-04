import SummaryApi from '../common';

/**
 * Sube una imagen al servidor backend, que la sube a Cloudinary
 * @param {File} image - Archivo de imagen a subir
 * @param {string} folder - Carpeta en Cloudinary (opcional, default: 'products')
 * @returns {Promise<Object>} - Objeto con url, public_id, etc.
 */
const uploadImage = async (image, folder = 'products') => {
    if (!image) {
      throw new Error("No se proporcionó ninguna imagen");
    }
  
    const formData = new FormData();
    formData.append("image", image);
    formData.append("folder", folder);
  
    // Obtener token de localStorage
    const token = localStorage.getItem('token');
    
    try {
      const headers = {};
      
      // Agregar token al header si existe
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(SummaryApi.uploadImage.url, {
        method: SummaryApi.uploadImage.method,
        credentials: 'include',
        headers: headers,
        body: formData
      });

      const responseData = await response.json();

      if (responseData.success) {
        return responseData.data;
      } else {
        throw new Error(responseData.message || "Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };
  
  export default uploadImage;
  