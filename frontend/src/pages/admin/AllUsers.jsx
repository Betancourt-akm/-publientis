import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SummaryApi from '../../common/index';
import { toast } from 'react-toastify';
import moment from 'moment';
import { MdModeEdit } from "react-icons/md";
import ChangeUserRole from '../../components/rol/ChangeUserRole';

const AllUsers = () => {
    const [allUser, setAllUsers] = useState([]);
    const [openUpdateRole, setOpenUpdateRole] = useState(false);
    const [updateUserDetails, setUpdateUserDetails] = useState({
        email: "",
        name: "",
        tel: "",
        role: "",
        _id: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllUsers = async () => {
        setLoading(true); // Indicador de carga
        setError(null);   // Reinicia el error antes de hacer la solicitud

        try {
            const response = await axiosInstance.get(SummaryApi.allUser.url);
            const dataResponse = response.data;

            if (dataResponse.success) {
                setAllUsers(dataResponse.data);
            } else {
                throw new Error(dataResponse.message || 'Error al cargar los usuarios.');
            }
        } catch (err) {
            console.error(err); // Puedes usar console.error para ver más detalles en la consola
            setError(err.message || 'Error fetching users'); // Guarda el mensaje de error
            toast.error(err.message || 'Error fetching users'); // Muestra un mensaje de error
        } finally {
            setLoading(false); // Termina el estado de carga
        }
    }

    useEffect(() => {
        fetchAllUsers();
    }, []);

    return (
        <div className='bg-white pb-4'>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className='text-red-500'>{error}</p> // Muestra el mensaje de error en rojo
            ) : (
                <table className='w-full userTable'>
                    <thead>
                        <tr className='bg-black text-white'>
                            <th>Sr.</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>tel</th>
                            <th>Role</th>
                            <th>Fecha de Creación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUser.map((el, index) => (
                            <tr key={el._id}>
                                <td>{index + 1}</td>
                                <td>{el?.name}</td>
                                <td>{el?.email}</td>
                                <td>{el?.tel}</td>
                                <td>{el?.role}</td>
                                <td>{moment(el?.createdAt).format('LL')}</td>
                                <td>
                                    <button
                                        className='bg-green-100 p-2 rounded-full cursor-pointer hover:bg-green-500 hover:text-white'
                                        onClick={() => {
                                            setUpdateUserDetails(el);
                                            setOpenUpdateRole(true);
                                        }}
                                    >
                                        <MdModeEdit />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {openUpdateRole && (
                <ChangeUserRole
                    onClose={() => setOpenUpdateRole(false)}
                    name={updateUserDetails.name}
                    email={updateUserDetails.email}
                    tel={updateUserDetails.tel}
                    role={updateUserDetails.role}
                    userId={updateUserDetails._id}
                    callFunc={fetchAllUsers}
                />
            )}
        </div>
    );
}

export default AllUsers;
