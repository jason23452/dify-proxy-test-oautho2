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
      // console.log("changeKey", this.currentKey);
      this.currentKey = this.keyMap[routerName] || "";
    },
    getCurrentKey() {
      // console.log(this.currentKey);
      return this.currentKey;
    },
    getChatKey(){
        return this.keyMap.chat;
    },
    getTranslatorKey(){
    return this.keyMap.translator;
    }

  },
});
