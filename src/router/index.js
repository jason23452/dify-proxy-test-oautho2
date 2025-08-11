// router/index.js（節錄）
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

import Layout from '../views/index.vue'
import Login from '../views/Login.vue'

// 1) 自動導入子頁
const modules = import.meta.glob('../views/*/index.vue') // lazy import

// 2) 組 children
const children = Object.keys(modules).map(path => {
  const match = path.match(/..\/views\/([^/]+)\/index\.vue$/)
  const routeName = match ? match[1] : null
  return {
    path: routeName,                 // e.g. /aaa
    component: modules[path],        // () => import('...')，保持 lazy
    meta: { requiresAuth: true }
  }
})

const routes = [
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children
  },
  { path: '/login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ 全局守衛：僅放在 router，不動 main.js
router.beforeEach(async (to) => {
  const user = useUserStore()

  // 已登入者不應再去 /login
  if (to.path === '/login' && user.isLogged) {
    return { path: '/' }
  }

  // 需驗證的頁面：先做 Token 狀態檢查（含即將過期預刷新）
  if (to.meta.requiresAuth) {
    // 若尚未登入，或 Token 失效/刷新失敗，導去 /login
    if (!user.isLogged) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    const { valid } = await user.checkTokenStatus()
    if (!valid) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // （可選）保險再檢一次確保有效 token（你原本的 ensureValidToken）
    await user.ensureValidToken()
  }

  // 其餘通過
  return true
})

export default router
