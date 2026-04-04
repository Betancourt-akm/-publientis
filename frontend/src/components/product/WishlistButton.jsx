import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useWishlist from '../../hooks/useWishlist';

const WishlistButton = ({ 
  productId, 
  className = '', 
  size = 'md',
  showToast = true,
  variant = 'default',
  children 
}) => {
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId, showToast);
  };

  // Tamaños
  const sizes = {
    sm: 'text-sm p-1',
    md: 'text-base p-2',
    lg: 'text-lg p-3',
    xl: 'text-xl p-4'
  };

  // Variantes
  const variants = {
    default: `rounded-full transition-all duration-200 ${
      inWishlist 
        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
        : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
    }`,
    minimal: `transition-colors duration-200 ${
      inWishlist 
        ? 'text-red-500' 
        : 'text-gray-400 hover:text-red-500'
    }`,
    solid: `rounded-full transition-all duration-200 ${
      inWishlist 
        ? 'bg-red-500 text-white hover:bg-red-600' 
        : 'bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white'
    }`,
    outline: `rounded-full border-2 transition-all duration-200 ${
      inWishlist 
        ? 'border-red-500 bg-red-500 text-white hover:bg-red-600' 
        : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
    }`,
    floating: `rounded-full shadow-md backdrop-blur-sm transition-all duration-200 ${
      inWishlist 
        ? 'bg-red-500/90 text-white hover:bg-red-600/90' 
        : 'bg-white/90 text-gray-600 hover:bg-red-50/90 hover:text-red-500'
    }`
  };

  const baseClasses = `
    inline-flex items-center justify-center
    ${sizes[size]}
    ${variants[variant]}
    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  if (children) {
    // Versión con children personalizado
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={baseClasses}
        title={inWishlist ? 'Remover de favoritos' : 'Agregar a favoritos'}
      >
        {children}
      </button>
    );
  }

  // Versión con icono de corazón
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={baseClasses}
      title={inWishlist ? 'Remover de favoritos' : 'Agregar a favoritos'}
    >
      {loading ? (
        <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
      ) : inWishlist ? (
        <FaHeart className="animate-pulse" />
      ) : (
        <FaRegHeart />
      )}
    </button>
  );
};

// Componente especializado para cards de producto
export const ProductWishlistButton = ({ productId, className = '' }) => (
  <WishlistButton
    productId={productId}
    variant="floating"
    size="md"
    className={`absolute top-3 right-3 ${className}`}
  />
);

// Componente especializado para listas
export const ListWishlistButton = ({ productId, className = '' }) => (
  <WishlistButton
    productId={productId}
    variant="minimal"
    size="sm"
    className={className}
  />
);

// Componente con texto
export const WishlistButtonWithText = ({ productId, className = '' }) => {
  const { isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  return (
    <WishlistButton
      productId={productId}
      variant="outline"
      size="md"
      className={`space-x-2 px-4 py-2 ${className}`}
    >
      {inWishlist ? <FaHeart /> : <FaRegHeart />}
      <span className="text-sm font-medium">
        {inWishlist ? 'En Favoritos' : 'Agregar a Favoritos'}
      </span>
    </WishlistButton>
  );
};

export default WishlistButton;
