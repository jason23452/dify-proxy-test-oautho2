import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";
import { initializeMsal } from "./auth/msal";
import { useUserStore } from "./stores/user";

async function bootstrap() {
  await initializeMsal();

  const app = createApp(App);
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);
  app.use(router);

  // 初始化使用者狀態並啟動持久化與自動過期機制
  const userStore = useUserStore();
  await userStore.init();

  app.mount("#app");
}

bootstrap().catch(console.error);