import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si le serveur renvoie 401 (token expiré ou invalide), déconnexion automatique
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wr_token');
      localStorage.removeItem('wr_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
