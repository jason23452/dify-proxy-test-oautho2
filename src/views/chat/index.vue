<template>
  <ChatBox
    :messages="ChatMessages"
    :mode="mode"
    @send="handleSendMessage"
    @RemovePreview="removePreview"
  />
</template>

<script setup>
import { inject, onMounted, ref, watch } from "vue";
import {
  Get_conversation_history_messages,
  File_Upload,
} from "@/constants/general";
import { chatStreaming } from "@/services/ChatStreaming";
import { useUserStore } from "@/stores/user";
import ChatBox from "@/components/ChatBox.vue";

const user = useUserStore();

const Conversations_id = inject("Conversations_id");

const ChatMessages = ref([]);
const mode = ref("history");

const previewUrl = ref("");
const previewFile = ref(null);

const isStreaming = ref(false);

// 監聽 Conversations_id，如果正在streaming就不載入歷史
watch(Conversations_id, async (newId) => {
  if (isStreaming.value) return;
  await GetConversationHistoryMessages(newId);
});

async function GetConversationHistoryMessages(Conversations_id) {
  // streaming中就不處理
  if (isStreaming.value) return;

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
      message_files: item.message_files,
      llm_node: item.inputs?.llm_node || "",
      deep_think: item.inputs?.deep_think === "yes",
      online_search: item.inputs?.online_search === "yes",
    }));
    ChatMessages.value = historyMessage;

    // 例如查詢歷史紀錄時設為 read-only
    mode.value = "history";
  } catch (error) {
    console.error(error);
    ChatMessages.value = [];
    mode.value = "error";
  }
}

async function handleSendMessage(
  msg,
  ModelSelect,
  searchActive,
  deepthinkActive,
  previewFile,
  loading
) {
  if (isStreaming.value) return; // 避免重複送出
  isStreaming.value = true; // 標記streaming開始

  let data = {};
  if (previewFile) {
    try {
      const formData = new FormData();
      formData.append("file", previewFile);
      formData.append("user", user.account.name);

      const response = await File_Upload(formData);
      const file_data = response.data;
      const fileType = "image"; // 如果需要可判斷文件類型

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
            type: fileType,
            transfer_method: "local_file",
            upload_file_id: file_data.id,
          },
        ],
      };
    } catch (error) {
      console.error(error);
      isStreaming.value = false;
      return; // 上傳失敗就不繼續
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
    let result = "";
    let message_id = "";
    let task_id = "";
    loading = false;

    for await (const message of chatStreaming(data)) {
      const answer = message.data?.outputs?.answer;
      if (answer) result += answer;

      // 動態更新 conversation_id 等資訊
      Conversations_id.value =
        message.conversation_id || Conversations_id.value;
      message_id = message.message_id || message_id;
      task_id = message.task_id || task_id;

      // ModelSelect.value;
      // searchActive  =message.
      // deepthinkActive
      if (message.event === "message_end") {
        loading = true;
        break;
      }
    }
    const responseChat = [
      {
        answer: result,
        Conversations_id,
        message_id,
        task_id,
        loading: loading,
      },
    ];

    ChatMessages.value = responseChat;
    mode.value = "chat";
  } catch (error) {
    console.error(error);
  } finally {
    isStreaming.value = false; // streaming結束可載入歷史
    removePreview();
  }
}

function removePreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
}

onMounted(() => {
  if (Conversations_id.value) {
    GetConversationHistoryMessages(Conversations_id.value);
  }
});
</script>
