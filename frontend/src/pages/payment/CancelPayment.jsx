import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTimesCircle, FaShoppingCart, FaHome } from "react-icons/fa";
import "./CancelPayment.css"; 

const CancelPayment = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-block bg-red-100 rounded-full p-4 mb-4">
          <FaTimesCircle className="text-red-600 text-6xl" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Pago Cancelado
        </h1>
        
        <p className="text-gray-600 mb-8">
          Tu pago fue cancelado antes de completarse. Si deseas reintentar el proceso
          de compra o modificar tu pedido, puedes regresar al carrito o al inicio.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate("/cart")}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaShoppingCart />
            Volver al Carrito
          </button>
          
          <button 
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaHome />
            Ir al Inicio
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>¿Tuviste algún problema? Contáctanos para ayudarte.</p>
        </div>
      </div>
    </div>
  );
};

export default CancelPayment;
