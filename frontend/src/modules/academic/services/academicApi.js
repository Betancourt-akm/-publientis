const backendDomain = process.env.REACT_APP_BACKEND_URL?.replace(/\/+$/, '').replace(/\/api$/, '') || '';

const academicApi = {
  // ============ Profile Endpoints ============
  getMyProfile: {
    url: `${backendDomain}/api/academic/profile/me`,
    method: 'GET',
    credentials: 'include'
  },
  
  getProfileByUserId: (userId) => ({
    url: `${backendDomain}/api/academic/profile/${userId}`,
    method: 'GET'
  }),
  
  updateProfile: (userId) => ({
    url: `${backendDomain}/api/academic/profile/${userId}`,
    method: 'PUT',
    credentials: 'include'
  }),
  
  deleteProfile: (userId) => ({
    url: `${backendDomain}/api/academic/profile/${userId}`,
    method: 'DELETE',
    credentials: 'include'
  }),

  // ============ Publication Endpoints ============
  getPublicationFeed: {
    url: `${backendDomain}/api/academic/publications/feed`,
    method: 'GET'
  },
  
  getPublicationById: (id) => ({
    url: `${backendDomain}/api/academic/publications/${id}`,
    method: 'GET'
  }),
  
  createPublication: {
    url: `${backendDomain}/api/academic/publications`,
    method: 'POST',
    credentials: 'include'
  },
  
  getMyPublications: {
    url: `${backendDomain}/api/academic/publications/user/my`,
    method: 'GET',
    credentials: 'include'
  },
  
  updatePublication: (id) => ({
    url: `${backendDomain}/api/academic/publications/${id}`,
    method: 'PUT',
    credentials: 'include'
  }),
  
  deletePublication: (id) => ({
    url: `${backendDomain}/api/academic/publications/${id}`,
    method: 'DELETE',
    credentials: 'include'
  }),
  
  toggleLike: (id) => ({
    url: `${backendDomain}/api/academic/publications/${id}/like`,
    method: 'POST',
    credentials: 'include'
  }),

  // ============ Moderation Endpoints (FACULTY) ============
  getPendingPublications: {
    url: `${backendDomain}/api/academic/publications/moderation/pending`,
    method: 'GET',
    credentials: 'include'
  },
  
  approvePublication: (id) => ({
    url: `${backendDomain}/api/academic/publications/${id}/approve`,
    method: 'PUT',
    credentials: 'include'
  }),
  
  rejectPublication: (id) => ({
    url: `${backendDomain}/api/academic/publications/${id}/reject`,
    method: 'PUT',
    credentials: 'include'
  })
};

export default academicApi;
