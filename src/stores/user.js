import { defineStore } from "pinia";
import { msalInstance, loginRequest } from "../auth/msal";

export const useUserStore = defineStore("user", {
  state: () => ({
    account: null,
    idToken: null, // 單獨保存 idToken 以利持久化
  }),
  getters: {
    isLogged: (state) => state.account !== null && !!state.idToken,
  },
  actions: {
    async init() {
      try {
        const resp = await msalInstance.handleRedirectPromise();
        if (resp?.account && resp.idToken) {
          msalInstance.setActiveAccount(resp.account);
          this.account = resp.account;
          this.idToken = resp.idToken;
          return;
        }
        // 本地已有帳號時自動 silent renew
        const all = msalInstance.getAllAccounts();
        if (all.length) {
          msalInstance.setActiveAccount(all[0]);
          this.account = all[0];
          await this.silentRenew();
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
      this.account = null;
      this.idToken = null;
    },
    async silentRenew() {
      try {
        const silentReq = {
          ...loginRequest,
          account: msalInstance.getActiveAccount(),
        };
        const resp = await msalInstance.acquireTokenSilent(silentReq);
        if (resp && resp.idToken) {
          this.account = resp.account;
          this.idToken = resp.idToken;
        }
        return resp;
      } catch (e) {
        // 無法 silent 取得，需重新登入
        console.warn("Silent renew 失敗", e);
        this.account = null;
        this.idToken = null;
        return null;
      }
    },
    async ensureValidToken() {
      // 無帳號直接 return false
      if (!this.account) return false;
      if (!this.idToken) {
        await this.silentRenew();
        return !!this.idToken;
      }
      // 判斷 JWT 過期
      try {
        const payload = JSON.parse(atob(this.idToken.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp - now < 300) {
          await this.silentRenew();
        }
        return !!this.idToken;
      } catch {
        await this.silentRenew();
        return !!this.idToken;
      }
    },
  },
  persist: {
    key: 'user',
    paths: ['account', 'idToken'],
  },
});
