// src/utils/api.js
import axios from 'axios';
import { useUserStore } from '../stores/user';

// 建立 axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：自動帶上 Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.isLogged && userStore.account) {
      const token = userStore.account.idToken || userStore.account.idTokenClaims?.at_hash;
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 回應攔截器：可在此統一處理錯誤
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 例如 401 自動登出
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      userStore.logout();
    }
    return Promise.reject(error);
  }
);

// 封裝 HTTP 方法
export function get(url, params = {}, config = {}) {
  return apiClient.get(url, { params, ...config });
}

export function post(url, data = {}, config = {}) {
  return apiClient.post(url, data, config);
}

export function put(url, data = {}, config = {}) {
  return apiClient.put(url, data, config);
}

export function del(url, config = {}) {
  return apiClient.delete(url, config);
}

// 預設輸出
export default {
  get,
  post,
  put,
  delete: del,
};
