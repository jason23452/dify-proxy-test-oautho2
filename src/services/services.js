import axios from "axios";
import { useUserStore } from "@/stores/user";

const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY;

const client = axios.create({
  baseURL: "/dify", // Vite proxy 前綴
  timeout: 3000000,
  // headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use(
  async (config) => {
    // 1. 檢查並靜默更新 SSO Token
    
    const userStore = useUserStore();
    const ok = await userStore.ensureValidToken();
    if (!ok) {
      // 無效就跳登入
      userStore.login();
      throw new axios.Cancel("Token 已過期，請重新登入");
    }

    // 2. 加入 SSO Token
    const accessToken = userStore.accessToken;
    if (accessToken) {
      config.headers["X-User-Token"] = `Bearer ${accessToken}`;
    }

    // 3. 加入 Dify API Key
    if (DIFY_API_KEY) {
      config.headers["Authorization"] = `Bearer ${DIFY_API_KEY}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (err) => {
    if (!axios.isCancel(err)) {
      const status = err.response?.status;
      const isDifyCall = err.config?.baseURL === "/dify";

      if (status === 401 && isDifyCall) {
        // /dify 路徑且 401 → Dify API Key 問題
        alert("Dify API Key 不正確，請檢查金鑰");
        return Promise.reject({ ...err, custom: "difyKey" });
      }

      if (status === 401) {
        // 其餘 401 → SSO Token 問題
        alert("登入已過期，請重新登入");
        const userStore = useUserStore();
        userStore.logout();
        return Promise.reject({ ...err, custom: "sso" });
      }

      console.error("Request Error:", err);
    }

    return Promise.reject(err);
  }
);

// 簡化 HTTP 方法
export const get = async (path, params = {}) => {
  try {
    return await client.get(path, { params });
  } catch (e) {
    return { error: e };
  }
};

export const post = async (path, data = {}) => {
  try {
    return await client.post(path, data);
  } catch (e) {
    return { error: e };
  }
};

export const put = async (path, data = {}) => {
  try {
    return await client.put(path, data);
  } catch (e) {
    return { error: e };
  }
};

export const del = async (path, data = {}) => {
  try {
    return await client.delete(path, { data });
  } catch (e) {
    return { error: e };
  }
};

export default { get, post, put, delete: del };
