// src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { initializeMsal } from "./auth/msal";

async function bootstrap() {
  // 先初始化 MSAL
  await initializeMsal();

  const app = createApp(App);

  // 掛載 Pinia
  const pinia = createPinia();
  app.use(pinia);

  app.mount("#app");
}

bootstrap().catch(console.error);
