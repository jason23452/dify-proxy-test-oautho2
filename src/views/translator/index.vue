<template>
  <div class="h-screen">
    <Translator @translate="handleTranslate" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Translator  from "@/components/Translator.vue";
import {Workflows_Translator} from "@/constants/general"


async function handleTranslate(data){
  await translateAPI(data);
}


async function translateAPI(data) {
  const payload = {
    inputs: {
      query: data.inputText,
      to_language: data.targetLang,
      translate_node: data.modelsStr, // 例如 "deepseek,qwen,doubao"
      from_language: data.sourceLang,
    },
    response_mode: "streaming",
    user: "abc-123",
  };

  const res = await fetch("YOUR_API_URL", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("API 錯誤");
  return await res.json(); // 建議讓後端直接回傳 { model1: "...", model2: "...", ... }
}

// onMounted(async () => {

//     await test();  
// })




</script>
