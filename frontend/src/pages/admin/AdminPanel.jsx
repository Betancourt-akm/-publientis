import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaRegUserCircle, FaUsers, FaUserShield, FaHandshake, FaChartLine, FaComments, FaClipboardList, FaTasks, FaGraduationCap, FaCheckCircle, FaBriefcase, FaCog, FaChevronDown, FaChevronRight, FaBox, FaShoppingCart, FaMoneyBillWave } from "react-icons/fa";
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

    const [showLegacy, setShowLegacy] = useState(false);

    // === SECCIÓN 1: Gestión Académica (Prioridad) ===
    const academicLinks = [
        {
            path: "/admin/control-panel",
            label: "Control de Vacantes",
            icon: <FaTasks className="mr-2" />,
            description: "Aprobaciones, semáforo y convenios",
            external: true
        },
        {
            path: "/dashboard/matchmaking",
            label: "Matchmaking",
            icon: <FaHandshake className="mr-2" />,
            description: "Conexiones egresados-organizaciones",
            external: true
        },
        {
            path: "/employability-dashboard",
            label: "Empleabilidad",
            icon: <FaChartLine className="mr-2" />,
            description: "Métricas de vinculación laboral",
            external: true
        },
        {
            path: "/jobs/approval",
            label: "Aprobar Ofertas",
            icon: <FaCheckCircle className="mr-2" />,
            description: "Ofertas pendientes de aprobación",
            external: true
        },
    ];

    // === SECCIÓN 2: Administración Plataforma ===
    const adminLinks = [
        {
            path: "all-users",
            label: "Usuarios",
            icon: <FaUsers className="mr-2" />,
            description: "Gestionar roles y cuentas"
        },
        {
            path: "manual-data",
            label: "Gestión Manual",
            icon: <FaClipboardList className="mr-2" />,
            description: "Convenios, vacantes y tags"
        },
        {
            path: "chat",
            label: "Mensajería",
            icon: <FaComments className="mr-2" />,
            description: "Chat con usuarios"
        },
    ];

    // === SECCIÓN 3: Recursos Secundarios (Legacy E-commerce) ===
    const legacyLinks = [
        {
            path: "productos",
            label: "Recursos",
            icon: <FaBox className="mr-2" />,
            description: "Publicaciones y materiales"
        },
        {
            path: "ordenes",
            label: "Transacciones",
            icon: <FaShoppingCart className="mr-2" />,
            description: "Historial de transacciones"
        },
        {
            path: "vendedores",
            label: "Editores",
            icon: <FaGraduationCap className="mr-2" />,
            description: "Gestionar publicadores"
        },
    ];

    const renderNavSection = (title, links, icon) => (
        <div className="mb-2">
            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                {title}
            </div>
            {links.map((link, index) => (
                <Link 
                    key={index}
                    to={link.external ? link.path : `/admin-panel/${link.path}`} 
                    className={`
                        px-4 py-3 mx-2 mb-1 rounded-lg transition-all duration-200 flex items-center
                        ${isActive(link.path) 
                            ? 'bg-gradient-to-r from-[#1F3C88] to-[#2563EB] text-white shadow-lg' 
                            : 'hover:bg-blue-50 text-gray-700 hover:text-[#1F3C88]'}
                    `}
                >
                    {link.icon}
                    <div className="flex-1">
                        <div className="font-medium text-sm">{link.label}</div>
                        <div className={`text-xs ${isActive(link.path) ? 'text-blue-200' : 'text-gray-400'}`}>
                            {link.description}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );

  return (
    <div className='min-h-[calc(100vh-120px)] flex flex-col md:flex-row'>
        {/* Sidebar para Desktop */}
        <aside className='bg-white min-h-full w-full max-w-64 shadow-md hidden md:block'>
            <div className='h-32 flex justify-center items-center flex-col border-b border-gray-100 mb-2'>
                <div className='text-5xl cursor-pointer relative flex justify-center'>
                    {
                    user?.profilePic ? (
                        <img src={user?.profilePic} className='w-20 h-20 rounded-full object-cover border-2 border-blue-100' alt={user?.name} />
                    ) : (
                        <FaRegUserCircle className="text-[#1F3C88]"/>
                    )
                    }
                    <div className="absolute -bottom-1 -right-1 bg-[#1F3C88] text-white p-1 rounded-full">
                        <FaUserShield size={14} />
                    </div>
                </div>
                <p className='capitalize text-lg font-semibold mt-2'>{user?.name}</p>
                <p className='text-sm text-[#1F3C88] font-medium'>Administrador</p>
            </div>

            {/* Navegación por secciones */}
            <div className="py-2 overflow-y-auto" style={{maxHeight: 'calc(100vh - 200px)'}}>
                {renderNavSection('Gestión Académica', academicLinks)}
                
                <div className="border-t border-gray-100 my-2"></div>
                {renderNavSection('Administración', adminLinks)}
                
                <div className="border-t border-gray-100 my-2"></div>
                <div className="px-4 py-2">
                    <button 
                        onClick={() => setShowLegacy(!showLegacy)}
                        className="flex items-center w-full text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showLegacy ? <FaChevronDown className="mr-1" size={10} /> : <FaChevronRight className="mr-1" size={10} />}
                        Recursos
                    </button>
                </div>
                {showLegacy && legacyLinks.map((link, index) => (
                    <Link 
                        key={index}
                        to={`/admin-panel/${link.path}`}
                        className={`
                            px-4 py-2 mx-2 mb-1 rounded-lg transition-all duration-200 flex items-center text-sm
                            ${isActive(link.path) 
                                ? 'bg-gray-200 text-gray-800' 
                                : 'hover:bg-gray-50 text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        {link.icon}
                        <div className="flex-1">
                            <div className="font-medium">{link.label}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </aside>

        {/* Navbar móvil */}
        <div className="md:hidden bg-white shadow-sm p-3 overflow-x-auto whitespace-nowrap">
            <div className="flex space-x-2">
                {[...academicLinks, ...adminLinks].map((link, index) => (
                    <Link 
                        key={index}
                        to={link.external ? link.path : `/admin-panel/${link.path}`} 
                        className={`px-3 py-2 rounded-md flex-shrink-0 flex items-center text-sm ${
                            isActive(link.path) 
                                ? 'bg-blue-50 text-[#1F3C88] font-medium' 
                                : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        {link.icon}
                        <span className="truncate">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>

        {/* Contenido principal */}
        <main className='w-full h-full p-4 bg-gray-50'>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
                <p className="text-sm text-gray-500">
                    Gestión académica y administrativa de Publientis
                </p>
            </div>
            
            <Outlet/>
        </main>
    </div>
  )
}

export default AdminPanel