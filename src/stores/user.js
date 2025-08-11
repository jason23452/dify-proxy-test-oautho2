// src/stores/user.js
import { defineStore } from "pinia";
import { msalInstance, loginRequest } from "../constants/config";

// 可選：若你已有 constants，直接改成從你的檔案匯入
// export const TOKEN_CONFIG = { REFRESH_THRESHOLD_HOURS: 0.1 }; // 6 分鐘
const TOKEN_CONFIG = { REFRESH_THRESHOLD_HOURS: 0.1 }; // NEW: 預設 6 分鐘緩衝

export const useUserStore = defineStore("user", {
  state: () => ({
    account: null,        // msal 的 account
    accessToken: "",      // access_token
    idToken: "",          // id_token
    expiresAt: 0,         // UNIX timestamp (秒) 過期時間（沿用你(1)）
    loginCalled: false,   // 防重複登入
    _logoutTimer: null,   // internal timer
    _refreshInterval: null, // 週期靜默更新

    // NEW: (2) 的強化旗標
    isFreshToken: false,  // 避免重覆刷新
  }),

  getters: {
    // 保留(1)
    isLogged: (state) => !!state.account && !!state.accessToken,

    // NEW: 與(2)一致的易用 getters（用你(1)的 expiresAt 秒為基準）
    tokenExpiresAtMs: (state) => (state.expiresAt ? state.expiresAt * 1000 : null),
    isTokenExpired(state) {
      if (!state.expiresAt) return true;
      return Date.now() >= state.expiresAt * 1000;
    },
    shouldRefreshToken(state) {
      if (!state.expiresAt) return false;
      const thresholdMs = TOKEN_CONFIG.REFRESH_THRESHOLD_HOURS * 60 * 60 * 1000;
      return Date.now() >= state.expiresAt * 1000 - thresholdMs;
    },
  },

  actions: {
    // 初始化：處理重導回調或從快取取 token（保留(1)邏輯）
    async init() {
      this.loginCalled = false;

      // 啟動自動 token 檢查（保留並稍作增強）
      if (this._refreshInterval) clearInterval(this._refreshInterval);
      this._refreshInterval = setInterval(async () => {
        if (!this.isLogged) return;
        // NEW: 先跑一次 checkTokenStatus（含「即將到期預刷新」），
        // 若仍有效再進行原本的 ensureValidToken 保險。
        const { valid } = await this.checkTokenStatus();
        if (valid) await this.ensureValidToken();
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
      this.expiresAt = exp;               // 秒級（沿用你(1)）
      this.accessToken = accessToken || "";
      this.idToken = idToken || "";

      // 自動登出 timer（保留(1)）
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

      // 先清本地再 redirect（避免回跳時殘留）
      this.account = null;
      this.accessToken = "";
      this.idToken = "";
      this.expiresAt = 0;
      this.isFreshToken = false;

      msalInstance.logoutRedirect({
        postLogoutRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
      });
    },

    // NEW: (2) 的「統一入口」檢查流程
    // 回傳 { valid: boolean, shouldRedirectToLogin: boolean }
    async checkTokenStatus() {
      if (this.isTokenExpired) {
        console.log("Token 已過期，登出用戶");
        this.logout();
        return { valid: false, shouldRedirectToLogin: true };
        // 這裡不做手動 redirect，由 logoutRedirect 接手
      }

      if (this.shouldRefreshToken && !this.isFreshToken) {
        console.log("Token 即將到期，開始刷新");
        try {
          const ok = await this.refreshAccessToken(); // 內含 silent & fallback
          return { valid: !!ok, shouldRedirectToLogin: !ok };
        } catch (error) {
          console.error("Token 刷新失敗:", error);
          this.logout();
          return { valid: false, shouldRedirectToLogin: true };
        }
      }

      return { valid: true, shouldRedirectToLogin: false };
    },

    // 核心：確保 token 有效（保留(1)，作為 checkTokenStatus 的後盾）
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
        // NEW: 與(2)一致的介面式 fallback（需要互動時改用 redirect）
        // 若希望直接登出也可保留原行為
        try {
          await msalInstance.acquireTokenRedirect({
            account: this.account,
            scopes: loginRequest.scopes,
          });
          return false; // 會跳轉，不會到這裡
        } catch (e2) {
          console.warn("acquireTokenRedirect 失敗，改為登出:", e2);
          this.logout();
          return false;
        }
      }
    },

    // NEW: (2) 的強化刷新流程 + forceRefresh
    async refreshAccessToken() {
      if (!this.account) return false;
      this.isFreshToken = true;
      try {
        const result = await msalInstance
          .acquireTokenSilent({
            account: this.account,
            scopes: loginRequest.scopes,
            forceRefresh: true,
          })
          .catch(async (error) => {
            // 與(2)相同：需要互動時改用 redirect
            // 在 @azure/msal-browser 中會丟 InteractionRequiredAuthError
            console.log("refreshAccessToken silent error:", error);
            await msalInstance.acquireTokenRedirect({
              account: this.account,
              scopes: loginRequest.scopes,
              forceRefresh: true,
            });
            return null; // 會跳轉
          });

        if (!result) return false; // 跳轉了

        msalInstance.setActiveAccount(result.account);
        this._setAccount(
          result.account,
          result.idTokenClaims.exp,
          result.accessToken,
          result.idToken
        );
        this.isFreshToken = false;
        console.log("RefreshToken success");
        return true;
      } catch (e) {
        console.warn("refreshAccessToken failed:", e);
        this.isFreshToken = false;
        this.logout();
        return false;
      }
    },
  },

  // NEW: 使用 (2) 的 persist 寫法，但保留你(1)只存必要欄位的理念
  persist: {
    enabled: true,
    strategies: [
      {
        key: "user",
        storage: localStorage,
        // 只持久化必要欄位（避免把內部 timer 等非序列化物件存進去）
        paths: ["account", "accessToken", "idToken", "expiresAt"],
      },
    ],
  },
});
