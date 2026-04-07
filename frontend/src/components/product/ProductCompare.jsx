/**
 * Componente de Comparador de Productos
 * Permite comparar hasta 4 productos lado a lado
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaPlus, FaCheck, FaStar } from 'react-icons/fa';

const ProductCompare = ({ initialProducts = [] }) => {
  const [products, setProducts] = useState(initialProducts);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (products.length >= 2) {
      fetchComparison();
    }
  }, [products]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const productIds = products.map(p => p._id);
      
      const response = await fetch('/api/compare/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds })
      });

      const data = await response.json();
      
      if (data.success) {
        setComparison(data.comparison);
      }
    } catch (error) {
      console.error('Error comparing products:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = (productId) => {
    setProducts(products.filter(p => p._id !== productId));
  };

  const canAddMore = products.length < 4;

  if (products.length < 2) {
    return (
      <div className="text-center py-12">
        <FaPlus className="mx-auto text-6xl text-gray-300 mb-4" />
        <h3 className="text-2xl font-bold text-gray-700 mb-2">
          Agrega productos para comparar
        </h3>
        <p className="text-gray-500">
          Selecciona al menos 2 productos (máximo 4)
        </p>
      </div>
    );
  }

  return (
    <div className="product-compare">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Comparador de Productos
        </h2>
        <p className="text-gray-600">
          Comparando {products.length} productos
          {canAddMore && ` (puedes agregar ${4 - products.length} más)`}
        </p>
      </div>

      {/* Tabla de comparación */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 text-left border-b font-semibold text-gray-700 w-48">
                Característica
              </th>
              {products.map((product) => (
                <th key={product._id} className="p-4 border-b border-l relative">
                  {/* Botón remover */}
                  <button
                    onClick={() => removeProduct(product._id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FaTimes />
                  </button>

                  {/* Imagen */}
                  <Link to={`/producto/${product._id}`}>
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-32 h-32 object-cover mx-auto rounded-lg mb-3"
                    />
                  </Link>

                  {/* Nombre */}
                  <Link
                    to={`/producto/${product._id}`}
                    className="font-bold text-gray-900 hover:text-blue-600 block mb-2"
                  >
                    {product.name}
                  </Link>

                  {/* Editorial */}
                  {product.brand && (
                    <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* INFORMACIÓN BÁSICA */}
            <tr className="bg-gray-100">
              <td colSpan={products.length + 1} className="p-3 font-bold border-b">
                Información Básica
              </td>
            </tr>

            {/* Precio */}
            <tr>
              <td className="p-4 border-b font-medium text-gray-700">Precio</td>
              {comparison?.basic.price.map((price, index) => (
                <td key={index} className="p-4 border-b border-l text-center">
                  <span className="text-2xl font-bold text-blue-600">
                    ${price.toLocaleString('es-CO')}
                  </span>
                </td>
              ))}
            </tr>

            {/* Categoría */}
            <tr className="bg-gray-50">
              <td className="p-4 border-b font-medium text-gray-700">Categoría</td>
              {comparison?.basic.category.map((category, index) => (
                <td key={index} className="p-4 border-b border-l text-center">
                  {category}
                </td>
              ))}
            </tr>

            {/* Stock */}
            <tr>
              <td className="p-4 border-b font-medium text-gray-700">Disponibilidad</td>
              {comparison?.basic.stock.map((stock, index) => (
                <td key={index} className="p-4 border-b border-l text-center">
                  {stock > 0 ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <FaCheck /> En stock ({stock})
                    </span>
                  ) : (
                    <span className="text-red-600">Agotado</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="bg-gray-50">
              <td className="p-4 border-b font-medium text-gray-700">Calificación</td>
              {comparison?.basic.rating.map((rating, index) => (
                <td key={index} className="p-4 border-b border-l text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-bold">{rating || 'N/A'}</span>
                    <span className="text-gray-500 text-sm">
                      ({comparison.basic.reviewCount[index]} reviews)
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* ESPECIFICACIONES */}
            {comparison?.specifications && Object.keys(comparison.specifications).length > 0 && (
              <>
                <tr className="bg-gray-100">
                  <td colSpan={products.length + 1} className="p-3 font-bold border-b">
                    Especificaciones
                  </td>
                </tr>

                {Object.entries(comparison.specifications).map(([spec, values]) => (
                  <tr key={spec}>
                    <td className="p-4 border-b font-medium text-gray-700 capitalize">
                      {spec}
                    </td>
                    {values.map((value, index) => (
                      <td key={index} className="p-4 border-b border-l text-center">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}

            {/* Botones de acción */}
            <tr>
              <td className="p-4 border-b font-medium text-gray-700">Acciones</td>
              {products.map((product) => (
                <td key={product._id} className="p-4 border-b border-l text-center">
                  <Link
                    to={`/producto/${product._id}`}
                    className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2"
                  >
                    Ver Detalle
                  </Link>
                  <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Agregar al Carrito
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Agregar más productos */}
      {canAddMore && (
        <div className="mt-6 text-center">
          <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-flex items-center gap-2">
            <FaPlus />
            Agregar Producto ({4 - products.length} disponibles)
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCompare;
