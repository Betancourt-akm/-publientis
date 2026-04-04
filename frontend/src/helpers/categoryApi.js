// src/helpers/categoryApi.js
import axiosInstance from '../utils/axiosInstance';
import SummaryApi from "../common";

/**
 * Obtiene todas las categorías registradas en el backend.
 * @returns {Promise<Array<{_id: string, label: string, value: string}>>}
 */
export async function getCategories() {
  const response = await axiosInstance.get(SummaryApi.categories.url);
  return response.data.data; // Devuelve solo el array de datos
}

/**
 * Crea una nueva categoría en el backend.
 * @param {string} name — Nombre y valor de la nueva categoría.
 * @returns {Promise<Array<{_id: string, label: string, value: string}>>}
 */
export async function createCategory(name) {
  const data = { label: name, value: name };
  const response = await axiosInstance.post(SummaryApi.createCategory.url, data);
  return response.data.data; // Devuelve solo el objeto de datos, como en el código original
}

/**
 * Elimina una categoría existente por su _id.
 * @param {string} id — El ObjectId de la categoría a eliminar.
 * @returns {Promise<{message: string, success: boolean, error: boolean}>}
 */
export async function deleteCategory(id) {
  const url = `${SummaryApi.categories.url}/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: SummaryApi.categories.credentials,
    headers: { "Content-Type": "application/json" }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al eliminar categoría");
  return json; // { message, success, error }
}
