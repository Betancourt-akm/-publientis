import axiosInstance from '../../../utils/axiosInstance';

const applicationService = {
  // Postularse a una oferta
  apply: async (applicationData) => {
    const { data } = await axiosInstance.post('/api/job-applications/apply', applicationData);
    return data;
  },

  // Mis postulaciones (estudiante)
  getMyApplications: async (params = {}) => {
    const { data } = await axiosInstance.get('/api/job-applications/my', { params });
    return data;
  },

  // Postulaciones de una oferta (organización)
  getApplicationsForJob: async (jobId, params = {}) => {
    const { data } = await axiosInstance.get(`/api/job-applications/job/${jobId}`, { params });
    return data;
  },

  // Detalle de una postulación
  getApplicationById: async (id) => {
    const { data } = await axiosInstance.get(`/api/job-applications/${id}`);
    return data;
  },

  // Actualizar estado (organización)
  updateStatus: async (id, statusData) => {
    const { data } = await axiosInstance.patch(`/api/job-applications/${id}/status`, statusData);
    return data;
  },

  // Retirar postulación (estudiante)
  withdraw: async (id) => {
    const { data } = await axiosInstance.patch(`/api/job-applications/${id}/withdraw`);
    return data;
  }
};

export default applicationService;
