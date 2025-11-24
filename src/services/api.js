import axios from 'axios';

// Pega a URL do .env
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  // IMPORTANTE: Permite enviar/receber cookies (Refresh Token) entre domínios diferentes
  // ou portas diferentes (localhost:5173 -> localhost:3000)
  withCredentials: true,
});

// --- INTERCEPTOR DE REQUISIÇÃO ---
// Antes de cada requisição, injeta o token se ele existir
api.interceptors.request.use(
  (config) => {
    const newConfig = { ...config };

    const token = localStorage.getItem('accessToken');
    if (token) {
      newConfig.headers = {
        ...newConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return newConfig;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPOSTA ---
// Lida com erros, especialmente o 401 (Token Expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verifica se a URL que falhou é a de login ou a de refresh
    const isAuthRequest =
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/refresh-token');

    // Se o erro for 401 (Não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest.isRetry && !isAuthRequest) {
      originalRequest.isRetry = true;

      try {
        // Tenta obter um novo token usando o cookie de refresh que já está no navegador
        const { data } = await api.post('/auth/refresh-token');

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // Refaz a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar (ex: token de refresh também expirou), faz logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.setItem('session_expired', 'true');
        window.location.href = '/login'; // Redireciona para login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
