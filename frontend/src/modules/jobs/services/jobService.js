import axiosInstance from '../../../utils/axiosInstance';

const jobService = {
  // Obtener ofertas activas (público)
  getActiveOffers: async (params = {}) => {
    const { data } = await axiosInstance.get('/api/jobs', { params });
    return data;
  },

  // Obtener oferta por ID
  getOfferById: async (id) => {
    const { data } = await axiosInstance.get(`/api/jobs/${id}`);
    return data;
  },

  // Crear oferta (ORGANIZATION)
  createOffer: async (offerData) => {
    const { data } = await axiosInstance.post('/api/jobs', offerData);
    return data;
  },

  // Actualizar oferta
  updateOffer: async (id, offerData) => {
    const { data } = await axiosInstance.put(`/api/jobs/${id}`, offerData);
    return data;
  },

  // Eliminar oferta
  deleteOffer: async (id) => {
    const { data } = await axiosInstance.delete(`/api/jobs/${id}`);
    return data;
  },

  // Mis ofertas (organización)
  getMyOffers: async (params = {}) => {
    const { data } = await axiosInstance.get('/api/jobs/my/offers', { params });
    return data;
  },

  // Ofertas pendientes de aprobación (FACULTY/ADMIN)
  getPendingOffers: async (params = {}) => {
    const { data } = await axiosInstance.get('/api/jobs/admin/pending', { params });
    return data;
  },

  // Aprobar oferta
  approveOffer: async (id) => {
    const { data } = await axiosInstance.patch(`/api/jobs/${id}/approve`);
    return data;
  },

  // Rechazar oferta
  rejectOffer: async (id, reason) => {
    const { data } = await axiosInstance.patch(`/api/jobs/${id}/reject`, { reason });
    return data;
  },

  // Estadísticas
  getStats: async () => {
    const { data } = await axiosInstance.get('/api/jobs/admin/stats');
    return data;
  }
};

export default jobService;
