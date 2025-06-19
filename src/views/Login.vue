<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h2 class="mb-4 text-2xl">請先登入</h2>
    <button @click="login" class="px-6 py-2 bg-blue-500 text-white rounded">登入</button>
  </div>
</template>
<script setup>
import { useUserStore } from "@/stores/user";
import { useRouter, useRoute } from "vue-router";
import { watch, onMounted } from "vue";

const user = useUserStore();
const router = useRouter();
const route = useRoute();

function login() {
  user.login();
}

// 進入 login 頁就判斷一次（防止 watch 太晚執行）
onMounted(() => {
  if (user.isLogged) {
    const redirect = route.query.redirect || "/";
    router.replace(redirect);
  }
});

</script>
