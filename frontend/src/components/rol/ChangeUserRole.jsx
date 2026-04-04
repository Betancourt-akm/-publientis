import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { toast } from 'react-toastify';
import SummaryApi from '../../common';

const ChangeUserRole = ({ 
  name, 
  email, 
  tel,
  role, 
  userId, 
  onClose, 
  callFunc 
}) => {
  const [userRole, setUserRole] = useState(role);
  const [updating, setUpdating] = useState(false);

  const handleOnChangeSelect = (e) => {
    setUserRole(e.target.value);
  };

  const updateUserRole = async () => {
    try {
      setUpdating(true);
      
      const response = await fetch(SummaryApi.updateUser.url, {
        method: SummaryApi.updateUser.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          role: userRole
        })
      });

      const dataResponse = await response.json();

      if (dataResponse.success) {
        toast.success(dataResponse.message || 'Rol actualizado exitosamente');
        onClose();
        callFunc(); // Recargar la lista de usuarios
      } else {
        toast.error(dataResponse.message || 'Error al actualizar el rol');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol del usuario');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 w-full h-full z-50 flex justify-center items-center bg-slate-200 bg-opacity-50'>
      <div className='mx-auto bg-white shadow-md p-6 w-full max-w-sm rounded-lg'>
        <div className='flex justify-between items-center pb-3 border-b'>
          <h2 className='font-bold text-lg'>Cambiar Rol de Usuario</h2>
          <button 
            className='text-2xl hover:text-red-600 transition-colors' 
            onClick={onClose}
          >
            <IoMdClose />
          </button>
        </div>

        <div className='mt-4 space-y-3'>
          <div>
            <p className='text-sm text-gray-600'>Nombre:</p>
            <p className='font-medium'>{name}</p>
          </div>

          <div>
            <p className='text-sm text-gray-600'>Email:</p>
            <p className='font-medium'>{email}</p>
          </div>

          {tel && (
            <div>
              <p className='text-sm text-gray-600'>Teléfono:</p>
              <p className='font-medium'>{tel}</p>
            </div>
          )}

          <div>
            <p className='text-sm text-gray-600 mb-2'>Rol:</p>
            <select 
              className='w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              value={userRole} 
              onChange={handleOnChangeSelect}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="DOCENTE">DOCENTE</option>
              <option value="STUDENT">STUDENT</option>
              <option value="FACULTY">FACULTY</option>
              <option value="VISITOR">VISITOR</option>
            </select>
          </div>
        </div>

        <button 
          className='w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
          onClick={updateUserRole}
          disabled={updating}
        >
          {updating ? 'Actualizando...' : 'Cambiar Rol'}
        </button>
      </div>
    </div>
  );
};

export default ChangeUserRole;
