// src/utils/request.js
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

// const DIFY_BASE_URL = import.meta.env.VITE_DIFY_BASE_URL || "https://api.dify.ai";
const DIFY_API_KEY  = import.meta.env.VITE_DIFY_API_KEY;

const client = axios.create({
  baseURL: '/dify',       // Vite proxy 前綴
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

client.interceptors.request.use(
  async (config) => {
    // 1. MSAL Bearer Token 驗證
    const { useUserStore } = await import("../stores/user");
    const userStore = useUserStore();
    const ok = await userStore.ensureValidToken();
    if (!ok) {
      // 若無有效 token，取消請求並導向登入
      throw new axios.Cancel("Token 已過期，正在跳轉登入");
    }
    const token = userStore.account?.idToken;
    if (token) {
      config.headers["X-Access-Token"] = `Bearer ${token}`;
    }

    // 2. Dify API Key
    if (DIFY_API_KEY) {
      config.headers.Authorization = `Bearer ${DIFY_API_KEY}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!axios.isCancel(err)) {
      console.error("Request Error:", err);
    }
    return Promise.reject(err);
  }
);

export const get = async (path, params = {}) => {
  try {
    return await client.get(path, { params });
  } catch (e) {
    console.error("request.get error", e);
    return { error: e };
  }
};
export const post = async (path, data = {}) => {
  try {
    return await client.post(path, data);
  } catch (e) {
    console.error("request.post error", e);
    return { error: e };
  }
};
export const put = async (path, data = {}) => {
  try {
    return await client.put(path, data);
  } catch (e) {
    console.error("request.put error", e);
    return { error: e };
  }
};
export const del = async (path, data = {}) => {
  try {
    return await client.delete(path, { data });
  } catch (e) {
    console.error("request.delete error", e);
    return { error: e };
  }
};
export default { get, post, put, delete: del };


    // config.headers.Authorization = `Bearer ${API_KEY}`
