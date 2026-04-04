import React, { useState, useEffect, useContext } from "react";
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Context from '../context/index'; // Asegúrate de que la ruta sea correcta
import SummaryApi from '../common/index'; // Asegúrate de que la ruta sea correcta
import { toast } from 'react-toastify';
import './BotonFavorito.css'; // Asegúrate de que la ruta sea correcta

const BotonFavorito = ({ productId }) => {
    const { favorites, setFavorites, authToken } = useContext(Context);  // Obtenemos el token del contexto
    const [isFavorite, setIsFavorite] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Verificar si el producto está en favoritos al cargar el componente
    useEffect(() => {
        const favoriteCheck = favorites?.some(fav =>
            fav.productId?._id === productId || fav.productId === productId
        );
        setIsFavorite(favoriteCheck);
    }, [favorites, productId]);

    // Manejar clic en el botón de favoritos
    const handleFavoriteClick = async () => {
        if (!authToken) {
            toast.error('Debes iniciar sesión para agregar a favoritos');
            return;
        }

        if (isProcessing) return;
        setIsProcessing(true);

        try {
            if (isFavorite) {
                await removeFavorite(productId);
                setFavorites(prevFavorites =>
                    prevFavorites.filter(fav => fav.productId !== productId)
                );
                setIsFavorite(false);
                toast.success('Producto eliminado de favoritos');
            } else {
                const newFavorite = await addFavorite(productId);
                if (newFavorite) {
                    setFavorites(prevFavorites => [...prevFavorites, newFavorite]);
                    setIsFavorite(true);
                    toast.success('Producto agregado a favoritos');
                }
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Agregar a favoritos
    const addFavorite = async (productId) => {
        try {
            const response = await fetch(SummaryApi.addFavorite.url, {
                method: 'post',
                headers: {
                    'Authorization': `Bearer ${authToken}`,  // Incluir el token en la solicitud
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId }),
                credentials: 'include',
            });

            if (response.status === 201) {
                const data = await response.json();
                return data.favorite;
            } else if (response.status === 409) {
                toast.info('El producto ya está en favoritos');
                return null;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar a favoritos');
            }
        } catch (error) {
            throw error;
        }
    };

    // Eliminar de favoritos
    const removeFavorite = async (productId) => {
        try {
            const response = await fetch(SummaryApi.removeFavorite(productId).url, {
                method: 'delete',
                headers: {
                    'Authorization': `Bearer ${authToken}`,  // Incluir el token en la solicitud
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
            });

            if (response.status === 204) {
                return;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar de favoritos');
            }
        } catch (error) {
            throw error;
        }
    };

    // Manejar errores
    const handleError = (error) => {
        console.error('Error al cambiar el estado de favorito:', error.message);
        toast.error(`Error: ${error.message}`);
    };

    return (
        <div
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
            style={{ cursor: 'pointer' }}
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
        >
            {isFavorite ? (
                <FaHeart className="icon-favorite" size={20} />
            ) : (
                <FaRegHeart className="icon-not-favorite" size={20} />
            )}
        </div>
    );
};

export default BotonFavorito;
