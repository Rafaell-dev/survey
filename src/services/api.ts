import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface FailedRequestQueue {
  resolve: (value: string | null) => void;
  reject: (reason: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequestQueue[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        isRefreshing = false;
        logout();
        return Promise.reject(error);
      }

      try {
        // Realiza o refresh
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken
        });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        // Atualiza a store
        setTokens(newAccessToken, newRefreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Processa a fila de espera
        processQueue(null, newAccessToken);

        // Repete a requisição original
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        logout(); // Limpa e manda pro /login
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
