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
import { ref, watch } from "vue";
import ChatBubble from "@/components/ChatBubble.vue";
const emit = defineEmits(["send"]);

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  mode: {
    type: String,
    default: "history", // 預設模式
  },
});

// 依序合併 user/ai 訊息
const mergedMessages = ref([]);

// 使用 watch 監控 messages
watch(
  () => [props.messages, props.mode],
  ([messages, mode]) => {
    if (mode === "history") {
      // 直接重建歷史訊息
      const arr = [];
      messages.forEach((msg) => {
        arr.push({
          id: msg.message_id,     // user id 用 message_id
          role: "user",
          text: msg.query,
        });
        arr.push({
          id: msg.task_id,        // ai id 用 task_id
          role: "ai",
          text: unicodeToString(msg.answer), // 這裡建議也轉一下
        });
      });
      mergedMessages.value = arr;
    } else if (mode === "chat") {
      messages.forEach((msg) => {
        // 找到同 task_id 且 role=user 的訊息
        let userMsg = mergedMessages.value.find(
          (item) => item.id === msg.task_id && item.role === "user"
        );
        if (userMsg) {
          // user id 換成 message_id
          userMsg.id = msg.message_id;
        }
        // ai 回應 id 用 task_id
        let aiMsg = mergedMessages.value.find(
          (item) => item.id === msg.task_id && item.role === "ai"
        );
        if (aiMsg) {
          // << 這裡用 unicodeToString >>
          aiMsg.text += unicodeToString(msg.answer);
        } else {
          mergedMessages.value.push({
            id: msg.task_id,
            role: "ai",
            text: unicodeToString(msg.answer),
          });
        }
      });

      console.log("合併後的訊息:", mergedMessages.value);
    } else {
      console.warn("未知的模式:", mode);
    }
  },
  { immediate: true, deep: true }
);



function unicodeToString(str) {
  return typeof str === "string"
    ? str.replace(/\\u([\dA-Fa-f]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)))
    : "";
}


// 頭像
const userAvatar = "https://i.pravatar.cc/100?img=1";
const aiAvatar = "https://i.pravatar.cc/100?img=5";

// 輸入框
const input = ref("");
const lastTempId = ref(null); // 暫存臨時 id

// 提交訊息
function sendMessage() {
  if (!input.value.trim()) return;
  const tempId = crypto.randomUUID();
  emit("send", input.value);
  mergedMessages.value.push({
    id: tempId,
    role: "user",
    text: input.value,
  });
  lastTempId.value = tempId; // 記住臨時 id
  input.value = "";
}
</script>
