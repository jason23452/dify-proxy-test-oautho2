<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">首頁 Home</h1>
    <div v-if="account">
      <p>歡迎, {{ account.name }}</p>
    </div>
    <div v-else>
      <p>您尚未登入，請先點擊「Azure SSO 登入」</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { msalInstance } from '../auth/msal';

const account = ref(null);

onMounted(() => {
  // 嘗試從 MSAL 取得已登入帳號
  const current = msalInstance.getActiveAccount();
  if (current) {
    account.value = current;
}
});
</script>

<style scoped>
/* 可以根據需求自訂 CSS */
</style>