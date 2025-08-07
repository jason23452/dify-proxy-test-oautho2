<template>
  <div class="h-full min-h-screen bg-slate-50 flex items-center py-8 px-2">
    <div class="flex w-full items-center justify-center">
      <div
        class="w-full max-w-2xl bg-white rounded-2xl shadow p-8 flex flex-col gap-6 mb-8 relative"
      >
        <!-- loading 遮罩 -->
        <div
          v-if="showLoading"
          class="absolute inset-0 z-10 bg-white/70 flex flex-col items-center justify-center rounded-2xl"
        >
          <svg
            class="animate-spin h-8 w-8 text-blue-600 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span class="text-base text-blue-600 font-semibold">AI 翻譯中…</span>
        </div>
        <div>
          <label class="block text-base font-medium text-slate-800 mb-2"
            >原文</label
          >
          <textarea
            v-model="inputText"
            rows="5"
            :disabled="showLoading"
            class="w-full rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-slate-50 p-4 text-base text-slate-800 shadow-sm transition"
            placeholder="請輸入需要翻譯的內容…"
          />
        </div>
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <div class="flex-1">
            <label class="block text-sm text-slate-400 mb-1">來源語言</label>
            <select
              v-model="sourceLang"
              :disabled="showLoading"
              class="w-full rounded-2xl border border-slate-200 p-2 text-base focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="zh">中文</option>
              <option value="en">英文</option>
              <option value="ja">日文</option>
              <option value="ko">韓文</option>
              <option value="fr">法文</option>
            </select>
          </div>
          <svg
            class="w-7 h-7 mx-2 text-teal-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          <div class="flex-1">
            <label class="block text-sm text-slate-400 mb-1">目標語言</label>
            <select
              v-model="targetLang"
              :disabled="showLoading"
              class="w-full rounded-2xl border border-slate-200 p-2 text-base focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="en">英文</option>
              <option value="zh">中文</option>
              <option value="ja">日文</option>
              <option value="ko">韓文</option>
              <option value="fr">法文</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1"
            >AI 模型選擇（可多選）</label
          >
          <div class="flex gap-4 flex-wrap">
            <div
              v-for="m in availableModels"
              :key="m.value"
              class="flex items-center"
            >
              <input
                type="checkbox"
                :id="'model-' + m.value"
                :checked="selectedModels.includes(m.value)"
                @change="onModelChange(m.value, $event)"
                :disabled="showLoading"
                class="accent-teal-500 w-5 h-5 rounded"
              />
              <label
                :for="'model-' + m.value"
                class="ml-2 text-base text-slate-800"
              >
                {{ m.label }}
              </label>
            </div>
          </div>
          <div class="mt-1">
            <span class="text-sm text-slate-400">
              目前支援：
              <span class="font-medium text-teal-500">
                {{ availableModels.map((m) => m.label).join("、") }}
              </span>
            </span>
          </div>
        </div>
        <button
          class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-2xl py-3 transition shadow"
          :disabled="showLoading || !inputText || selectedModels.length === 0"
          @click="handleTranslate"
        >
          {{ showLoading ? "翻譯中…" : "開始翻譯" }}
        </button>
      </div>
    </div>
    <!-- 翻譯結果 -->
    <div
      v-if="errorMsg || filteredModels.length"
      class="w-full max-w-6xl bg-white rounded-2xl shadow p-8"
    >
      <div
        v-if="errorMsg"
        class="text-red-500 text-base rounded-2xl bg-red-50 p-4 mb-2"
      >
        {{ errorMsg }}
      </div>
      <div class="flex flex-col gap-6 justify-start items-stretch">
        <div
          v-for="model in filteredModels"
          :key="model"
          class="flex-1 w-full bg-slate-50 rounded-2xl p-4 shadow-sm flex flex-col"
        >
          <span class="block text-sm text-teal-500 font-semibold mb-1">
            {{ getModelLabel(model) }}
          </span>
          <span class="block text-sm text-slate-400 mb-2">翻譯結果：</span>
          <span class="text-base text-slate-800 whitespace-pre-line flex-1">
            {{ modelAnswers[model] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from "vue";

// props 修正
const props = defineProps({
  translate: {
    type: Array,
    required: false,
    default: () => [],
  },
});

// ========== loading 控制 ==============
const hasRequested = ref(false);
const showLoading = computed(() => {
  // 預設可編輯，只有按下翻譯才進入 loading 判斷
  if (!hasRequested.value) return false;
  return !props.translate.length || props.translate[0].loading !== true;
});
// =====================================

const modelAnswers = computed(() => {
  if (
    props.translate &&
    Array.isArray(props.translate) &&
    props.translate.length > 0 &&
    props.translate[0].answer
  ) {
    return props.translate[0].answer;
  }
  return {};
});
const filteredModels = computed(() =>
  Object.keys(modelAnswers.value).filter(
    (k) => modelAnswers.value[k] != null && modelAnswers.value[k] !== ""
  )
);

const inputText = ref("");
const sourceLang = ref("zh");
const targetLang = ref("en");
const errorMsg = ref("");
const emit = defineEmits(["translate"]);

const availableModels = [
  { label: "豆包", value: "doubao" },
  { label: "通義千問", value: "qwen" },
  { label: "DeepSeek", value: "deepseek" },
];
const selectedModels = ref([availableModels[0].value]);

function onModelChange(val, e) {
  if (!e.target.checked) {
    if (selectedModels.value.length === 1) {
      alert("至少需要選擇一個 AI 模型！");
      nextTick(() => {
        e.target.checked = true;
      });
      if (!selectedModels.value.includes(val)) {
        selectedModels.value.push(val);
      }
      return;
    }
    selectedModels.value = selectedModels.value.filter((v) => v !== val);
  } else {
    if (!selectedModels.value.includes(val)) {
      selectedModels.value.push(val);
    }
  }
}

function getModelLabel(val) {
  const found = availableModels.find((m) => m.value === val);
  return found ? found.label : val;
}

function handleTranslate() {
  hasRequested.value = true; // 只要有送出過翻譯，才進入 loading 控制
  emit(
    "translate",
    inputText.value,
    sourceLang.value,
    targetLang.value,
    selectedModels.value.join(",")
  );
}
</script>
