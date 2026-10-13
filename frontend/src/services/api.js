import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('docupulse_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, redirect to login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('docupulse_token');
        localStorage.removeItem('docupulse_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const documentAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/documents', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },
  upload: async (formData, onUploadProgress) => {
    const res = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return res.data;
  },
  updateExtractedData: async (id, payload) => {
    const res = await api.put(`/documents/${id}`, payload);
    return res.data;
  },
  chat: async (id, message) => {
    const res = await api.post(`/documents/${id}/chat`, { message });
    return res.data;
  },
  exportData: async (id, format = 'json') => {
    if (format === 'csv') {
      const res = await api.get(`/documents/${id}/export?format=csv`, {
        responseType: 'blob',
      });
      return res.data;
    }
    const res = await api.get(`/documents/${id}/export?format=json`);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};

export const analyticsAPI = {
  getOverview: async () => {
    const res = await api.get('/analytics');
    return res.data;
  },
  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },
};

export default api;
