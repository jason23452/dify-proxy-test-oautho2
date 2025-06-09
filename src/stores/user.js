import { defineStore } from "pinia";
import { msalInstance, loginRequest } from "../auth/msal";

export const useUserStore = defineStore("user", {
  state: () => ({
    account: null,
  }),
  getters: {
    isLogged: (state) => state.account !== null,
  },
  actions: {
    async init() {
      // 處理 redirect 回來的結果
      try {
        const resp = await msalInstance.handleRedirectPromise();
        if (resp?.account) {
          msalInstance.setActiveAccount(resp.account);
          this.account = resp.account;
          return;
        }
        // 如果本地已有登入帳號
        const all = msalInstance.getAllAccounts();
        if (all.length) {
          msalInstance.setActiveAccount(all[0]);
          this.account = all[0];
        }
      } catch (e) {
        console.error("MSAL handleRedirectPromise 錯誤:", e);
      }
    },
    login() {
      msalInstance.loginRedirect(loginRequest);
    },
    logout() {
      msalInstance.logoutRedirect({
        postLogoutRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
      });
    },
  },
});
