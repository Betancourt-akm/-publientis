import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaThumbsUp, FaThumbsDown, FaFlag, FaCheckCircle, FaReply } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';

const ProductReviews = ({ productId, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1, verified
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, helpful, rating

  useEffect(() => {
    fetchReviews();
  }, [productId, filter, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        sortBy,
        ...(filter !== 'all' && filter !== 'verified' && { rating: filter }),
        ...(filter === 'verified' && { verifiedOnly: 'true' })
      });

      const response = await fetch(`${SummaryApi.getProductReviews.url.replace(':productId', productId)}?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!userId) {
      toast.error('Debes iniciar sesión para votar');
      return;
    }

    try {
      const response = await fetch(SummaryApi.voteReview.url.replace(':reviewId', reviewId), {
        method: SummaryApi.voteReview.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Voto registrado');
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al votar');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <FaStar className="text-yellow-500" />
            ) : (
              <FaRegStar className="text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats || !stats.distribution) return null;

    const total = stats.totalReviews;
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Calificaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Promedio */}
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <div className="text-5xl font-bold text-gray-800 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(stats.averageRating))}
            <p className="text-gray-600 mt-2">{total} reseñas</p>
            {stats.verifiedPurchases > 0 && (
              <p className="text-sm text-green-600 mt-1">
                <FaCheckCircle className="inline mr-1" />
                {stats.verifiedPurchases} compras verificadas
              </p>
            )}
          </div>

          {/* Distribución */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating] || 0;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <button
                    onClick={() => setFilter(rating.toString())}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <span className="w-8 text-sm">{rating}</span>
                    <FaStar className="text-yellow-500 text-xs" />
                  </button>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Cargando reseñas...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Estadísticas */}
      {renderRatingDistribution()}

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${filter === 'verified' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <FaCheckCircle />
            Verificadas
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="createdAt">Más recientes</option>
          <option value="helpful">Más útiles</option>
          <option value="rating">Mejor calificación</option>
        </select>
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay reseñas todavía. ¡Sé el primero en opinar!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border rounded-lg p-6 bg-white shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.userName}</span>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                        <FaCheckCircle />
                        Compra verificada
                      </span>
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Título y comentario */}
              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Imágenes */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={img.caption || `Imagen ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75"
                      onClick={() => window.open(img.url, '_blank')}
                    />
                  ))}
                </div>
              )}

              {/* Respuesta del vendedor */}
              {review.sellerResponse && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <FaReply className="text-blue-600" />
                    <span className="font-semibold text-blue-900">Respuesta del vendedor</span>
                  </div>
                  <p className="text-gray-700">{review.sellerResponse.response}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.sellerResponse.respondedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleVote(review._id, 'helpful')}
                  className="flex items-center gap-1 hover:text-green-600"
                  disabled={!userId}
                >
                  <FaThumbsUp />
                  Útil ({review.helpfulVotes})
                </button>
                <button
                  onClick={() => handleVote(review._id, 'not_helpful')}
                  className="flex items-center gap-1 hover:text-red-600"
                  disabled={!userId}
                >
                  <FaThumbsDown />
                  No útil ({review.notHelpfulVotes})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
