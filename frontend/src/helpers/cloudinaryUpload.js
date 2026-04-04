// Helper optimizado para subir archivos a Cloudinary
import { useState } from 'react';
import SummaryApi from '../common';
import { toast } from 'react-toastify';

/**
 * Sube un archivo a Cloudinary a través del backend
 * @param {File} file - Archivo a subir
 * @param {string} fieldName - Nombre del campo (idDocument, criminalRecord, profilePhoto)
 * @param {function} onProgress - Callback para mostrar progreso (opcional)
 * @returns {Promise<Object>} - Resultado con URL y datos del archivo
 */
export const uploadFileToCloudinary = async (file, fieldName, onProgress = null) => {
  try {
    // Validar archivo
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB permitido.');
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP) y PDF.');
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', fieldName);

    // Obtener token de autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Configurar XMLHttpRequest para mostrar progreso
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Configurar progreso de subida
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      // Configurar respuesta
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve(response.data);
            } else {
              reject(new Error(response.message || 'Error subiendo archivo'));
            }
          } catch (error) {
            reject(new Error('Error procesando respuesta del servidor'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Error HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Error HTTP ${xhr.status}`));
          }
        }
      });

      // Configurar error
      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al subir archivo'));
      });

      // Configurar timeout
      xhr.addEventListener('timeout', () => {
        reject(new Error('Timeout al subir archivo'));
      });

      // Configurar y enviar request
      xhr.open('POST', SummaryApi.uploadWalkerFile.url);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.timeout = 60000; // 60 segundos timeout
      xhr.send(formData);
    });

  } catch (error) {
    console.error('Error en uploadFileToCloudinary:', error);
    throw error;
  }
};

/**
 * Sube múltiples archivos de forma secuencial
 * @param {Array} files - Array de objetos {file, fieldName}
 * @param {function} onProgress - Callback para mostrar progreso total
 * @returns {Promise<Array>} - Array con resultados de cada archivo
 */
export const uploadMultipleFiles = async (files, onProgress = null) => {
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const { file, fieldName } = files[i];
    
    try {
      const fileProgress = (percent) => {
        if (onProgress) {
          const totalProgress = Math.round(((i * 100) + percent) / total);
          onProgress(totalProgress, i + 1, total);
        }
      };

      const result = await uploadFileToCloudinary(file, fieldName, fileProgress);
      results.push({ success: true, fieldName, result });
      
    } catch (error) {
      console.error(`Error subiendo ${fieldName}:`, error);
      results.push({ success: false, fieldName, error: error.message });
    }
  }

  return results;
};

/**
 * Valida un archivo antes de subirlo
 * @param {File} file - Archivo a validar
 * @param {string} fieldName - Tipo de campo
 * @returns {Object} - {isValid, error}
 */
export const validateFile = (file, fieldName) => {
  if (!file) {
    return { isValid: false, error: 'No se proporcionó ningún archivo' };
  }

  // Validar tamaño
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'El archivo es demasiado grande. Máximo 5MB permitido.' };
  }

  // Validar tipo según el campo
  let allowedTypes = [];
  
  switch (fieldName) {
    case 'profilePhoto':
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      break;
    case 'idDocument':
    case 'criminalRecord':
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      break;
    default:
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  }

  if (!allowedTypes.includes(file.type)) {
    const typeText = fieldName === 'profilePhoto' ? 'imágenes' : 'imágenes y PDF';
    return { isValid: false, error: `Solo se permiten archivos de ${typeText}` };
  }

  return { isValid: true, error: null };
};

/**
 * Obtiene una vista previa de un archivo
 * @param {File} file - Archivo
 * @returns {Promise<string>} - URL de vista previa
 */
export const getFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se proporcionó archivo'));
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // Para PDFs, devolver un ícono o placeholder
      resolve('/assets/icons/pdf-icon.png'); // Asegúrate de tener este ícono
    } else {
      reject(new Error('Tipo de archivo no soportado para vista previa'));
    }
  });
};

/**
 * Formatea el tamaño de archivo para mostrar
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Hook personalizado para manejar subida de archivos con estado
 */
export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    progress: 0,
    error: null,
    result: null
  });

  const uploadFile = async (file, fieldName) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null
    });

    try {
      const result = await uploadFileToCloudinary(
        file, 
        fieldName, 
        (progress) => {
          setUploadState(prev => ({ ...prev, progress }));
        }
      );

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        result
      });

      toast.success('Archivo subido exitosamente');
      return result;

    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error.message,
        result: null
      });

      toast.error(error.message);
      throw error;
    }
  };

  const resetUploadState = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null
    });
  };

  return {
    uploadState,
    uploadFile,
    resetUploadState
  };
};

const cloudinaryUtils = {
  uploadFileToCloudinary,
  uploadMultipleFiles,
  validateFile,
  getFilePreview,
  formatFileSize,
  useFileUpload
};

export default cloudinaryUtils;
