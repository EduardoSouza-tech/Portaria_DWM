import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (refresh token or logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },
  
  register: async (data: { email: string; password: string; nome: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Moradores
export const moradoresAPI = {
  list: async () => {
    const response = await api.get('/moradores');
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/moradores', data);
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await api.get(`/moradores/${id}`);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/moradores/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/moradores/${id}`);
    return response.data;
  },
};

// Visitantes
export const visitantesAPI = {
  list: async () => {
    const response = await api.get('/visitantes');
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/visitantes', data);
    return response.data;
  },
  
  getByDocumento: async (documento: string) => {
    const response = await api.get(`/visitantes/documento/${documento}`);
    return response.data;
  },
};

// Visitas
export const visitasAPI = {
  list: async (status?: string) => {
    const params = status ? { status_filter: status } : {};
    const response = await api.get('/visitas', { params });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/visitas', data);
    return response.data;
  },
  
  getQRCode: async (id: string) => {
    const response = await api.get(`/visitas/${id}/qrcode`);
    return response.data;
  },
  
  validateQR: async (qrData: any) => {
    const response = await api.post('/visitas/validate-qr', qrData);
    return response.data;
  },
  
  registerSaida: async (id: string) => {
    const response = await api.post(`/visitas/${id}/saida`);
    return response.data;
  },
  
  getDentro: async () => {
    const response = await api.get('/visitas/dentro/agora');
    return response.data;
  },
};
