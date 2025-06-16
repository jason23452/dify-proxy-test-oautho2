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
    // 解析 stream 資料（array）
    const parsedMessages = parseStreamingData(response.data);

    ChatMessages.value = parsedMessages;

    // 從最後一筆訊息取 conversation_id（通常每筆都一樣，只要取一個就好）
    if (parsedMessages.length > 0 && parsedMessages[parsedMessages.length - 1].conversation_id) {
      Conversations_id.value = parsedMessages[parsedMessages.length - 1].conversation_id;
    }
    // 或者如果每筆都一樣，也可用 parsedMessages[0].conversation_id

    mode.value = "chat";
    console.log("訊息已發送:", ChatMessages.value);
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  if (Conversations_id.value) {
    GetConversationHistoryMessages(Conversations_id.value);
  }
});


</script>
