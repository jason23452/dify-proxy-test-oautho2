<template>
  <div class="min-h-screen flex flex-col">
    <header class="p-4 bg-gray-100 flex justify-end">
      <button
        v-if="!user.isLogged"
        @click="user.login"
        class="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Azure SSO 登入
      </button>
      <div v-else class="flex items-center space-x-4">
        <p>歡迎，{{ user.account.name }}</p>
        <button
          @click="user.logout"
          class="px-4 py-2 bg-red-500 text-white rounded"
        >
          登出
        </button>
      </div>
    </header>

    <main class="flex-1 p-4">
      <router-view v-if="initialized" />
      <div v-else class="flex-1 flex items-center justify-center">
        <p>正在初始化...</p>
      </div>
    </main>

    <footer class="p-4 bg-gray-100 text-center text-sm">
      &copy; 2025 Your Company
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "./stores/user";
import { useRouter, useRoute } from "vue-router";

const user = useUserStore();
const router = useRouter();
const route = useRoute();
const initialized = ref(false);

// 初始化 MSAL 狀態，處理 redirect 回調或讀取現有帳號
onMounted(async () => {
  try {
    await user.init();
    // 初始化完成後，若已登入則重新導航以觸發路由渲染
    if (user.isLogged) {
      router.replace({ path: route.fullPath });
    }
  } catch (e) {
    console.error('MSAL init error:', e);
  } finally {
    initialized.value = true;
  }
});
</script>

<style scoped>
/* 可以依需求自訂樣式 */
</style>
