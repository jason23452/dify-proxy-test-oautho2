import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import { useUserStore } from "../stores/user";

const routes = [
  { path: "/", name: "Home", component: Home, meta: { requiresAuth: true } },
  // ... other routes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLogged && !userStore.loginCalled) {
    try {
      await userStore.login();
    } catch (e) {
      if (e.errorCode !== "interaction_in_progress") {
        console.error("loginRedirect error:", e);
      }
    }
    return false;
  }
  return true;
});

export default router;