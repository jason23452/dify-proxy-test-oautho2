<template>
  <div class="min-h-screen  relative flex flex-col p-4 sm:p-8"> <!-- 這裡加 flex flex-col -->
    <!-- Chat Title -->
    <h1 class="text-3xl font-bold text-slate-800">AI 對話框</h1>

    <!-- Chat Messages -->
    <div class="space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-20px)]  sm:max-h-[calc(100vh-168px)] ">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
      >
        <div
          :class="[
            'rounded-2xl px-4 py-3 max-w-[75%] shadow transition-all',
            msg.role === 'user'
              ? 'bg-white text-slate-800 border border-blue-600'
              : 'bg-slate-50 text-slate-800 border border-slate-200',
          ]"
        >
          <div
            v-if="msg.role === 'ai'"
            class="text-teal-500 font-semibold text-sm mb-1"
          >
            AI
          </div>
          <div v-else class="text-blue-600 font-semibold text-sm mb-1">你</div>
          <div class="text-base whitespace-pre-line">{{ msg.text }}</div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <form
      @submit.prevent="sendMessage"
      class="mt-auto flex items-center px-4 py-2 gap-2 w-full bg-white rounded-2xl border border-gray-500"
    >
      <textarea
        v-model="input"
        rows="1"
        placeholder="輸入訊息..."
        class="flex-1 resize-none bg-transparent outline-none text-base text-slate-800 placeholder-slate-400"
      />
      <button
        type="submit"
        class="ml-2 px-6 py-2 rounded-2xl bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition"
        :disabled="!input.trim()"
      >
        發送
      </button>
    </form>
  </div>
</template>


<script setup>
import { ref } from "vue";

const messages = ref([{ role: "ai", text: "你好，有什麼可以幫你？" }]);

const input = ref("");

function sendMessage() {
  if (!input.value.trim()) return;
  // 1. 加入用戶訊息
  messages.value.push({
    role: "user",
    text: input.value,
  });

  // 2. AI 假回應（此處你可替換成 API 呼叫）
  setTimeout(() => {
    messages.value.push({
      role: "ai",
      text: "這是 AI 的回覆內容，請接入你自己的 API。",
    });
  }, 800);

  input.value = "";
}
</script>

<style scoped>
/* 適合現代簡潔風格，可自由再微調 */
</style>
