import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"; // ★ 加這行
import App from "./App.vue";
import router from "./router";
import { initializeMsal } from "./auth/msal";

async function bootstrap() {
  await initializeMsal();

  const app = createApp(App);

  // ★ Pinia + 持久化插件
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate); // ★ 這行很重要

  app.use(pinia);
  app.use(router);
  app.mount("#app");
}

bootstrap().catch(console.error);
