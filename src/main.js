// src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";
import { initializeMsal } from "./auth/msal";

async function bootstrap() {
  // 1. 初始化 MSAL
  await initializeMsal();

  const app = createApp(App);

  // 2. 設定 Pinia 並載入 persistedstate
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  app.use(router);
  app.mount("#app");
}

bootstrap().catch(console.error);
