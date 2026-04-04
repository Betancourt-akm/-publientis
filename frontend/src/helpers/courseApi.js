// src/helpers/courseApi.js
import axiosInstance from '../utils/axiosInstance';
import SummaryApi from "../common";

/**
 * Obtiene todos los cursos con opciones de filtrado y paginación.
 * @param {Object} options - Opciones de filtrado y paginación
 * @param {string} [options.search] - Término de búsqueda
 * @param {string} [options.level] - Nivel del curso (PRINCIPIANTE, INTERMEDIO, AVANZADO)
 * @param {string} [options.sort] - Campo para ordenar
 * @param {string} [options.order] - Dirección del ordenamiento (asc, desc)
 * @param {number} [options.page] - Número de página
 * @param {number} [options.limit] - Cantidad de resultados por página
 * @returns {Promise<{courses: Array, pagination: Object}>}
 */
export async function getAllCourses(options = {}) {
  const { search, level, sort, order, page, limit } = options;
  let url = SummaryApi.getAllCourses.url;
  
  // Construir query params
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (level) params.append('level', level);
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  
  const queryString = params.toString();
  if (queryString) {
    url = `${url}?${queryString}`;
  }
  
  const response = await axiosInstance.get(url);
  return response.data;
}

/**
 * Obtiene un curso por su ID.
 * @param {string} id - ID del curso
 * @returns {Promise<Object>}
 */
export async function getCourseById(id) {
  const response = await axiosInstance.get(SummaryApi.getCourseById(id).url);
  return response.data;
}

/**
 * Obtiene cursos por categoría con opciones de filtrado y paginación.
 * @param {string} categoryId - ID de la categoría
 * @param {Object} options - Opciones de filtrado y paginación
 * @param {string} [options.search] - Término de búsqueda
 * @param {string} [options.level] - Nivel del curso (PRINCIPIANTE, INTERMEDIO, AVANZADO)
 * @param {string} [options.sort] - Campo para ordenar
 * @param {string} [options.order] - Dirección del ordenamiento (asc, desc)
 * @param {number} [options.page] - Número de página
 * @param {number} [options.limit] - Cantidad de resultados por página
 * @returns {Promise<{courses: Array, pagination: Object, category: Object}>}
 */
export async function getCoursesByCategory(categoryId, options = {}) {
  const { search, level, sort, order, page, limit } = options;
  let url = SummaryApi.getCoursesByCategory(categoryId).url;
  
  // Construir query params
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (level) params.append('level', level);
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  
  const queryString = params.toString();
  if (queryString) {
    url = `${url}?${queryString}`;
  }
  
  const response = await axiosInstance.get(url);
  return response.data;
}

/**
 * Obtiene los cursos destacados.
 * @param {number} [limit=6] - Límite de cursos a obtener
 * @returns {Promise<Array>}
 */
export async function getFeaturedCourses(limit = 6) {
  const url = `${SummaryApi.getFeaturedCourses.url}?limit=${limit}`;
  const response = await axiosInstance.get(url);
  return response.data.data;
}

/**
 * Crea un nuevo curso.
 * @param {Object} courseData - Datos del curso
 * @returns {Promise<Object>}
 */
export async function createCourse(courseData) {
  const response = await axiosInstance.post(SummaryApi.createCourse.url, courseData);
  return response.data;
}

/**
 * Actualiza un curso existente.
 * @param {string} id - ID del curso
 * @param {Object} courseData - Datos actualizados del curso
 * @returns {Promise<Object>}
 */
export async function updateCourse(id, courseData) {
  const response = await axiosInstance.put(SummaryApi.updateCourse(id).url, courseData);
  return response.data;
}

/**
 * Actualiza el estado de un curso.
 * @param {string} id - ID del curso
 * @param {string} status - Nuevo estado (DRAFT, ACTIVE, INACTIVE)
 * @returns {Promise<Object>}
 */
export async function updateCourseStatus(id, status) {
  const response = await axiosInstance.patch(
    SummaryApi.updateCourseStatus(id).url, 
    { status }
  );
  return response.data;
}

/**
 * Elimina un curso.
 * @param {string} id - ID del curso
 * @returns {Promise<Object>}
 */
export async function deleteCourse(id) {
  const response = await axiosInstance.delete(SummaryApi.deleteCourse(id).url);
  return response.data;
}
