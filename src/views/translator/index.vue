<template>
  <Translator
    :translate="responsetranslate"
    :loading="loading"
    :error-msg="errorMsg"
    @translate="handleTranslate"
  />
</template>

<script setup>
import { ref } from "vue";
import Translator from "@/components/Translator.vue";
import { translatorStreaming } from "@/services/ChatStreaming";
import { useUserStore } from "@/stores/user";
const user = useUserStore();

const responsetranslate = ref([{ answer: {}, loading: false }]);
const loading = ref(false);
const errorMsg = ref("");

// 這是正確的 loading 流程
async function translateAPI(query, from_language, to_language, translate_node) {
  loading.value = true;
  errorMsg.value = "";
  responsetranslate.value = [{ answer: {}, loading: true }];
  try {
    let answer = {};
    const payload = {
      inputs: {
        query,
        to_language,
        translate_node, // e.g., "deepseek,qwen,doubao"
        from_language,
      },
      response_mode: "streaming",
      user: user.account.name,
    };

    // Streaming 回傳 (你原本的 yield/generator 保持不變)
    for await (const message of translatorStreaming(payload)) {
      if (message.event === "workflow_finished") {
        answer = message.data.outputs;
        break;
      }
    }

    responsetranslate.value = [{ answer, loading: false }];
    loading.value = false;
    return answer;
  } catch (error) {
    errorMsg.value = "翻譯失敗：" + (error.message || error);
    responsetranslate.value = [{ answer: {}, loading: false }];
    loading.value = false;
    throw error;
  }
}

// 接收子元件 emit 的事件
function handleTranslate(input, from, to, models) {
  translateAPI(input, from, to, models);
}
</script>
