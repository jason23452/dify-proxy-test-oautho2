// stores/apiKey.js
import { defineStore } from 'pinia';

export const useApiKeyStore = defineStore('apiKey', {
  state: () => ({
    keyMap: {
      chat: import.meta.env.VITE_API_KEY_CHAT,
      translator: import.meta.env.VITE_API_KEY_TRANSLATOR,
    },
    currentKey: import.meta.env.VITE_API_KEY_CHAT || "",
  }),
  actions: {
    changeKey(routerName) {
      this.currentKey = this.keyMap[routerName] || "";
    },
    getCurrentKey() {
      return this.currentKey;
    },
    getChatKet(){

        return this.keyMap.chat;
    }
  },
});
