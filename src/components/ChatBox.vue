<template>
  <div class="min-h-screen relative flex flex-col py-6 px-8 bg-slate-50">
    <!-- Chat Title -->
    <h1 class="text-3xl font-bold text-slate-800 mb-6">AI 對話框</h1>

    <!-- Chat Messages -->
    <div
      class="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-20px)] sm:max-h-[calc(100vh-168px)] scrollbar-thin scrollbar-thumb-slate-200 px-8"
    >
      <ChatBubble
        v-for="msg in mergedMessages"
        :key="msg.id"
        :message="msg.text"
        :isUser="msg.role === 'user'"
        :avatar="msg.role === 'user' ? userAvatar : aiAvatar"
      />
    </div>

    <!-- Input Area -->
    <form
      @submit.prevent="sendMessage"
      class="mt-auto flex items-center px-4 py-2 gap-2 w-full bg-white rounded-2xl border border-gray-200 shadow"
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
import { ref, computed, onMounted , watch} from "vue";
import ChatBubble from "@/components/ChatBubble.vue";

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
});

// 依序合併 user/ai 訊息
const mergedMessages = computed(() => {
  // props.messages 每筆 {id, answer, query}
  // 一個 user, 一個 ai，組成一個陣列
  const arr = [];
  props.messages.forEach(msg => {
    // 先 user 再 ai
    arr.push({
      id: msg.id,
      role: "user",
      text: msg.query,
    });
    arr.push({
      // id: msg.id + "_ai",
      role: "ai",
      text: msg.answer,
    });
  });
  return arr;
});

// 頭像
const userAvatar = "https://i.pravatar.cc/100?img=1";
const aiAvatar = "https://i.pravatar.cc/100?img=5";

// 輸入框
const input = ref("");

// 提交訊息（這邊只模擬送出 user 訊息）
function sendMessage() {
  if (!input.value.trim()) return;
  // 這裡一般會 emit event 給父組件或呼叫 API
  // 這裡範例只清空輸入框
  input.value = "";
}


// onMounted(() => {
//   // 初始化或其他邏輯
//   console.log("ChatBox mounted with messages:", props.messages);
// });

</script>

