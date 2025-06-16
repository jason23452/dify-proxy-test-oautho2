<template>
  <ChatBox :messages="ChatMessages" />
</template>

<script setup>
import { inject, onMounted, ref, watch } from "vue";
import { Get_conversation_history_messages } from "@/constants/general";
import { useUserStore } from "@/stores/user";
import ChatBox from "@/components/ChatBox.vue";

const user = useUserStore();

const Conversations_id = inject("Conversations_id");
const ChatMessages = ref([]);



watch(Conversations_id, (newId) => {
  GetConversationHistoryMessages(newId);
});

async function GetConversationHistoryMessages(Conversations_id) {
  const data = {
    conversation_id: Conversations_id,
    user: user.account.name,
    limit: 20,
  };

  try {
    const response = await Get_conversation_history_messages(data);
    // console.log(response.data.data);

    // 只取出 answer, id, query 欄位
    const historyMessage = response.data.data.map((item) => ({
      answer: item.answer,
      id: item.id,
      query: item.query,
    }));
    ChatMessages.value = historyMessage;
  } catch (error) {
    // 這裡可以根據需要做錯誤處理
    console.error(error);
    historyMessage = [];
  }
}
</script>
