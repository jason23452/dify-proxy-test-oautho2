<template>
  <div>
    <button v-if="!account" @click="login">Azure SSO 登入</button>
    <div v-else>
      <p>歡迎，{{ account.username }}</p>
      <button @click="logout">登出</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { msalInstance, loginRequest } from "./auth/msal";

const account = ref(null);

onMounted(() => {
  // 檢查是否為 redirect 回傳
  msalInstance
    .handleRedirectPromise()
    .then((resp) => {
      if (resp && resp.account) {
        msalInstance.setActiveAccount(resp.account);
        account.value = resp.account;
      } else {
        // 若本地已有帳號，直接讀取

        const current = msalInstance.getAllAccounts()[0];
        console.log(current);
        if (current) {
          msalInstance.setActiveAccount(current);
          account.value = current;
        }
      }
    })
    .catch(console.error);
});

function login() {
  msalInstance.loginRedirect(loginRequest);
}

function logout() {
  msalInstance.logoutRedirect({
    postLogoutRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
  });
}
</script>
