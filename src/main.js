// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import { initializeMsal, msalInstance } from "./auth/msal";

async function bootstrap() {
  await initializeMsal();
  const app = createApp(App);
  app.config.globalProperties.$msal = msalInstance;
  app.mount("#app");
}

bootstrap().catch(console.error);
