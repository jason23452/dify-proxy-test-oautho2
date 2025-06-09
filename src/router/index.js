// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import { msalInstance, loginRequest } from "../auth/msal";

const routes = [
  { path: "/", name: "Home", component: Home, meta: { requiresAuth: true } },
  // ... other routes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 2. async beforeEach，捕获 interaction_in_progress
router.beforeEach(async (to, from) => {
  const account = msalInstance.getActiveAccount();

  if (to.meta.requiresAuth && !account) {
    try {
      // 觸發重導向後不會執行到下一行
      await msalInstance.loginRedirect(loginRequest);
    } catch (e) {
      if (e.errorCode !== 'interaction_in_progress') {
        console.error('loginRedirect error:', e)
      }
    }
    // 阻止當前導航（瀏覽器會跳到 Azure 登入頁）
    return false;
  }

  // 允許導航
  return true;
});

export default router;
