// src/stores/user.js
import { defineStore } from "pinia";
import { msalInstance, loginRequest } from "../auth/msal";

export const useUserStore = defineStore("user", {
  state: () => ({
    account: null,
    expiresAt: 0,      // UNIX timestamp (秒) 表示 idToken 過期時間
  }),
  getters: {
    isLogged: (state) => state.account !== null,
    now: () => Math.floor(Date.now() / 1000),
  },
  actions: {
    // 初始化：處理重導回調或從快取取 token
    async init() {
      try {
        const resp = await msalInstance.handleRedirectPromise();
        if (resp?.account) {
          msalInstance.setActiveAccount(resp.account);
          this._setAccount(resp.account, resp.idTokenClaims.exp);
          return;
        }
        const all = msalInstance.getAllAccounts();
        if (all.length) {
          // 取第一個 account 快快取
          const acct = all[0];
          msalInstance.setActiveAccount(acct);
          // idTokenClaims 需要先靜默取得
          const silent = await msalInstance.acquireTokenSilent({ ...loginRequest, account: acct });
          this._setAccount(acct, silent.idTokenClaims.exp);
        }
      } catch (e) {
        console.error("init error:", e);
        this.account = null;
      }
    },

    // 私有：設定 account 與過期時間
    _setAccount(acct, exp) {
      this.account = acct;
      this.expiresAt = exp || 0;
    },

    login() {
      msalInstance.loginRedirect(loginRequest);
    },

    logout() {
      msalInstance.logoutRedirect({
        postLogoutRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
      });
      this.account = null;
      this.expiresAt = 0;
    },

    /** 
     * 確保 token 還有效： 
     * - 若剩餘時間 > 60 秒，直接回傳 true 
     * - 否則嘗試靜默更新 
     * - 更新成功回傳 true，失敗則清除 state 並回傳 false 
     **/
    async ensureValidToken() {
      const now = Math.floor(Date.now() / 1000);
      // token 還有 60 秒以上才算有效
      if (this.expiresAt - now > 60) {
        return true;
      }
      try {
        const silent = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: this.account,
        });
        this._setAccount(silent.account, silent.idTokenClaims.exp);
        return true;
      } catch (e) {
        console.warn("silent token renew failed:", e);
        // 已過期或靜默更新失敗，自動登出並要求重登入
        this.logout();
        return false;
      }
    },
  },
  // 開啟 persistedState，將 account 和 expiresAt 保存在 localStorage
  persist: {
    paths: ["account", "expiresAt"],
  },
});
