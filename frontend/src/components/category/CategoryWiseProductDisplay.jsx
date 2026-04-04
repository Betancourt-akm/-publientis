import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct';
import addToCart from '../helpers/addToCart';
import scrollTop from '../helpers/scrollTop';
import displayCOPCurrency from '../helpers/displayCurrency';
import Context from '../context';
import './CategoryWiseProductDisplay.css';

const CategoryWiseProductDisplay = ({ category, heading }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadingList = new Array(5).fill(null);
  const { fetchUserAddToCart } = useContext(Context);
  const scrollElement = useRef();

  const handleAddToCart = async (e, id) => {
    e.preventDefault();
    await addToCart(e, id);
    fetchUserAddToCart();
  };

  const fetchData = async () => {
    if (!category) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const categoryProduct = await fetchCategoryWiseProduct(category);
    setLoading(false);
    setData(categoryProduct?.data || []);
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  const scrollRight = () => {
    if (scrollElement.current) {
      scrollElement.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollElement.current) {
      scrollElement.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  return (
    <div className="carousel-container">
      <h2 className="carousel-heading">
        {heading || 'Otras motocicletas'}
      </h2>
      <div className="carousel-wrapper">
        {/* Botón para desplazar hacia la izquierda */}
        <button
          className="carousel-button carousel-button-left"
          onClick={scrollLeft}
          aria-label="Desplazar a la izquierda"
        >
          <FaAngleLeft size={24} />
        </button>
        {/* Contenedor scrollable (carrusel) */}
        <div className="carousel-content" ref={scrollElement}>
          {loading ? (
            loadingList.map((_, index) => (
              <div
                key={`loading-${index}`}
                className="carousel-card loading"
              >
                <div className="card-image-placeholder"></div>
                <div className="card-info">
                  <div className="loading-line short"></div>
                  <div className="loading-line"></div>
                  <div className="loading-line"></div>
                  <div className="loading-line button"></div>
                </div>
              </div>
            ))
          ) : data.length > 0 ? (
            data.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="carousel-card"
                onClick={scrollTop}
              >
                <div className="card-image">
                  {product.productImage?.[0] ? (
                    <img
                      src={product.productImage[0]}
                      alt={product.productName}
                      className="card-img"
                    />
                  ) : (
                    <p className="no-image">Sin Imagen</p>
                  )}
                </div>
                <div className="card-details">
                  <h3 className="card-title">
                    {product.productName || 'Producto'}
                  </h3>
                  <p className="card-category">
                    {product.category || 'Categoría'}
                  </p>
                  <div className="card-prices">
                    <span className="card-price">
                      {displayCOPCurrency(product.sellingPrice || 0)} COP
                    </span>
                    {product.price > product.sellingPrice && (
                      <span className="card-price-original">
                        {displayCOPCurrency(product.price || 0)} COP
                      </span>
                    )}
                  </div>
                  <button
                    className="card-button"
                    onClick={(e) => handleAddToCart(e, product._id)}
                  >
                    Añadir a reserva
                  </button>
                </div>
              </Link>
            ))
          ) : (
            <p className="no-products">
              No se encontraron productos relacionados.
            </p>
          )}
        </div>
        {/* Botón para desplazar hacia la derecha */}
        <button
          className="carousel-button carousel-button-right"
          onClick={scrollRight}
          aria-label="Desplazar a la derecha"
        >
          <FaAngleRight size={24} />
        </button>
      </div>
    </div>
  );
};

CategoryWiseProductDisplay.propTypes = {
  category: PropTypes.string.isRequired,
  heading: PropTypes.string,
};

export default CategoryWiseProductDisplay;
