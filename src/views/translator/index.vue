<template>
  <div class="h-screen">
    <Translator :translate="responsetranslate" @translate="translateAPI" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Translator  from "@/components/Translator.vue";
import {translatorStreaming} from "@/services/ChatStreaming"
import { useUserStore } from "@/stores/user";
const user = useUserStore();

const responsetranslate = ref([]);






async function translateAPI(query, from_language, to_language, translate_node) {
  let loading = false;
  // 1. Declare 'answer' here with 'let' so it's accessible throughout the function.
  let answer = null; 

  const payload = {
    inputs: {
      query: query,
      to_language: to_language,
      translate_node: translate_node, // e.g., "deepseek,qwen,doubao"
      from_language: from_language,
    },
    response_mode: "streaming",
    user: user.account.name,
  };

  // The 'loading' variable seems to be used inconsistently.
  // You might want to set loading = true here before the try block.
  // loading = true; 

  try {
    for await (const message of translatorStreaming(payload)) {
      if (message.event === "workflow_finished") {
        // Assign the value to the 'answer' variable declared outside.
        answer = message.data.outputs; 
        console.log(answer);
        loading = true; // Set loading to false when done.
        break;
      }
    }
    // You are updating a reactive variable, which is fine.
    const response = [
      {
        answer: answer,
        loading: loading,
      },
    ];
    responsetranslate.value = response;

    // 4. Return the final answer from the function.
    return answer;

  } catch (error) {
    // 2. Correctly log the 'error' object.
    console.error("An error occurred during translation:", error); 
    // You might want to throw the error again or handle it.
    throw error;
  } 
}

// onMounted(async () => {

//     await test();  
// })




</script>
