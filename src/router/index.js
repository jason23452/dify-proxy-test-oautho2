import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import { useUserStore } from "../stores/user";

const routes = [
  { path: "/", name: "Home", component: Home, meta: { requiresAuth: true } },
  { path: "/login", name: "Login", component: Login },

  // ... other routes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLogged) {
    if (to.path !== "/login") {
      next({ name: "Login", query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } else if (to.path === "/login" && userStore.isLogged) {
    next({ path: "/" });
  } else {
    next();
  }
});

export default router;
