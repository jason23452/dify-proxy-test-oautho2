// src/stores/user.js
import { defineStore } from "pinia";
import { msalInstance, loginRequest } from "../auth/msal";

export const useUserStore = defineStore("user", {
  state: () => ({
    account: null, // msal 的 account
    accessToken: "", // access_token
    idToken: "", // id_token
    expiresAt: 0, // UNIX timestamp (秒) 過期時間
    loginCalled: false, // 防重複登入
    _logoutTimer: null, // internal timer
    _refreshInterval: null, // 週期靜默更新用
  }),
  getters: {
    isLogged: (state) => !!state.account && !!state.accessToken,
  },
  actions: {
    // 初始化：處理重導回調或從快取取 token
    async init() {
      this.loginCalled = false;
      // 啟動自動 token 檢查
      if (this._refreshInterval) clearInterval(this._refreshInterval);
      this._refreshInterval = setInterval(() => {
        if (this.isLogged) this.ensureValidToken();
      }, 60 * 1000);

      try {
        const resp = await msalInstance.handleRedirectPromise();
        if (resp?.account && resp.accessToken) {
          msalInstance.setActiveAccount(resp.account);
          this._setAccount(
            resp.account,
            resp.idTokenClaims.exp,
            resp.accessToken,
            resp.idToken
          );
          return;
        }
        const all = msalInstance.getAllAccounts();
        if (all.length) {
          msalInstance.setActiveAccount(all[0]);
          const result = await msalInstance.acquireTokenSilent({
            account: all[0],
            scopes: loginRequest.scopes,
          });
          this._setAccount(
            result.account,
            result.idTokenClaims.exp,
            result.accessToken,
            result.idToken
          );
        }
      } catch (e) {
        console.error("MSAL init 錯誤:", e);
      }
    },

    _setAccount(acct, exp, accessToken, idToken) {
      this.account = acct;
      this.expiresAt = exp;
      this.accessToken = accessToken || "";
      this.idToken = idToken || "";
      // 自動登出 timer
      if (this._logoutTimer) clearTimeout(this._logoutTimer);
      const now = Math.floor(Date.now() / 1000);
      const msUntilExpire = (exp - now) * 1000;
      if (msUntilExpire > 0) {
        this._logoutTimer = setTimeout(() => {
          this.logout();
          console.warn("Token 已過期，自動登出");
        }, msUntilExpire);
      }
    },

    login() {
      this.loginCalled = true;
      return msalInstance.loginRedirect(loginRequest);
    },

    logout() {
      if (this._logoutTimer) clearTimeout(this._logoutTimer);
      if (this._refreshInterval) clearInterval(this._refreshInterval);
      this._logoutTimer = null;
      this._refreshInterval = null;
      msalInstance.logoutRedirect({
        postLogoutRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
      });
      this.account = null;
      this.accessToken = "";
      this.idToken = "";
      this.expiresAt = 0;
    },

    // 核心：確保 token 有效，靜默刷新並寫入最新 token
    async ensureValidToken() {
      const now = Math.floor(Date.now() / 1000);
      if (this.expiresAt - now > 60 && this.accessToken) {
        // Token 還有效
        return true;
      }
      try {
        const result = await msalInstance.acquireTokenSilent({
          account: this.account,
          scopes: loginRequest.scopes,
        });
        msalInstance.setActiveAccount(result.account);
        this._setAccount(
          result.account,
          result.idTokenClaims.exp,
          result.accessToken,
          result.idToken
        );
        console.log("[靜默刷新] 取得新 token：", result.accessToken);
        return true;
      } catch (e) {
        console.warn("silent token renew failed:", e);
        this.logout();
        return false;
      }
    },

    // 手動強制刷新（可手動觸發或其他情境用）
    async refreshAccessToken() {
      try {
        const result = await msalInstance.acquireTokenSilent({
          account: this.account,
          scopes: loginRequest.scopes,
          forceRefresh: true,
        });
        msalInstance.setActiveAccount(result.account);
        this._setAccount(
          result.account,
          result.idTokenClaims.exp,
          result.accessToken,
          result.idToken
        );
        return true;
      } catch (e) {
        console.warn("refreshAccessToken failed:", e);
        this.logout();
        return false;
      }
    },
  },
  persist: {
    paths: ["account", "accessToken", "idToken", "expiresAt"],
  },
});
