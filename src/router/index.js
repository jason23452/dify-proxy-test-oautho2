import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

import Layout from '../views/index.vue'
import Login from '../views/Login.vue'

// 1. 自動導入所有子頁
const modules = import.meta.glob('../views/*/index.vue')

// 2. 自動組成 children 陣列
const children = Object.keys(modules).map(path => {
  // 解析路徑名稱：'../views/aaa/index.vue' => 'aaa'
  const match = path.match(/..\/views\/([^/]+)\/index\.vue$/)
  const routeName = match ? match[1] : null
  return {
    path: routeName,
    component: modules[path], // 動態導入
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
  {
    path: '/login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLogged) {
    if (to.path !== '/login') {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else if (to.path === '/login' && userStore.isLogged) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router
