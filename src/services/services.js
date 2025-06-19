import axios from "axios";
import { useUserStore } from "@/stores/user";

const API_KEY = import.meta.env.VITE_DIFY_API_KEY

const client = axios.create({
  baseURL: "/dify", // Vite proxy 前綴
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use(config => {
  // 1. Dify 要求：Authorization: Bearer {API_KEY}
  if (API_KEY) {
    config.headers.Authorization = `Bearer ${API_KEY}`
  } else {
    console.warn('[Dify] VITE_DIFY_API_KEY 未定義')
  }

  // 2. 自訂 header：帶上使用者的 idToken
  const { account } = storeToRefs(useUserStore())
  if (account.value?.idToken) {
    config.headers['X-User-Token'] = `Bearer ${account.value.idToken}`
  } else {
    console.warn('[Dify] 使用者 idToken 未設定')
  }

  return config
}, error => Promise.reject(error))

export const get  = (path = '') => client.get(path)
export const post = (path, data = {}) => client.post(path, data)
export const put  = (path, data = {}) => client.put(path, data)
export const del  = (path, data = {}) => client.delete(path, { data })

export default { get, post, put, delete: del }
