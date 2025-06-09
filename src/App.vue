<template>
  <div>
    <button v-if="!user.isLogged" @click="user.login">
      Azure SSO 登入
    </button>
    <div v-else>
      <p>歡迎，{{ user.account.name }}</p>
      <button @click="user.logout">登出</button>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useUserStore } from "./stores/user";

const user = useUserStore();

// 初始化一次，處理 redirect 回調或讀取現有帳號
onMounted(() => {
  user.init();
});
</script>
