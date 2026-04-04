import { useContext } from 'react';
import scrollTop from '../../../helpers/scrollTop';
import Context from '../../../context';
import addToCart from '../../../helpers/addToCart';
import { Link } from 'react-router-dom';
import './VerticalCard.css'; // Importa el archivo CSS
import displayCOPCurrency from '../../../helpers/displayCurrency';

const VerticalCard = ({ loading, data = [] }) => {
  const loadingList = new Array(13).fill(null);
  const { fetchUserAddToCart } = useContext(Context);

  const handleAddToCart = async (e, id) => {
    e.preventDefault(); // Evita que el botón de añadir a reserva navegue al enlace
    await addToCart(e, id);
    fetchUserAddToCart();
  };

  return (
    <div className="vertical-card-custom-grid">
      {loading
        ? loadingList.map((_, index) => (
            <div key={index} className="vertical-card-custom loading">
              <div className="product-image-placeholder-custom"></div>
              <div className="product-info-custom">
                <div className="loading-placeholder-custom short"></div>
                <div className="loading-placeholder-custom"></div>
                <div className="price-placeholder-custom"></div>
                <div className="loading-placeholder-custom button"></div>
              </div>
            </div>
          ))
        : data.map((product) => (
            <div key={product._id} className="vertical-card-custom-container">
              <Link
              
                to={`/product/${product._id}`}
                className="vertical-card-custom"
                onClick={scrollTop}
              >
                <div className="product-image-custom">
                  <img
                    src={product.productImage[0]}
                    className="product-image-content-custom"
                    alt={product.productName || 'Product Image'}
                  />
                </div>
                <div className="product-info-custom">
                  <h2 className="product-name-custom">{product.productName}</h2>
                  <p className="product-category-custom">{product.category}</p>
                  <div className="product-prices-custom">
                    <p className="product-selling-price-custom">
                      {displayCOPCurrency(product.sellingPrice)}
                    </p>
                    <p className="product-original-price-custom">
                      {displayCOPCurrency(product.price)}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                className="add-to-cart-btn-custom"
                onClick={(e) => handleAddToCart(e, product._id)}
              >
                Añadir a reserva
              </button>
            </div>
          ))}
    </div>
  );
};

export default VerticalCard;
