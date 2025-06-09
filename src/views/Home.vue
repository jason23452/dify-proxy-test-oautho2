<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">首頁 Home</h1>
    <div v-if="user.isLogged">
      <p>歡迎, {{ user.account.name }}</p>
      <p>使用者帳號: {{ user.account.username }}</p>
    </div>
    <div v-else>
      <p>您尚未登入，請先點擊「Azure SSO 登入」</p>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "../stores/user";

const user = useUserStore();
</script>
