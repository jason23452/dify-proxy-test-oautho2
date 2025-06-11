// src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";
import { initializeMsal } from "./auth/msal";
import { useUserStore } from "./stores/user";

async function bootstrap() {
  // 1. 處理 MSAL redirect 回調 & 設定 activeAccount
  await initializeMsal();

  // 2. 建立 Vue + Pinia
  const app = createApp(App);
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);
  app.use(router);

  // 3. 初始化 userStore、重置 loginCalled
  const userStore = useUserStore();
  await userStore.init();

  app.mount("#app");
}

bootstrap().catch(console.error);