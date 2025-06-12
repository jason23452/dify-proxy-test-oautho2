<template>
  <div class="w-full flex bg-gray-50 min-h-screen">
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
      class="flex-1 bg-white p-6 transition-all duration-300"
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
import { ref, computed, onMounted, watch } from "vue";
import { useUserStore } from "../stores/user";
import { Get_Mata } from "../constants/general";
import Sidebar from "@/components/Sidebar.vue";
import { useRoute } from "vue-router";
import { ChevronLeft } from "lucide-vue-next";

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

onMounted(() => {
  if (user.isLogged) {
    loadData();
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
