// main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";
import { initializeMsal } from "./constants/config";
import { useUserStore } from "./stores/user";

// 1) 先初始化 MSAL（載入快取、設定）
await initializeMsal();

// 2) 建立 app & pinia
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);

// 3) 在掛載前初始化使用者狀態（handleRedirectPromise / silent acquire）
const userStore = useUserStore();
await userStore.init();

// 4) 等 router 準備好再掛載（避免首屏閃爍/錯跳）
await router.isReady();
app.mount("#app");
