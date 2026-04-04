import React from 'react';
import { Link } from 'react-router-dom';
import { MdModeEditOutline, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';
import SummaryApi from '../common';

const AdminProductCard = ({ data, fetchdata }) => {

  const deleteProduct = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await axiosInstance.delete(`${SummaryApi.deleteProduct.url}/${id}`);
        toast.success(response.data.message);
        if (fetchdata) {
          fetchdata();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al eliminar el producto');
      }
    }
  };

  return (
    <div className='bg-white p-4 rounded shadow-md'>
      <div className='w-40'>
        <div className='w-32 h-32 flex justify-center items-center'>
          <img src={data?.productImage[0]} alt={data?.productName} className='mx-auto object-fill h-full' />
        </div>
        <h1 className='text-ellipsis line-clamp-2 h-12'>{data.productName}</h1>
        <div>
          <p className='font-semibold'>
            {
              new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(data.sellingPrice)
            }
          </p>
          <div className='flex gap-3 items-center mt-2'>
            <Link to={`/admin-panel/product/${data._id}`} className='p-2 bg-green-100 hover:bg-green-200 rounded-full cursor-pointer text-green-700'>
              <MdModeEditOutline />
            </Link>
            <button className='p-2 bg-red-100 hover:bg-red-200 rounded-full cursor-pointer text-red-700' onClick={() => deleteProduct(data._id)}>
              <MdDelete />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductCard;
