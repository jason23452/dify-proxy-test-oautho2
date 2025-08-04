<template>
  <div class="h-screen relative flex flex-col py-6 px-8 bg-slate-50">
    <!-- Chat Title -->
    <div class="flex items-start mb-4">
      <ModelOption v-model="selectedOption" :options="modelOptions" />
    </div>

    <!-- Chat Messages -->
    <div
      class="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-20px)] sm:max-h-[calc(100vh-168px)] scrollbar-thin scrollbar-thumb-slate-200 px-8"
    >
      <ChatBubble
        v-for="msg in mergedMessages"
        :key="msg.id"
        :id="msg.id"
        :message="msg.text"
        :isUser="msg.role === 'user'"
        :avatar="msg.role === 'user' ? userAvatar : aiAvatar"
        :file="msg.file"
        :previewUrl="msg.previewUrl"
        :loading="msg.loading"
      />
    </div>

    <!-- Input Area -->
    <form
      @submit.prevent="sendMessage"
      class="mt-auto flex flex-col gap-2 px-4 py-2 w-full bg-white rounded-2xl border border-gray-200 shadow"
    >
      <!-- 檔案預覽區塊（只顯示 icon + 移除） -->
      <div
        v-if="previewFile"
        class="flex items-center bg-white rounded-xl shadow border border-gray-100 px-3 py-2 w-max"
      >
        <!-- icon -->
        <div
          class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 rounded mr-2"
        >
          <svg
            class="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <!-- 檔案名稱 -->
        <span class="text-[15px] text-gray-700 truncate max-w-[120px]">{{
          previewFile.name
        }}</span>
        <!-- 移除按鈕 -->
        <button
          type="button"
          @click="removePreview"
          class="ml-2 w-6 h-6 rounded-full bg-white border border-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-400 flex items-center justify-center shadow-sm"
          title="移除"
        >
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="none">
            <path
              d="M6 6l8 8M6 14L14 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- 輸入與按鈕區 -->
      <div class="flex items-center gap-2">
        <textarea
          v-model="input"
          rows="1"
          placeholder="輸入訊息..."
          class="flex-1 resize-none bg-transparent outline-none text-base text-slate-800 placeholder-slate-400"
        />
        <!-- 上傳檔案按鈕 -->
        <button
          type="button"
          @click="triggerFileUpload"
          class="flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 text-slate-600 transition"
          title="上傳檔案"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 15V7a5 5 0 0 0-10 0v10a3 3 0 1 0 6 0V7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          @change="onFileChange"
        />

        <!-- 其它功能按鈕區（可自行調整） -->
        <button
          type="button"
          @click="toggleSwitch('search')"
          :class="[
            'flex items-center justify-center w-10 h-10 rounded-2xl transition',
            searchActive
              ? 'bg-emerald-200 text-emerald-700 shadow border border-emerald-300'
              : 'bg-emerald-500 text-white hover:bg-emerald-600',
          ]"
          title="搜尋"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          @click="toggleSwitch('deepthink')"
          :class="[
            'flex items-center justify-center w-10 h-10 rounded-2xl transition',
            deepthinkActive
              ? 'bg-purple-200 text-purple-700 shadow border border-purple-300'
              : 'bg-purple-500 text-white hover:bg-purple-600',
          ]"
          title="DeepThink"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12a4 4 0 1 0 6 0M8 8a4 4 0 1 1 8 0"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <!-- 發送按鈕 -->
        <button
          type="submit"
          class="ml-2 px-6 py-2 rounded-2xl bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition"
          :disabled="!input.trim() && !previewFile"
        >
          發送
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ChatBubble from "@/components/ChatBubble.vue";
import ModelOption from "@/components/ModelOption.vue";

// 模型選項
const modelOptions = [
  { value: "DeepSeek", label: "DeepSeek", desc: "適合大多數任務" },
  { value: "DeepSeek-local", label: "DeepSeek-local", desc: "使用進階推理" },
  { value: "Qwen", label: "Qwen", desc: "最快速完成推理" },
  {
    value: "Doubao-Seed-1.6",
    label: "Doubao-Seed-1.6",
    desc: "增長經理和規劃推理",
  },
];
const selectedOption = ref(modelOptions[0]);

const emit = defineEmits(["send", "RemovePreview"]);

const searchActive = ref(false);
const deepthinkActive = ref(false);

function toggleSwitch(type) {
  if (type === "search") searchActive.value = !searchActive.value;
  if (type === "deepthink") deepthinkActive.value = !deepthinkActive.value;
}

// 檔案預覽 state 與方法
const previewFile = ref(null);
const previewUrl = ref("");
const fileInput = ref(null);

function triggerFileUpload() {
  fileInput.value && fileInput.value.click();
}
function onFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    previewFile.value = file;
    if (file.type && file.type.startsWith("image/")) {
      previewUrl.value = URL.createObjectURL(file);
    } else {
      previewUrl.value = "";
    }
    event.target.value = "";
  }
}
function removePreview() {
  emit("RemovePreview", previewFile.value);
  previewUrl.value = "";
  previewFile.value = null;
}

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  mode: {
    type: String,
    default: "history",
  },
});




watch(
  () => props.messages,
  (messages) => {
    if (!messages || messages.length === 0) return;

    // 這裡以「最新一筆」為同步依據，也可以改成 [0] 代表最舊一筆
    const latest = messages[messages.length - 1];

    // llm_node 同步
    const found = modelOptions.find(opt => opt.value === latest.llm_node);
    if (found) selectedOption.value = found;

    // deep_think/online_search 同步
    deepthinkActive.value = !!latest.deep_think;
    searchActive.value = !!latest.online_search;
  },
  { immediate: true, deep: true }
);





const mergedMessages = ref([]);


watch(
  () => [props.messages, props.mode],
  ([messages, mode]) => {
    if (mode === "history") {
      const arr = [];

      messages.forEach((msg) => {
        // 取出 user 檔案（假設 message_files 是 array，且第一個就是你要顯示的）
        let userFile = msg.message_files?.[0] || null;
        let userPreviewUrl =
          userFile &&
          userFile.mime_type &&
          userFile.mime_type.startsWith("image/")
            ? userFile.url
            : "";

        arr.push({
          id: msg.message_id,
          role: "user",
          text: msg.query,
          file: userFile,
          previewUrl: userPreviewUrl,
        });
        arr.push({
          id: msg.task_id,
          role: "ai",
          text: unicodeToString(msg.answer),
          file: null,
          previewUrl: "",
        });
      });
      mergedMessages.value = arr;
    } else if (mode === "chat") {
      messages.forEach((msg) => {
        // 找出要覆蓋的 ai bubble
        let aiMsg = mergedMessages.value.find(
          (item) =>
            item.role === "ai" &&
            (item.id === msg.task_id || item.id === lastTempId.value)
        );
        if (aiMsg) {
          aiMsg.text = unicodeToString(msg.answer);
          aiMsg.id = msg.task_id; // 更新 id 成正確 task_id
        } else {
          mergedMessages.value.push({
            id: msg.task_id,
            role: "ai",
            text: unicodeToString(msg.answer),
          });
        }
      });
    } else {
      console.warn("未知的模式:", mode);
    }
  },
  { immediate: true, deep: true }
);

function unicodeToString(str) {
  return typeof str === "string"
    ? str.replace(/\\u([\dA-Fa-f]{4})/g, (match, grp) =>
        String.fromCharCode(parseInt(grp, 16))
      )
    : "";
}

const userAvatar = "https://i.pravatar.cc/100?img=1";
const aiAvatar = "https://i.pravatar.cc/100?img=5";
const input = ref("");
const lastTempId = ref(null);

// ,previewFile.value

function sendMessage() {
  if (!input.value.trim() && !previewFile.value) return;
  const tempId = crypto.randomUUID();
  lastTempId.value = tempId;

  emit(
    "send",
    input.value,
    selectedOption.value,
    searchActive.value,
    deepthinkActive.value,
    previewFile.value
  );

  mergedMessages.value.push({
    id: tempId,
    role: "user",
    text: input.value,
    file: previewFile.value,
    previewUrl: previewUrl.value,
  });
  mergedMessages.value.push({
    id: tempId,
    role: "ai",
    text: "AI 思考中...",
    file: null,
    previewUrl: "",
  });

  input.value = "";
  removePreview();
}
</script>
