// src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { initializeMsal } from "./auth/msal";

async function bootstrap() {
  // 1. 初始化 MSAL，并消化重定向回来时的处理
  await initializeMsal(); 
  // initializeMsal 内部应该已经调用过：
  //   msalInstance.handleRedirectPromise()
  // 并把 result 存到你的 store 里

  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.mount("#app");
}

bootstrap().catch(console.error);
