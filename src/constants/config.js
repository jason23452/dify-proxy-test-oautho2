// src/auth/msal.js
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage", // 或 "sessionStorage"
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// 登入參數，同前略
export const loginRequest = {
  scopes: import.meta.env.VITE_MSAL_LOGIN_SCOPE.split(",")
};
// 新增：初始化函式
export async function initializeMsal() {
  try {
    await msalInstance.initialize();
    console.log("MSAL 初始化完成");
  } catch (e) {
    console.error("MSAL 初始化失敗:", e);
    throw e;
  }
}












