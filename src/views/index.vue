<template>
  <div class="w-full flex bg-gray-50 min-h-screen h-screen">
    <!-- Sidebar：PC 版，>= sm 顯示 -->
    <Sidebar
      :collapsed="collapsed"
      @toggle="toggleSidebar"
      class="hidden sm:block h-auto min-h-screen"
    />

    <!-- Sidebar：Mobile Drawer 版，< sm 時浮動 -->
    <transition name="fade">
      <div
        v-if="showMobileSidebar"
        class="fixed inset-0 z-50 flex"
        aria-modal="true"
        tabindex="-1"
      >
        <!-- 遮罩 -->
        <div
          class="fixed inset-0 bg-black/30 backdrop-blur-sm"
          @click="closeMobileSidebar"
        ></div>
        <!-- 浮動側邊欄 -->
        <Sidebar
          :collapsed="false"
          @toggle="closeMobileSidebar"
          class="relative z-10 w-64 min-w-[220px] max-w-xs sm:hidden"
        />
      </div>
    </transition>

    <!-- 主要內容區 -->
    <main
      class="flex-1 bg-white transition-all duration-300"
      :style="{ '--sidebar-width': collapsed ? '56px' : '256px' }"
    >
      <!-- 展開/收合按鈕 for mobile -->
      <button
        class="sm:hidden mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-slate-200 bg-white/70 hover:bg-blue-100 transition"
        @click="showMobileSidebar = true"
        aria-label="展開選單"
      >
        <ChevronLeft class="w-6 h-6 rotate-180" />
      </button>
      <!-- Router 內容 -->
      <router-view />
      <!-- 範例首頁歡迎區塊 -->
      <div v-if="user.isLogged && route.path === '/'">
        <p>歡迎, {{ user.account.name }}</p>
        <p>使用者帳號: {{ user.account.username }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, provide } from "vue";
import { useUserStore } from "../stores/user";
import { Get_Mata } from "../constants/general";
import Sidebar from "@/components/Sidebar.vue";
import { useRoute } from "vue-router";
import { ChevronLeft } from "lucide-vue-next";
import { Get_Conversations, Delete_Conversation } from "@/constants/general";

const user = useUserStore();
const data = ref(null);
const error = ref(null);
const route = useRoute();
const collapsed = ref(false);
const showMobileSidebar = ref(false);

function toggleSidebar() {
  collapsed.value = !collapsed.value;
}
function closeMobileSidebar() {
  showMobileSidebar.value = false;
}

const formattedData = computed(() => {
  try {
    return JSON.stringify(data.value, null, 2);
  } catch {
    return String(data.value);
  }
});

async function loadData() {
  data.value = null;
  error.value = null;
  try {
    const response = await Get_Mata();
    data.value = response.data || response;
  } catch (err) {
    console.error("Error loading data:", err);
    error.value = err;
  }
}

function unicodeToString(str) {
  return str.replace(/\\u([\dA-Fa-f]{4})/g, function (match, grp) {
    return String.fromCharCode(parseInt(grp, 16));
  });
}

function formatTimestamp(timestamp) {
  // 只處理「秒」格式
  const date = new Date(timestamp * 1000); // 乘1000轉成毫秒
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const history = ref([]);
provide("history", history);

const Conversations_id = ref("");

provide("Conversations_id", Conversations_id);

provide("send_conversation_id", send_conversation_id);
provide("deleteRecord", deleteRecord);

async function deleteRecord(id) {
  console.log(`Deleting conversation with ID: ${id}`);
  const userName = user.account.name;

  try {
    // 發送 DELETE 請求，帶上對話 id 及 user 名稱
    await Delete_Conversation({
      conversation_id: id,
      user: userName,
    });

    // Dify 回傳 204 No Content，這裡直接當作刪除成功
    console.log(`Conversation ${id} deleted successfully.`);
    // 刪除前端顯示的對話
    history.value = history.value.filter((record) => record.id !== id);

    // 如果剛好選中的對話被刪了，清空 Conversations_id
    if (Conversations_id.value === id) {
      Conversations_id.value = "";
    }
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
}

function send_conversation_id(id) {
  Conversations_id.value = id;
  console.log("Selected conversation ID:", id);
}

watch(Conversations_id, (newVal) => {
  if (newVal) {
    GetHistory();
  }
});

async function GetHistory() {
  const limit = 100;
  const data = {
    user: user.account.name,
    limit: limit,
    sort_by: "updated_at",
  };
  try {
    const response = await Get_Conversations(data);
    if (Array.isArray(response.data.data)) {
      response.data.data.forEach((item) => {
        // 只 unshift 不同 id 的
        if (!history.value.some((h) => h.id === item.id)) {
          history.value.unshift({
            ...item,
            name: unicodeToString(item.name),
            updated_at: formatTimestamp(item.updated_at),
          });
        }
      });
      console.log("父的", history.value);
    }
    console.log(history.value);
  } catch (error) {
    console.error("Error fetching history:", error);
    history.value = [];
  }
}

onMounted(() => {
  if (user.isLogged) {
    loadData();
    // GetHistory();
  }
});
watch(
  () => user.isLogged,
  (loggedIn) => {
    if (loggedIn) loadData();
  }
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
