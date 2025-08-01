<template>
  <ChatBox :messages="ChatMessages" :mode="mode" @send="handleSendMessage" />
</template>

<script setup>
import { inject, onMounted, ref, watch } from "vue";
import {
  Get_conversation_history_messages,
  Chat_Messages,
  File_Upload,
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

async function handleSendMessage(
  msg,
  ModelSelect,
  searchActive,
  deepthinkActive,
  previewFile
) {
  let data = {}; // 先宣告 data

  if (previewFile) {
    try {
      const formData = new FormData();
      formData.append("file", previewFile);
      formData.append("user", user.account.name); // 根據需求填寫 user id

      const response = await File_Upload(formData);
      const file_data = response.data;

      // 檢查是圖片還是文檔，可以自動判斷（這邊簡化為 image）
      const fileType = "image"; // 如果是 document 則改為 "document"

      data = {
        conversation_id: Conversations_id.value,
        user: user.account.name,
        query: msg,
        response_mode: "streaming",
        inputs: {
          llm_node: ModelSelect.value,
          deep_think: searchActive ? "yes" : "",
          online_search: deepthinkActive ? "yes" : "",
        },
        files: [
          {
            type: fileType, // "image" or "document"
            transfer_method: "local_file",
            upload_file_id: file_data.id
          },
        ],
        // parent_message_id: "",
      };
    } catch (error) {
      console.error(error);
      return; // 上傳失敗就不用再送訊息
    }
  } else {
    data = {
      conversation_id: Conversations_id.value,
      user: user.account.name,
      query: msg,
      response_mode: "streaming",
      inputs: {
        llm_node: ModelSelect.value,
        deep_think: searchActive ? "yes" : "",
        online_search: deepthinkActive ? "yes" : "",
      },
    };
  }

  try {
    const response = await Chat_Messages(data);
    // 解析 stream 資料（array）
    const parsedMessages = parseStreamingData(response.data);

    ChatMessages.value = parsedMessages;

    // 從最後一筆訊息取 conversation_id（通常每筆都一樣，只要取一個就好）
    if (
      parsedMessages.length > 0 &&
      parsedMessages[parsedMessages.length - 1].conversation_id
    ) {
      Conversations_id.value =
        parsedMessages[parsedMessages.length - 1].conversation_id;
    }
    // 或者如果每筆都一樣，也可用 parsedMessages[0].conversation_id

    mode.value = "chat";
    // data = ""; // 不建議這樣寫，清空物件沒意義
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
