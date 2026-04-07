import React, { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../../context";
import { FaUser, FaEnvelope, FaPhone, FaUserTag, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEdit, FaGoogle, FaCamera, FaTimes, FaLock, FaHome, FaMapMarkerAlt, FaSave, FaFilePdf } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import SummaryApi from "../../common";
import { toast } from "react-toastify";
import CVGenerator from "../../components/cv/CVGenerator";

/**
 * Página de perfil completa para mostrar todos los datos del usuario.
 * - Información personal completa
 * - Estado de verificación
 * - Rol y permisos
 * - Diseño moderno y responsive
 */
const Perfil = () => {
  const { user, fetchUserDetails } = useContext(Context);
  const navigate = useNavigate();
  
  // Estados para cambiar foto de perfil
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para edición de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  // Estados para contraseña de usuarios Google
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  });

  // Estado para el generador de CV
  const [showCVGenerator, setShowCVGenerator] = useState(false);

  // Redirigir al login si no hay usuario autenticado
  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      console.log('Usuario no autenticado, redirigiendo al login...');
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Mostrar loading solo si hay token pero no user (cargando)
  if (!user && localStorage.getItem('token')) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para obtener el color del rol
  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'WALKER':
        return 'bg-blue-100 text-blue-800';
      case 'OWNER':
        return 'bg-green-100 text-green-800';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del rol en español
  const getRoleText = (role) => {
    switch (role?.toUpperCase()) {
      case 'WALKER':
        return 'Paseador';
      case 'OWNER':
        return 'Dueño de Mascota';
      case 'ADMIN':
        return 'Administrador';
      default:
        return 'Usuario';
    }
  };

  // Manejar selección de imagen
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen');
        return;
      }
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cancelar selección de imagen
  const handleCancelImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Subir foto de perfil
  const handleUploadProfilePicture = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profilePic', selectedImage);

    try {
      const response = await fetch(SummaryApi.updateProfilePicture.url, {
        method: SummaryApi.updateProfilePicture.method,
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Foto de perfil actualizada exitosamente');
        await fetchUserDetails();
        handleCancelImage();
      } else {
        toast.error(data.message || 'Error al actualizar la foto');
      }
    } catch (error) {
      console.error('Error subiendo foto:', error);
      toast.error('Error al subir la foto de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  // Iniciar edición de perfil
  const handleStartEdit = () => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || user.tel || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || ''
      }
    });
    setIsEditing(true);
  };

  // Guardar cambios del perfil
  const handleSaveProfile = async () => {
    try {
      const response = await fetch(SummaryApi.updateUser.url, {
        method: SummaryApi.updateUser.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id,
          ...editForm
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Perfil actualizado exitosamente');
        await fetchUserDetails();
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  // Establecer contraseña para usuarios Google
  const handleSetPassword = async () => {
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch(SummaryApi.setPassword.url, {
        method: SummaryApi.setPassword.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: passwordForm.password
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Contraseña establecida exitosamente');
        setShowPasswordModal(false);
        setPasswordForm({ password: '', confirmPassword: '' });
        await fetchUserDetails();
      } else {
        toast.error(data.message || 'Error al establecer la contraseña');
      }
    } catch (error) {
      console.error('Error estableciendo contraseña:', error);
      toast.error('Error al establecer la contraseña');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tarjeta Principal */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Header de la tarjeta */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
              <div className="flex items-center gap-2">
                {/* Botón para usuarios Google sin contraseña */}
                {user.provider === 'google' && !user.password && (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaLock className="text-sm" />
                    Establecer Contraseña
                  </button>
                )}
                
                {/* Botón cambiar contraseña (solo si tiene contraseña) */}
                {user.password && (
                  <Link 
                    to="/change-password" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit className="text-sm" />
                    Cambiar Contraseña
                  </Link>
                )}
                
                {/* Botón editar perfil */}
                {!isEditing ? (
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FaEdit className="text-sm" />
                    Editar Perfil
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaSave className="text-sm" />
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      <FaTimes /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Foto de perfil y nombre */}
            <div className="flex items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-lg">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-3xl text-gray-400" />
                  )}
                </div>
                
                {/* Botón para cambiar foto */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors"
                  title="Cambiar foto de perfil"
                >
                  <FaCamera className="text-sm" />
                </button>
                
                {/* Input oculto para seleccionar archivo */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{user.name || "Sin nombre"}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    <FaUserTag className="mr-1" />
                    {getRoleText(user.role)}
                  </span>
                  {user.provider === 'google' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FaGoogle className="mr-1" />
                      Google
                    </span>
                  )}
                </div>
                
                {/* Acciones de imagen seleccionada */}
                {selectedImage && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleUploadProfilePicture}
                      disabled={isUploading}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Subiendo...
                        </>
                      ) : (
                        '✓ Guardar foto'
                      )}
                    </button>
                    <button
                      onClick={handleCancelImage}
                      disabled={isUploading}
                      className="px-4 py-1.5 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <FaTimes /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Información detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  Nombre Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.name || "No especificado"}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" />
                  Correo Electrónico
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.email || "No especificado"}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <FaPhone className="text-gray-400" />
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.phone || user.tel || "No especificado"}</p>
                )}
              </div>

              {/* Dirección - Opcional */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <FaHome className="text-gray-400" />
                  Dirección (Opcional)
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.address.street}
                      onChange={(e) => setEditForm({...editForm, address: {...editForm.address, street: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Calle y número"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editForm.address.city}
                        onChange={(e) => setEditForm({...editForm, address: {...editForm.address, city: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ciudad"
                      />
                      <input
                        type="text"
                        value={editForm.address.state}
                        onChange={(e) => setEditForm({...editForm, address: {...editForm.address, state: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Estado/Provincia"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editForm.address.zipCode}
                        onChange={(e) => setEditForm({...editForm, address: {...editForm.address, zipCode: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Código Postal"
                      />
                      <input
                        type="text"
                        value={editForm.address.country}
                        onChange={(e) => setEditForm({...editForm, address: {...editForm.address, country: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="País"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-900">
                    {user.address ? (
                      <div className="space-y-1">
                        <p className="font-medium">{user.address.street}</p>
                        <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                        <p>{user.address.country}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No especificada</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estado de la cuenta */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de la Cuenta</h3>
              
              <div className="space-y-4">
                {/* Verificación de email */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Verificado</span>
                  <div className="flex items-center gap-1">
                    {user.isVerified ? (
                      <>
                        <FaCheckCircle className="text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Verificado</span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="text-red-500" />
                        <span className="text-sm text-red-600 font-medium">Pendiente</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional simplificada */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Cuenta</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Miembro desde:</span>
                  <p className="text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
                </div>
                
                <div>
                  <span className="text-gray-500">Última actualización:</span>
                  <p className="text-gray-900 mt-1">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para establecer contraseña (usuarios Google) */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Establecer Contraseña</h3>
            <p className="text-gray-600 mb-6">
              Agrega una contraseña para poder iniciar sesión con tu email y contraseña, además de Google.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ password: '', confirmPassword: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSetPassword}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Establecer Contraseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón para descargar CV - visible para estudiantes */}
      {['STUDENT', 'USER'].includes(user?.role) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 mt-6 max-w-5xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <FaFilePdf className="text-4xl text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Genera tu CV Pedagógico
              </h3>
              <p className="text-gray-600 mb-4">
                Descarga tu currículum profesional en formato PDF con toda tu información académica, 
                experiencia pedagógica y portafolio en un diseño institucional.
              </p>
              <button
                onClick={() => setShowCVGenerator(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <FaFilePdf />
                Descargar CV en PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Generador de CV */}
      {showCVGenerator && (
        <CVGenerator onClose={() => setShowCVGenerator(false)} />
      )}
    </div>
  );
};

export default Perfil;
