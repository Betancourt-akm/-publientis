import React, { useState } from "react";
import { FaEnvelope, FaPaw, FaUser, FaComment } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from "../utils/axiosInstance";
import SummaryApi from "../common"; 

const FormContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    userType: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { url, method } = SummaryApi.formSubmit; 
      const response = await axiosInstance({
        url,
        method,
        data: formData,
      });

      console.log("Respuesta del servidor:", response.data);
      toast.success("¡Mensaje enviado exitosamente! Te contactaremos pronto.");
      setFormData({ 
        name: "", 
        email: "", 
        phone: "",
        subject: "", 
        message: "",
        userType: ""
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast.error("Error al enviar el mensaje. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de usuario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaUser className="inline mr-2 text-blue-600" />
          Soy un:
        </label>
        <select
          name="userType"
          value={formData.userType}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          required
        >
          <option value="">Selecciona una opción</option>
          <option value="owner">Dueño de mascota</option>
          <option value="walker">Paseador interesado</option>
          <option value="other">Otro</option>
        </select>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre completo *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Tu nombre completo"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correo electrónico *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="tu@email.com"
          required
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="+57 300 123 4567"
        />
      </div>

      {/* Asunto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Asunto *
        </label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          required
        >
          <option value="">Selecciona un asunto</option>
          <option value="info-general">Información general</option>
          <option value="como-funciona">¿Cómo funciona la plataforma?</option>
          <option value="ser-paseador">Quiero ser paseador</option>
          <option value="problema-tecnico">Problema técnico</option>
          <option value="sugerencia">Sugerencia o mejora</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaComment className="inline mr-2 text-blue-600" />
          Mensaje *
        </label>
        <textarea
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
          placeholder="Cuéntanos en qué podemos ayudarte..."
          required
        ></textarea>
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Enviando...
          </>
        ) : (
          <>
            <FaEnvelope className="mr-2" />
            <FaPaw className="mr-2" />
            Enviar mensaje
          </>
        )}
      </button>
    </form>
  );
};

export default FormContact;
