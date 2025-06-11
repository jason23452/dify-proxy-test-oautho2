import { defineStore } from "pinia";
import { msalInstance, loginRequest } from "../auth/msal";

export const useUserStore = defineStore("user", {
  state: () => ({
    account: null,
    loginCalled: false,
  }),
  getters: {
    isLogged: (state) => state.account !== null,
  },
  actions: {
    async init() {
      this.loginCalled = false;
      try {
        const resp = await msalInstance.handleRedirectPromise();
        if (resp?.account) {
          msalInstance.setActiveAccount(resp.account);
          this.account = resp.account;
          return;
        }
        const all = msalInstance.getAllAccounts();
        if (all.length) {
          msalInstance.setActiveAccount(all[0]);
          this.account = all[0];
        }
      } catch (e) {
        console.error("MSAL init 錯誤:", e);
      }
    },

    login() {
      this.loginCalled = true;
      return msalInstance.loginRedirect(loginRequest);
    },

    logout() {
      msalInstance.logoutRedirect({
        postLogoutRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
      });
      this.account = null;
    },

    async ensureValidToken() {
      const now = Math.floor(Date.now() / 1000);
      const exp = this.account?.idTokenClaims?.exp || 0;
      if (exp - now > 60) return true;
      try {
        const result = await msalInstance.acquireTokenSilent({ account: this.account, scopes: loginRequest.scopes });
        msalInstance.setActiveAccount(result.account);
        this.account = result.account;
        return true;
      } catch (e) {
        console.warn("silent token renew failed:", e);
        this.logout();
        return false;
      }
    },
  },
  persist: { paths: ["account"] },
});