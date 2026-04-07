import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaRegUserCircle, FaUsers, FaUserShield, FaBox, FaShoppingCart, FaChartLine, FaMoneyBillWave, FaComments, FaClipboardList, FaTasks } from "react-icons/fa";
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import ROLE from '../../common/role';

const AdminPanel = () => {
    const user = useSelector(state => state?.user?.user)
    const navigate = useNavigate()
    const location = useLocation();

    // Verificar si una ruta está activa
    const isActive = (path) => {
        return location.pathname.includes(path);
    };

    useEffect(()=>{
        console.log('AdminPanel - Estado del usuario:', user);
        console.log('AdminPanel - Rol del usuario:', user?.role);
        console.log('AdminPanel - ROLE.ADMIN:', ROLE.ADMIN);
        console.log('AdminPanel - ¿Es admin?:', user?.role === ROLE.ADMIN);
        
        if(!user) {
            console.log('AdminPanel - Usuario no encontrado, redirigiendo...');
            navigate("/");
            return;
        }
        
        if(user.role !== ROLE.ADMIN){
            console.log('AdminPanel - Usuario no es admin, redirigiendo...');
            navigate("/");
        } else {
            console.log('AdminPanel - Usuario es admin, permitiendo acceso');
        }
    },[user, navigate])

    // Enlaces de navegación con iconos y descripción
    const navLinks = [
        {
            path: "/admin/control-panel",
            label: "Control de Vacantes",
            icon: <FaTasks className="mr-2" />,
            description: "Aprobaciones, semáforo y convenios",
            external: true
        },
        {
            path: "productos",
            label: "Productos",
            icon: <FaBox className="mr-2" />,
            description: "Gestionar catálogo de productos"
        },
        {
            path: "vendedores",
            label: "Vendedores",
            icon: <FaUsers className="mr-2" />,
            description: "Aprobar vendedores y productos"
        },
        {
            path: "ordenes",
            label: "Órdenes",
            icon: <FaShoppingCart className="mr-2" />,
            description: "Ver y gestionar órdenes de clientes"
        },
        {
            path: "chat",
            label: "Chat",
            icon: <FaComments className="mr-2" />,
            description: "Mensajería con clientes"
        },
        {
            path: "ventas",
            label: "Panel de Ventas",
            icon: <FaChartLine className="mr-2" />,
            description: "Estadísticas y métricas de ventas"
        },
        {
            path: "financiero",
            label: "Panel Financiero",
            icon: <FaMoneyBillWave className="mr-2" />,
            description: "Costos, beneficios y balances"
        },
        {
            path: "all-users",
            label: "Usuarios",
            icon: <FaUsers className="mr-2" />,
            description: "Administrar usuarios de la plataforma"
        },
        {
            path: "manual-data",
            label: "Gestión Manual",
            icon: <FaClipboardList className="mr-2" />,
            description: "Registrar convenios, vacantes y tags manualmente"
        }
    ];

  return (
    <div className='min-h-[calc(100vh-120px)] flex flex-col md:flex-row'>
        {/* Sidebar para Desktop */}
        <aside className='bg-white min-h-full w-full max-w-64 shadow-md hidden md:block'>
            <div className='h-32 flex justify-center items-center flex-col border-b border-gray-100 mb-4'>
                <div className='text-5xl cursor-pointer relative flex justify-center'>
                    {
                    user?.profilePic ? (
                        <img src={user?.profilePic} className='w-20 h-20 rounded-full object-cover border-2 border-teal-100' alt={user?.name} />
                    ) : (
                        <FaRegUserCircle className="text-teal-600"/>
                    )
                    }
                    <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full">
                        <FaUserShield size={14} />
                    </div>
                </div>
                <p className='capitalize text-lg font-semibold mt-2'>{user?.name}</p>
                <p className='text-sm text-teal-600 font-medium'>{user?.role}</p>
            </div>

            {/* Navegación */}       
            <div>   
                <nav className='grid gap-1 p-3'>
                    {navLinks.map((link, index) => (
                        <Link 
                            key={index}
                            to={link.external ? link.path : `/admin/${link.path}`} 
                            className={`
                                px-4 py-3 mb-2 rounded-lg transition-all duration-200 flex items-center
                                ${isActive(link.path) 
                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg' 
                                    : 'hover:bg-gray-50 text-gray-700 hover:text-teal-600'}
                            `}
                        >
                            {link.icon}
                            <div className="flex-1">
                                <div className="font-medium">{link.label}</div>
                                <div className={`text-xs ${isActive(link.path) ? 'text-teal-100' : 'text-gray-400'}`}>
                                    {link.description}
                                </div>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>  
        </aside>

        {/* Navbar móvil */}
        <div className="md:hidden bg-white shadow-sm p-3 overflow-x-auto whitespace-nowrap">
            <div className="flex space-x-2">
                {navLinks.map((link, index) => (
                    <Link 
                        key={index}
                        to={link.external ? link.path : `/admin/${link.path}`} 
                        className={`px-3 py-2 rounded-md flex-shrink-0 flex items-center text-sm ${
                            isActive(link.path) 
                                ? 'bg-teal-50 text-teal-700 font-medium' 
                                : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        {link.icon}
                        <span className="truncate">{link.label.split(' ')[0]}</span>
                    </Link>
                ))}
            </div>
        </div>

        {/* Contenido principal */}
        <main className='w-full h-full p-4 bg-gray-50'>
            {/* Breadcrumb */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
                <p className="text-sm text-gray-500">
                    Gestiona todos los aspectos de la plataforma desde un solo lugar
                </p>
            </div>
            
            <Outlet/>
        </main>
    </div>
  )
}

export default AdminPanel