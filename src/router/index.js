// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import { msalInstance } from "../auth/msal";

const routes = [
  { path: "/", name: "Home", component: Home, meta: { requiresAuth: true } },
  // 其他路由...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const account = msalInstance.getActiveAccount();
  if (to.meta.requiresAuth && !account) {
    return msalInstance.loginRedirect(loginRequest);
  }
  next();
});

export default router;
