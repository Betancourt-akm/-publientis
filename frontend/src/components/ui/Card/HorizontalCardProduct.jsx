import { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import fetchCategoryWiseProduct from '../../../helpers/fetchCategoryWiseProduct';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import addToCart from '../../../helpers/addToCart';
import Context from '../../../context';
import './HorizontalCardProduct.css'; // Importa el nuevo archivo CSS
import displayCOPCurrency from '../../../helpers/displayCurrency';

const HorizontalCardProduct = ({ category, heading }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCartButton, setShowCartButton] = useState(null);
    const loadingList = new Array(13).fill(null);
    const scrollElement = useRef();
    const { fetchUserAddToCart } = useContext(Context);
    const dispatch = useDispatch();

    const handleAddToCart = async (e, id) => {
        e.preventDefault(); 
        const result = await addToCart(e, id, dispatch);
        if (result.success) {
            fetchUserAddToCart();
            setShowCartButton(id);
            setTimeout(() => setShowCartButton(null), 3000);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        const categoryProduct = await fetchCategoryWiseProduct(category);
        setLoading(false);

        if (categoryProduct && categoryProduct.data) {
            setData(categoryProduct.data);
        } else {
            setData([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, [category]);

    const scrollRight = () => {
        scrollElement.current.scrollLeft += 300;
    };

    const scrollLeft = () => {
        scrollElement.current.scrollLeft -= 300;
    };

    return (
        <div className="contenedor-tarjeta-horizontal">
            {heading && <h2 className="encabezado-tarjeta-horizontal">{heading}</h2>}
            <div className="envoltura-tarjeta-horizontal">
                <button className="boton-desplazar izquierda" onClick={scrollLeft}>
                    <FaAngleLeft />
                </button>
                <button className="boton-desplazar derecha" onClick={scrollRight}>
                    <FaAngleRight />
                </button>
                
                <div className="contenido-tarjeta-horizontal" ref={scrollElement}>
                    {loading ? (
                        loadingList.map((_, index) => (
                            <div key={index} className="tarjeta-producto cargando">
                                <div className="imagen-producto-sustituto"></div>
                                <div className="informacion-producto">
                                    <div className="placeholder-cargando" style={{ width: '80%', height: '20px' }}></div>
                                    <div className="placeholder-cargando" style={{ width: '60%', height: '16px' }}></div>
                                    <div className="placeholder-cargando" style={{ width: '40%', height: '16px' }}></div>
                                    <div className="placeholder-cargando" style={{ width: '50%', height: '20px' }}></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        data.map((product) => (
                            <div key={product._id} className="tarjeta-producto">
                                <Link to={`product/${product._id}`} className="enlace-producto">
                                    <div className="h-40 bg-gray-100 flex items-center justify-center rounded-t-md overflow-hidden">
                                        <img 
                                            src={product.productImage[0]} 
                                            alt={product.productName || 'Imagen del producto'} 
                                            className="object-cover h-full w-full transform hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="informacion-producto">
                                        <h2 className="nombre-producto">{product.productName}</h2>
                                        <p className="marca-producto capitalize">{product.brandName}</p>
                                        <div className="precios-producto">
                                            <p className="precio-venta-producto">{displayCOPCurrency(product.sellingPrice)}</p>
                                            <p className="precio-original-producto">{displayCOPCurrency(product.price)}</p>
                                        </div>
                                        <div className="acciones-producto">
                                            {showCartButton === product._id ? (
                                                <Link 
                                                    to="/cart" 
                                                    className="boton-ir-carrito bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    🛒 Ir al Carrito
                                                </Link>
                                            ) : (
                                                <button 
                                                    className="boton-agregar-carrito" 
                                                    onClick={(e) => handleAddToCart(e, product._id)}
                                                >
                                                    reserva ahora
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HorizontalCardProduct;
