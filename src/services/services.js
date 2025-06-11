// src/utils/request.js
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY

const client = axios.create({
  baseURL: '/dify',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

client.interceptors.request.use(
  async (config) => {
    const userStore = useUserStore()

    // 先檢查並自動 silent renew SSO token
    const ok = await userStore.ensureValidToken()
    if (!ok) {
      throw new axios.Cancel("Token 已過期，正在跳轉登入")
    }

    // SSO Token
    if (userStore.idToken) {
      config.headers['X-User-Token'] = `Bearer ${userStore.idToken}`
    }

    // Dify API Key
    if (DIFY_API_KEY) {
      config.headers.Authorization = `Bearer ${DIFY_API_KEY}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!axios.isCancel(err)) {
      // 捕捉 401，分辨是哪一種錯誤
      if (err?.response?.status === 401) {
        // 若請求是 /dify 則多半是 API KEY 問題
        if (err?.config?.url?.startsWith('/dify')) {
          console.warn('Dify API Key 失效或無效')
        } else {
          // 其他請求是 SSO 問題
          const userStore = useUserStore()
          userStore.logout() // 可自訂登出邏輯
        }
      } else {
        console.error("Request Error:", err)
      }
    }
    return Promise.reject(err)
  }
)

export const get = async (path, params = {}) => {
  try {
    return await client.get(path, { params })
  } catch (e) {
    console.error("request.get error", e)
    return { error: e }
  }
}
export const post = async (path, data = {}) => {
  try {
    return await client.post(path, data)
  } catch (e) {
    console.error("request.post error", e)
    return { error: e }
  }
}
export const put = async (path, data = {}) => {
  try {
    return await client.put(path, data)
  } catch (e) {
    console.error("request.put error", e)
    return { error: e }
  }
}
export const del = async (path, data = {}) => {
  try {
    return await client.delete(path, { data })
  } catch (e) {
    console.error("request.delete error", e)
    return { error: e }
  }
}
export default { get, post, put, delete: del }
