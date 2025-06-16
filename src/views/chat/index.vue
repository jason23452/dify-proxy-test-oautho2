<template>
  <ChatBox :messages="ChatMessages" :mode="mode" @send="handleSendMessage" />
</template>

<script setup>
import { inject, onMounted, ref, watch } from "vue";
import {
  Get_conversation_history_messages,
  Chat_Messages,
} from "@/constants/general";
import { useUserStore } from "@/stores/user";
import ChatBox from "@/components/ChatBox.vue";

const user = useUserStore();

const Conversations_id = inject("Conversations_id");

const ChatMessages = ref([]);
const mode = ref("history"); // 你要的模式

watch(Conversations_id, async (newId) => {
  await GetConversationHistoryMessages(newId);
});

async function GetConversationHistoryMessages(Conversations_id) {
  const data = {
    conversation_id: Conversations_id,
    user: user.account.name,
    limit: 20,
  };
  try {
    const response = await Get_conversation_history_messages(data);

    const historyMessage = response.data.data.map((item) => ({
      answer: item.answer,
      id: item.id,
      query: item.query,
    }));

    ChatMessages.value = historyMessage;

    // 例如查詢歷史紀錄時設為 read-only
    mode.value = "history";
  } catch (error) {
    console.error(error);
    ChatMessages.value = [];
    mode.value = "error"; // 錯誤狀態
  }
}

function parseStreamingData(str) {
  // 移除空白行，split by "data: "（或 \n）
  return str
    .split("\n")
    .filter((line) => line.trim().startsWith("data:"))
    .map((line) => {
      const jsonStr = line.replace(/^data:\s*/, "");
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        return null;
      }
    })
    .filter((x) => !!x);
}

async function handleSendMessage(msg) {
  const data = {
    conversation_id: Conversations_id.value,
    user: user.account.name,
    query: msg,
    response_mode: "streaming",
    inputs: {},
    // parent_message_id:"",
  };
  try {
    const response = await Chat_Messages(data);
    ChatMessages.value = parseStreamingData(response.data);
    mode.value = "chat"; // 切換到聊天模式
    // console.log("訊息已發送:", response);
    console.log("訊息已發送:", ChatMessages.value);
  } catch (error) {}
}
</script>
