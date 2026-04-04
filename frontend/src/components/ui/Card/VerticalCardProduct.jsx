import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import fetchCategoryWiseProduct from '../../../helpers/fetchCategoryWiseProduct';
import { Link } from 'react-router-dom';
import addToCart from '../../../helpers/addToCart';
import Context from '../../../context';
import './VerticalCardProduct.css'; 
import displayCOPCurrency from '../../../helpers/displayCurrency';
import { ProductWishlistButton } from '../../WishlistButton';
const VerticalCardProduct = ({ category, heading }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCartButton, setShowCartButton] = useState(null); // Para mostrar botón "Ir al carrito"
    const loadingList = new Array(8).fill(null); // Ajusta el número según tus necesidades

    const { fetchUserAddToCart } = useContext(Context);
    const dispatch = useDispatch();

    const handleAddToCart = async (e, id) => {
        e.preventDefault(); // Evita que el enlace <Link> se dispare al hacer clic en "Añadir al Carrito"
        const result = await addToCart(e, id, dispatch);
        if (result.success) {
            fetchUserAddToCart(); // Actualizar contador en navbar
            setShowCartButton(id); // Mostrar botón "Ir al carrito" para este producto
            // Ocultar el botón después de 3 segundos
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

    return (
        <div className="vertical-card-container">
            <div className="vertical-card-content">
                {loading ? (
                    loadingList.map((_, index) => (
                        <div key={index} className="product-card loading">
                            {/* Contenido de carga */}
                            <div className="product-image-placeholder"></div>
                            <div className="product-info">
                                <div className="loading-placeholder" style={{ width: '80%', height: '20px' }}></div>
                                <div className="loading-placeholder" style={{ width: '60%', height: '16px' }}></div>
                                <div className="loading-placeholder" style={{ width: '40%', height: '16px' }}></div>
                                <div className="loading-placeholder" style={{ width: '50%', height: '20px' }}></div>
                            </div>
                        </div>
                    ))
                ) : (
                    data.map((product) => (
                        <div key={product._id} className="product-card">
                            <Link to={`/product/${product._id}`} className="product-link">
                                <div className="h-40 bg-gray-100 flex items-center justify-center rounded-t-md overflow-hidden relative">
                                    <img
                                        src={product.productImage[0]}
                                        className="object-cover h-full w-full transform hover:scale-105 transition-transform duration-300"
                                        alt={product.productName || 'Imagen del Producto'}
                                    />
                                    {/* Botón de favoritos */}
                                    <ProductWishlistButton productId={product._id} />
                                </div>
                                <div className="product-info">
                                    <h2 className="product-name">{product.productName}</h2>
                                    <p className="product-category capitalize">{product.category}</p>
                                    <p className="product-brand capitalize">{product.brandName}</p>
                                    <div className="product-prices">
                                        <p className="product-selling-price">
                                            {displayCOPCurrency(product.sellingPrice)}
                                        </p>
                                        <p className="product-original-price">
                                            {displayCOPCurrency(product.price)}
                                        </p>
                                    </div>
                                    <div className="product-actions">
                                        {showCartButton === product._id ? (
                                            <Link 
                                                to="/cart" 
                                                className="go-to-cart-btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                🛒 Ir al Carrito
                                            </Link>
                                        ) : (
                                            <button
                                                className="add-to-cart-btn"
                                                onClick={(e) => handleAddToCart(e, product._id)}
                                            >
                                                Añadir
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
    );
};

export default VerticalCardProduct;
