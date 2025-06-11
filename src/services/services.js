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
    const ok = await userStore.ensureValidToken()
    if (!ok) {
      throw new axios.Cancel("Token 已過期，請重新登入")
    }

    if (userStore.idToken) {
      config.headers['X-User-Token'] = `Bearer ${userStore.idToken}`
    }

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
      const status = err?.response?.status
      const url = err?.config?.baseURL + (err?.config?.url || "")
      // 只要是 /dify 且 401
      if (status === 401 && url.startsWith('/dify')) {
        // 你要的行為
        alert('Dify API Key 不正確，請檢查金鑰')
        // 可加上更多處理
        return Promise.reject({ ...err, custom: 'difyKey' })
      }
      // 其他 401，判為 SSO 問題
      if (status === 401) {
        alert('登入已過期，請重新登入')
        const userStore = useUserStore()
        userStore.logout()
        return Promise.reject({ ...err, custom: 'sso' })
      }
      // 其他錯誤
      console.error("Request Error:", err)
    }
    return Promise.reject(err)
  }
)

export const get = async (path, params = {}) => {
  try {
    return await client.get(path, { params })
  } catch (e) {
    return { error: e }
  }
}
export const post = async (path, data = {}) => {
  try {
    return await client.post(path, data)
  } catch (e) {
    return { error: e }
  }
}
export const put = async (path, data = {}) => {
  try {
    return await client.put(path, data)
  } catch (e) {
    return { error: e }
  }
}
export const del = async (path, data = {}) => {
  try {
    return await client.delete(path, { data })
  } catch (e) {
    return { error: e }
  }
}
export default { get, post, put, delete: del }
