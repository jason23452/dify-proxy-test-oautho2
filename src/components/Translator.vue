<template>
  <div class="h-full min-h-screen bg-slate-50 flex items-center py-8 px-2">
    <!-- 標題 -->
    <div class="flex w-full items-center justify-center">
      <div
        class="w-full max-w-2xl bg-white rounded-2xl shadow p-8 flex flex-col gap-6 mb-8"
      >
        <div>
          <label class="block text-base font-medium text-slate-800 mb-2"
            >原文</label
          >
          <textarea
            v-model="inputText"
            rows="5"
            class="w-full rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-slate-50 p-4 text-base text-slate-800 shadow-sm transition"
            placeholder="請輸入需要翻譯的內容…"
          />
        </div>
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <div class="flex-1">
            <label class="block text-sm text-slate-400 mb-1">來源語言</label>
            <select
              v-model="sourceLang"
              class="w-full rounded-2xl border border-slate-200 p-2 text-base focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="auto">自動偵測</option>
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
                class="accent-teal-500 w-5 h-5 rounded"
              />
              <label
                :for="'model-' + m.value"
                class="ml-2 text-base text-slate-800"
                >{{ m.label }}</label
              >
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
          :disabled="loading || !inputText || selectedModels.length === 0"
          @click="handleTranslate"
        >
          {{ loading ? "翻譯中…" : "開始翻譯" }}
        </button>
      </div>
    </div>
    <!-- 外部容器：橫向排列翻譯結果 -->
    <div
      v-if="errorMsg || Object.keys(translatedTexts).length"
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
          v-for="model in Object.keys(translatedTexts)"
          :key="model"
          class="flex-1 w-full bg-slate-50 rounded-2xl p-4 shadow-sm flex flex-col"
        >
          <span class="block text-sm text-teal-500 font-semibold mb-1">
            {{ getModelLabel(model) }}
          </span>
          <span class="block text-sm text-slate-400 mb-2">翻譯結果：</span>
          <span class="text-base text-slate-800 whitespace-pre-line flex-1">
            {{ translatedTexts[model] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";

const inputText = ref("");
const sourceLang = ref("auto");
const targetLang = ref("en");
const loading = ref(false);
const errorMsg = ref("");

const availableModels = [
  { label: "Google 翻譯", value: "google" },
  { label: "DeepL", value: "deepl" },
  { label: "OpenAI", value: "openai" },
  { label: "自訂模型", value: "custom" },
];
// 預設至少一個（可改成多個，這邊先選第一個）
const selectedModels = ref([availableModels[0].value]);
const translatedTexts = ref({});

// Checkbox 至少選一個
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

async function translateAPI(text, source, target, model) {
  await new Promise((r) => setTimeout(r, 500));
  if (text.length < 2) throw new Error("內容太短");
  return `[${getModelLabel(model)}][${target}] ${text
    .split("")
    .reverse()
    .join("")}`;
}

const handleTranslate = async () => {
  errorMsg.value = "";
  translatedTexts.value = {};
  loading.value = true;
  try {
    const results = await Promise.all(
      selectedModels.value.map(async (model) => {
        const res = await translateAPI(
          inputText.value,
          sourceLang.value,
          targetLang.value,
          model
        );
        return [model, res];
      })
    );
    translatedTexts.value = Object.fromEntries(results);
  } catch (err) {
    errorMsg.value = err.message || "翻譯失敗";
  } finally {
    loading.value = false;
  }
};
</script>
