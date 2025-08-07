import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useApiKeyStore } from "@/stores/apiKey";

// 不要在這裡呼叫 useApiKeyStore()

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

    // 3. **動態取得 API Key**
    const apiKeyStore = useApiKeyStore(); // 每次進來都會拿到最新的 Pinia 狀態
    const DIFY_API_KEY = apiKeyStore.getCurrentKey?.() || apiKeyStore.currentKey; // 相容 getter 或直接屬性
    if (DIFY_API_KEY) {
      config.headers["Authorization"] = `Bearer ${DIFY_API_KEY}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ...response 攔截器同你原本

// 其餘方法保持不變
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
