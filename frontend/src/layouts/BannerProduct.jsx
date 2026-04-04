import React, { useEffect, useState, useCallback } from 'react';
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { Link } from 'react-router-dom'; // Importa Link desde react-router-dom
import './BannerProduct.css';

// URLs de imágenes para desktop y mobile
const images = [
  {
    desktop: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    mobile: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    desktop: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    mobile: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    desktop: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    mobile: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    desktop: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    mobile: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    desktop: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    mobile: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    desktop: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    mobile: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
];

const BannerProduct = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="banner-container">
      <div className="slider">
        <button onClick={prevSlide} className="nav-button">
          <FaAngleLeft />
        </button>

        <div className="slides" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((img, index) => (
            <div className="slide" key={index}>
              <img src={img.desktop} alt={`Slide ${index}`} className="desktop" />
              <img src={img.mobile} alt={`Slide mobile ${index}`} className="mobile" />
            </div>
          ))}
        </div>

        <button onClick={nextSlide} className="nav-button">
          <FaAngleRight />
        </button>
      </div>

      {/* Botón que redirige a /componentes */}
      <Link to="/componentes" className="banner-button">
        Ver Componentes
      </Link>
    </div>
  );
};

export default BannerProduct;