import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token JWT automáticamente

api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    if (!token) {
      // Buscar dentro de loggedUser si existe
      const loggedUser = localStorage.getItem('loggedUser');
      if (loggedUser) {
        try {
          const parsed = JSON.parse(loggedUser);
          if (parsed.token) token = parsed.token;
        } catch (e) {}
      }
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;