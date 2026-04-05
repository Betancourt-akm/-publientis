import getBackendUrl from '../utils/getBackendUrl';

const backendDomain = getBackendUrl();
const SummaryApi = {
    signUP: {
        url: `${backendDomain}/api/auth/register`,
        method: "POST",
    },
    signIn: {
        url: `${backendDomain}/api/auth/login`,
        method: "POST",
    },
    forgotPassword: {
        url: `${backendDomain}/api/auth/forgot-password`,
        method: "POST",
    },
    resendVerification: {
        url: `${backendDomain}/api/auth/resend-verification`,
        method: "POST",
    },
    resetPassword: (token) => ({
        url: `${backendDomain}/api/auth/reset-password/${token}`,
        method: 'PATCH',
        credentials: 'include',
    }),
    userDetails: {
        url: `${backendDomain}/api/users/user-details`,
        method: "GET"
    },
    allUser: {
        url: `${backendDomain}/api/users/all-user`,
        method: "GET",
    },
    updateUser: {
        url: `${backendDomain}/api/users/update-user`,
        method: "POST",
    },
    setPassword: {
        url: `${backendDomain}/api/users/set-password`,
        method: "POST",
    },
    updateProfilePicture: {
        url: `${backendDomain}/api/users/update-profile-picture`,
        method: "POST",
    },
    logout_user: {
        url: `${backendDomain}/api/auth/logout`,
        method: "GET",
    },
    // --- Rutas de Productos ---
    getAllProducts: {
        url: `${backendDomain}/api/products`,
        method: "GET",
    },
    getProductById: (id) => ({
        url: `${backendDomain}/api/products/${id}`,
        method: "GET",
    }),
    getFeaturedProducts: {
        url: `${backendDomain}/api/products/featured`,
        method: "GET",
    },
    getCategories: {
        url: `${backendDomain}/api/products/categories`,
        method: "GET",
    },
    getBrands: {
        url: `${backendDomain}/api/products/brands`,
        method: "GET",
    },
    createProduct: {
        url: `${backendDomain}/api/products`,
        method: "POST",
        credentials: "include",
    },
    updateProduct: (id) => ({
        url: `${backendDomain}/api/products/${id}`,
        method: "PUT",
        credentials: "include",
    }),
    deleteProduct: (id) => ({
        url: `${backendDomain}/api/products/${id}`,
        method: "DELETE",
        credentials: "include",
    }),
    
    // --- Rutas del Carrito ---
    getCart: {
        url: `${backendDomain}/api/cart`,
        method: "GET",
        credentials: "include",
    },
    addToCart: {
        url: `${backendDomain}/api/cart`,
        method: "POST",
        credentials: "include",
    },
    updateCartItem: {
        url: `${backendDomain}/api/cart`,
        method: "PUT",
        credentials: "include",
    },
    removeFromCart: (productId) => ({
        url: `${backendDomain}/api/cart/${productId}`,
        method: "DELETE",
        credentials: "include",
    }),
    clearCart: {
        url: `${backendDomain}/api/cart`,
        method: "DELETE",
        credentials: "include",
    },
    getCartCount: {
        url: `${backendDomain}/api/cart/count`,
        method: "GET",
        credentials: "include",
    },
    
    // --- Rutas de Órdenes ---
    createOrder: {
        url: `${backendDomain}/api/orders`,
        method: "POST",
        credentials: "include",
    },
    // ✅ GUEST CHECKOUT - Compra sin login
    createGuestOrder: {
        url: `${backendDomain}/api/orders/guest`,
        method: "POST",
        // Sin credentials - no requiere autenticación
    },
    getUserOrders: {
        url: `${backendDomain}/api/orders`,
        method: "GET",
        credentials: "include",
    },
    getOrderById: (id) => ({
        url: `${backendDomain}/api/orders/${id}`,
        method: "GET",
        credentials: "include",
    }),
    cancelOrder: (id) => ({
        url: `${backendDomain}/api/orders/${id}/cancel`,
        method: "POST",
        credentials: "include",
    }),
    getAllOrders: {
        url: `${backendDomain}/api/admin/orders`,
        method: "GET",
        credentials: "include",
    },
    testAdminAuth: {
        url: `${backendDomain}/api/admin/test`,
        method: "GET",
        credentials: "include",
    },
    updateOrderStatus: (id) => ({
        url: `${backendDomain}/api/orders/${id}/order-status`,
        method: "PUT",
        credentials: "include",
    }),
    updatePaymentStatus: (id) => ({
        url: `${backendDomain}/api/orders/${id}/payment-status`,
        method: "PUT",
        credentials: "include",
    }),

    // --- Pagos PayPal ---
    createPayPalOrder: {
        url: `${backendDomain}/api/payment/create-paypal-order`,
        method: "POST",
        credentials: "include",
    },
    capturePayment: {
        url: `${backendDomain}/api/payment/capture-order`,
        method: "POST",
    },
    cancelPayment: {
        url: `${backendDomain}/api/payment/cancel-payment`,
        method: "GET",
    },

    // --- PayPal Card (Simple - Sin Order previa) ---
    createOrder: {
        url: `${backendDomain}/api/payment/create-order`,
        method: "POST",
    },
    captureOrder: {
        url: `${backendDomain}/api/payment/capture-payment`,
        method: "POST",
    },

    // --- Pagos Wompi (Colombia) ---
    getWompiAcceptanceToken: {
        url: `${backendDomain}/api/wompi/acceptance-token`,
        method: "GET",
        credentials: "include",
    },
    createWompiOrder: {
        url: `${backendDomain}/api/wompi/create-order`,
        method: "POST",
        credentials: "include",
    },
    verifyWompiTransaction: (transactionId) => ({
        url: `${backendDomain}/api/wompi/verify/${transactionId}`,
        method: "GET",
        credentials: "include",
    }),
    createWompiSimpleTransaction: {
        url: `${backendDomain}/api/wompi/create-simple`,
        method: "POST",
        credentials: "include",
    },

//   confirmPayment: {
//     url: `${backendDomain}/api/confirm-payment`,
//     method: "GET",
//   },
//   getTransactionDetails: (referenceCode) => ({
//     url: `${backendDomain}/api/transaction/${referenceCode}`,
//     method: "GET",
//   }),


categories: {
    url:        `${backendDomain}/api/categories`,
    method:     "GET",
    credentials:"include"
  },
  createCategory: {
    url:        `${backendDomain}/api/categories`,
    method:     "POST",
    credentials:"include"
  },
  // Para DELETE, lo hacemos función para recibir el id dinámicamente
  deleteCategory: (id) => ({
    url:        `${backendDomain}/api/categories/${id}`,
    method:     "DELETE",
    credentials:"include"
  }),



  // --- Rutas de Reviews de Productos ---
  getProductReviews: {
    url: `${backendDomain}/api/product-reviews/product/:productId`,
    method: "GET",
  },
  createReview: {
    url: `${backendDomain}/api/product-reviews`,
    method: "POST",
    credentials: "include",
  },
  canUserReview: {
    url: `${backendDomain}/api/product-reviews/can-review/:productId`,
    method: "GET",
    credentials: "include",
  },
  voteReview: {
    url: `${backendDomain}/api/product-reviews/:reviewId/vote`,
    method: "POST",
    credentials: "include",
  },
  removeVote: {
    url: `${backendDomain}/api/product-reviews/:reviewId/vote`,
    method: "DELETE",
    credentials: "include",
  },
  respondToReview: {
    url: `${backendDomain}/api/product-reviews/:reviewId/respond`,
    method: "POST",
    credentials: "include",
  },
  flagReview: {
    url: `${backendDomain}/api/product-reviews/:reviewId/flag`,
    method: "POST",
    credentials: "include",
  },
  moderateReview: {
    url: `${backendDomain}/api/product-reviews/:reviewId/moderate`,
    method: "PATCH",
    credentials: "include",
  },
  getPendingReviews: {
    url: `${backendDomain}/api/product-reviews/admin/pending`,
    method: "GET",
    credentials: "include",
  },

  formSubmit: {
    url: `${backendDomain}/api/forma`,
    method: "POST",
  },

  shippingRates: {
    url: `${backendDomain}/api/shippingRates`,
    method: "GET",
  },
  updateShippingRates: {
    url: `${backendDomain}/api/shippingRates`,
    method: "PUT",
  },

    createTransaction: {
        url: `${backendDomain}/api/transactions`,
        method: "POST",
      },
      getTransactionDetails: {
        url: `${backendDomain}/api/transactions`,
        method: "GET",
      },
      
      allReservas: {
        url: `${backendDomain}/api/transactions`, 
        method: "GET",
      },
      deleteReserva: {
        url: `${backendDomain}/api/transactions`, 
        method: "DELETE",
      },
      allVentas: {
        url: `${backendDomain}/api/transactions`, 
        method: "GET",
      },
      deleteVenta: {
        url: `${backendDomain}/api/transactions`, 
        method: "DELETE",
      },

 featuredPostsList: {
    url:        `${backendDomain}/api/posts`,
    method:     "GET",
    credentials:"include"
  },




 // — WALKER: aplicación —
  teacherApply: {
    url: `${backendDomain}/api/teachers/apply`,
    method: 'PUT',
    credentials: 'include',
  },

  // — WALKER: publicaciones —
  teacherPostsList: teacherId => ({
    url: `${backendDomain}/api/teachers/${teacherId}/posts`,
    method: 'GET',
    credentials: 'include',
  }),
  teacherCreatePost: teacherId => ({
    url: `${backendDomain}/api/teachers/${teacherId}/posts`,
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }),
  teacherDeletePost: (teacherId, postId) => ({
    url: `${backendDomain}/api/teachers/${teacherId}/posts/${postId}`,
    method: 'DELETE',
    credentials: 'include',
  }),



  
  // — WALKER: reservas/intereses —
  teacherBookingsList: teacherId => ({
    url: `${backendDomain}/api/teachers/${teacherId}/bookings`,
    method: 'GET',
    credentials: 'include',
  }),
  teacherCreateBooking: teacherId => ({
    url: `${backendDomain}/api/teachers/${teacherId}/bookings`,
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }),
  teacherUpdateBooking: bookingId => ({
    url: `${backendDomain}/api/bookings/${bookingId}`,
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }),

  // — WALKER: estadísticas —
  teacherStats: {
    url: `${backendDomain}/api/teachers/stats`,
    method: 'GET',
    credentials: 'include',
  },

  // para detalle público de profesor
  teacherDetail: id => ({
    url: `${backendDomain}/api/teachers/${id}`,
    method: 'GET',
    credentials: 'include',
  }),


  allPosts: {
    url:        `${backendDomain}/api/posts`,
    method:     'GET',
    credentials:"include",
  },

  getOfferDetail: (postId) => ({
    url: `${backendDomain}/api/posts/${postId}`, 
    method: 'GET',
    credentials: 'include'
  }),

  // --- Rutas de Cursos y Categorías ---
  getAllCourses: {
    url: `${backendDomain}/api/courses`,
    method: 'GET',
  },
  getCourseById: (id) => ({
    url: `${backendDomain}/api/courses/${id}`,
    method: 'GET',
  }),
  getCoursesByCategory: (categoryId) => ({
    url: `${backendDomain}/api/courses/category/${categoryId}`,
    method: 'GET',
  }),
  getFeaturedCourses: {
    url: `${backendDomain}/api/courses/featured`,
    method: 'GET',
  },
  createCourse: {
    url: `${backendDomain}/api/courses`,
    method: 'POST',
  },
  updateCourse: (id) => ({
    url: `${backendDomain}/api/courses/${id}`,
    method: 'PUT',
  }),
  updateCourseStatus: (id) => ({
    url: `${backendDomain}/api/courses/${id}/status`,
    method: 'PATCH',
  }),
  deleteCourse: (id) => ({
    url: `${backendDomain}/api/courses/${id}`,
    method: 'DELETE',
  }),
  
  // --- Rutas de Profesores ---
  teachersList: {
    url: `${backendDomain}/api/teachers`,
    method: 'GET',
  },
  
  // --- Rutas de Administración de Profesores ---
  adminTeacherApplications: {
    url: `${backendDomain}/api/admin/teacher-applications`,
    method: 'GET',
  },
  adminTeacherApplicationDetail: (id) => ({
    url: `${backendDomain}/api/admin/teacher-applications/${id}`,
    method: 'GET',
  }),
  adminUpdateTeacherApplication: (id, data) => ({
    url: `${backendDomain}/api/admin/teacher-applications/${id}/status`,
    method: 'PATCH',
    data,
    credentials: 'include'
  }),
  
  getTeacherDetail: (id) => ({
    url: `${backendDomain}/api/teachers/${id}`,
    method: 'GET',
    credentials: 'include'
  }),
  
  getTeacherPostsList: (id) => ({
    url: `${backendDomain}/api/teachers/${id}/posts`,
    method: 'GET',
    credentials: 'include'
  }),
  deleteTeacherPost: (teacherId, postId) => ({
    url: `${backendDomain}/api/teachers/${teacherId}/posts/${postId}`,
    method: 'DELETE',
    credentials: 'include',
  }),

  // --- Rutas de Exámenes (Panel de Administración) ---
  getAllExams: {
    url: `${backendDomain}/api/exams/admin`,
    method: 'GET',
    credentials: 'include',
  },
  getExam: (id) => ({
    url: `${backendDomain}/api/exams/admin/${id}`,
    method: 'GET',
    credentials: 'include',
  }),
  createExam: {
    url: `${backendDomain}/api/exams/admin`,
    method: 'POST',
    credentials: 'include',
  },
  updateExam: (id) => ({
    url: `${backendDomain}/api/exams/admin/${id}`,
    method: 'PATCH',
    credentials: 'include',
  }),
  deleteExam: (id) => ({
    url: `${backendDomain}/api/exams/admin/${id}`,
    method: 'DELETE',
    credentials: 'include',
  }),
  toggleExamStatus: (id) => ({
    url: `${backendDomain}/api/exams/admin/${id}/toggle-status`,
    method: 'PATCH',
    credentials: 'include',
  }),
  getExamQuestions: {
    url: `${backendDomain}/api/exams/questions`,
    method: 'GET',
    credentials: 'include',
  },

  // --- Rutas de Suscripciones y Planes ---
  getSubscriptionPlans: {
    url: `${backendDomain}/api/subscriptions/plans`,
    method: 'GET',
  },
  processSubscription: {
    url: `${backendDomain}/api/subscriptions/process`,
    method: 'POST',
    credentials: 'include',
  },
  getUserSubscription: {
    url: `${backendDomain}/api/subscriptions/user`,
    method: 'GET',
    credentials: 'include',
  },
  cancelSubscription: {
    url: `${backendDomain}/api/subscriptions/cancel`,
    method: 'POST',
    credentials: 'include',
  },
  evaluateExam: {
    url: `${backendDomain}/api/exams/evaluate`,
    method: 'POST',
    credentials: 'include',
  },

  // --- APIs DE WALKER PROFILE (LEGACY) ---
  
  // Subir documentos del walker (cédula, antecedentes, foto)
  uploadWalkerDocuments: {
    url: `${backendDomain}/api/walkers/upload-documents`,
    method: 'POST',
    credentials: 'include',
  },
  
  // Obtener estadísticas del walker (perfil propio)
  getMyWalkerStats: {
    url: `${backendDomain}/api/walker/stats`,
    method: 'GET',
    credentials: 'include',
  },
  
  // Búsqueda avanzada de walkers (público)
  searchWalkers: {
    url: `${backendDomain}/api/walkers/search`,
    method: 'GET',
  },

  // Obtener paseadores verificados (público)
  getVerifiedWalkers: {
    url: `${backendDomain}/api/walkers/verified`,
    method: 'GET',
  },

  // Obtener detalles de un walker específico (público)
  getWalkerById: {
    url: `${backendDomain}/api/walkers`,
    method: 'GET',
  },

  // ===== WALKER DASHBOARD APIs =====
  // Obtener perfil del walker (propio)
  getWalkerProfile: {
    url: `${backendDomain}/api/walker/profile`,
    method: 'GET',
    credentials: 'include',
  },

  // Actualizar perfil del walker
  updateWalkerProfile: {
    url: `${backendDomain}/api/walker/profile`,
    method: 'PUT',
    credentials: 'include',
  },

  // Enviar perfil para verificación
  submitWalkerForVerification: {
    url: `${backendDomain}/api/walker/profile/submit-verification`,
    method: 'PATCH',
    credentials: 'include',
  },

  // Alternar publicación de ofertas
  toggleWalkerPublication: {
    url: `${backendDomain}/api/walker/profile/toggle-publication`,
    method: 'PATCH',
    credentials: 'include',
  },

  // Migrar walker al modelo público
  migrateWalkerToPublic: {
    url: `${backendDomain}/api/walker/migrate-to-public`,
    method: 'POST',
    credentials: 'include',
  },

  // Subir archivos del walker
  uploadWalkerFile: {
    url: `${backendDomain}/api/walker/upload-file`,
    method: 'POST',
    credentials: 'include',
  },

  // ===== WALKER MANAGEMENT APIs (ADMIN) =====
  // Obtener paseadores pendientes
  getPendingWalkers: {
    url: `${backendDomain}/api/admin/walkers/pending`,
    method: 'GET',
    credentials: 'include',
  },

  // Obtener todos los paseadores con filtros
  getAllWalkers: {
    url: `${backendDomain}/api/admin/walkers`,
    method: 'GET',
    credentials: 'include',
  },

  // Obtener detalles de un paseador
  getWalkerDetails: (walkerId) => ({
    url: `${backendDomain}/api/admin/walkers/${walkerId}`,
    method: 'GET',
    credentials: 'include',
  }),

  // Aprobar paseador
  approveWalker: (walkerId) => ({
    url: `${backendDomain}/api/admin/walkers/${walkerId}/approve`,
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }),

  // Rechazar paseador
  rejectWalker: (walkerId) => ({
    url: `${backendDomain}/api/admin/walkers/${walkerId}/reject`,
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }),

  // Suspender paseador
  suspendWalker: (walkerId) => ({
    url: `${backendDomain}/api/admin/walkers/${walkerId}/suspend`,
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }),

  // Actualizar perfil de walker (dashboard)
  updateWalkerProfileData: {
    url: `${backendDomain}/api/walker/profile`,
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  },

  // Actualizar horarios
  updateWalkerSchedule: {
    url: `${backendDomain}/api/walker/schedule`,
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  },

  // Actualizar servicios
  updateWalkerServices: {
    url: `${backendDomain}/api/walker/services`,
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  },

  // Cambiar disponibilidad
  toggleWalkerAvailability: {
    url: `${backendDomain}/api/walker/availability`,
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  },

  // --- Rutas de Upload de Imágenes ---
  uploadImage: {
    url: `${backendDomain}/api/upload/image`,
    method: 'POST',
    credentials: 'include',
  },
  uploadMultipleImages: {
    url: `${backendDomain}/api/upload/images`,
    method: 'POST',
    credentials: 'include',
  },
  deleteImage: {
    url: `${backendDomain}/api/upload/image`,
    method: 'DELETE',
    credentials: 'include',
  },

  // --- Rutas de Wishlist/Favoritos ---
  getWishlist: {
    url: `${backendDomain}/api/wishlist`,
    method: 'GET',
    credentials: 'include',
  },
  getWishlistCount: {
    url: `${backendDomain}/api/wishlist/count`,
    method: 'GET',
    credentials: 'include',
  },
  getWishlistProductIds: {
    url: `${backendDomain}/api/wishlist/product-ids`,
    method: 'GET',
    credentials: 'include',
  },
  checkWishlistStatus: (productId) => ({
    url: `${backendDomain}/api/wishlist/check/${productId}`,
    method: 'GET',
    credentials: 'include',
  }),
  addToWishlist: {
    url: `${backendDomain}/api/wishlist/add`,
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  },
  removeFromWishlist: (productId) => ({
    url: `${backendDomain}/api/wishlist/remove/${productId}`,
    method: 'DELETE',
    credentials: 'include',
  }),
  toggleWishlist: {
    url: `${backendDomain}/api/wishlist/toggle`,
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  },
  clearWishlist: {
    url: `${backendDomain}/api/wishlist/clear`,
    method: 'DELETE',
    credentials: 'include',
  },

  // ==========================================
  // TRACKING PÚBLICO (Sin autenticación)
  // ==========================================
  trackOrder: (orderNumber) => ({
    url: `${backendDomain}/api/tracking/${orderNumber}`,
    method: 'GET',
    // NO credentials - endpoint público
  }),
  refreshTracking: (orderNumber) => ({
    url: `${backendDomain}/api/tracking/${orderNumber}/refresh`,
    method: 'GET',
  }),

  // ==========================================
  // BÚSQUEDA AVANZADA (Público)
  // ==========================================
  advancedSearch: (queryString) => ({
    url: `${backendDomain}/api/search?${queryString}`,
    method: 'GET',
  }),
  searchAutocomplete: (query) => ({
    url: `${backendDomain}/api/search/autocomplete?q=${encodeURIComponent(query)}`,
    method: 'GET',
  }),
  getFilterOptions: {
    url: `${backendDomain}/api/search/filters`,
    method: 'GET',
  },
  searchByCategory: (category, queryString = '') => ({
    url: `${backendDomain}/api/search/category/${encodeURIComponent(category)}${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  }),
  searchByBrand: (brand, queryString = '') => ({
    url: `${backendDomain}/api/search/brand/${encodeURIComponent(brand)}${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  }),
  getSimilarProducts: (productId, limit = 6) => ({
    url: `${backendDomain}/api/search/similar/${productId}?limit=${limit}`,
    method: 'GET',
  }),
  getPopularProducts: (limit = 10) => ({
    url: `${backendDomain}/api/search/popular?limit=${limit}`,
    method: 'GET',
  }),
  getNewProducts: (limit = 10) => ({
    url: `${backendDomain}/api/search/new?limit=${limit}`,
    method: 'GET',
  }),
};

SummaryApi.backendDomain = backendDomain;

export default SummaryApi;
