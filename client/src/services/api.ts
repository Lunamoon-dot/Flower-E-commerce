import axios from "axios"
import type { InternalAxiosRequestConfig, AxiosError } from "axios"

export let inMemoryToken: string | null = null

export const setToken = (token: string | null) => {
  inMemoryToken = token
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`
  }
  return config
})

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Prevent interceptor from handling 401s if the original request was to /auth/refresh
    if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = 'Bearer ' + token;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        
        inMemoryToken = data.token;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${inMemoryToken}`;
        }
        
        processQueue(null, data.token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setToken(null);
        if (typeof window !== 'undefined') {
          // You might prefer to handle logout state through your store,
          // but if we are here we have to clear the token and redirect.
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error)
  }
)

export default api
