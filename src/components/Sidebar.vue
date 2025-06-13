<template>
  <aside
    :class="[
      'flex flex-col bg-white shadow border-r border-slate-200 transition-all duration-300 z-10 relative overflow-y-auto',
      collapsed
        ? 'w-16 min-w-[56px] max-w-[64px]'
        : 'w-64 min-w-[220px] max-w-xs',
      'sm:rounded-r-2xl',
      'max-h-screen',
    ]"
  >
    <!-- LOGO區 -->
    <div
      class="flex flex-col items-center w-full border-b border-gray-200 py-4 gap-4"
    >
      <div
        :class="
          collapsed
            ? 'flex flex-col items-center space-y-2'
            : 'flex flex-row items-center justify-center space-x-3 w-full'
        "
      >
        <span
          class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-2xl font-bold shadow"
        >
          <span>AI</span>
        </span>
        <span
          v-if="!collapsed"
          class="text-2xl font-bold text-slate-800 tracking-tight"
          >GenAI</span
        >
        <button
          v-if="!collapsed && isChat"
          @click="addChat"
          class="ml-3 flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition sm:px-3 sm:py-3 rounded-full"
          :title="'新增對話'"
        >
          <Edit class="w-5 h-5" />
        </button>
      </div>
      <button
        v-if="collapsed && isChat"
        @click="addChat"
        class="mt-3 flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition px-3 py-3 rounded-full"
        :title="'新增對話'"
      >
        <Edit class="w-5 h-5" />
      </button>
    </div>

    <!-- Menu區 -->
    <ul class="flex sm:flex-col justify-between gap-1 w-full px-3 py-3 flex-1">
      <li v-for="item in menu" :key="item.key" @click="selectMenu(item)">
        <button
          :class="[
            'flex items-center transition group rounded-full',
            'max-sm:w-12 max-sm:h-12 max-sm:justify-center max-sm:p-0',
            'sm:w-full sm:px-3 sm:py-3 sm:justify-start',
            isActive(item)
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-slate-800 hover:bg-slate-50 hover:text-blue-600',
          ]"
        >
          <span
            class="w-4 h-4 rounded-full bg-blue-600/10 group-hover:bg-blue-600/20 transition"
          >
            <component
              v-if="item.icon"
              :is="item.icon"
              class="transition-all duration-200 w-4 h-4"
            />
          </span>
          <!-- 只在「未collapsed」且「sm以上」才顯示 label -->
          <span v-if="!collapsed" class="ml-3 hidden sm:inline">{{
            item.label
          }}</span>
        </button>
      </li>
    </ul>

    <div
      v-if="isChat && !collapsed"
      class="w-full px-3 pb-4 overflow-auto min-h-screen sm:min-h-0 sm:max-h-[calc(100vh-316px)]"
    >
      <AiHistory />
    </div>

    <div
      :class="[
        'w-full z-10 flex border-t border-gray-200 bg-white py-4 px-4',
        'sm:absolute sm:bottom-0 sm:left-0',
        collapsed
          ? 'flex-col space-y-2 items-center'
          : 'flex-row space-x-2 items-center',
      ]"
    >
      <button
        class="flex items-center justify-center py-1 px-2 rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition w-full"
        :class="collapsed ? 'justify-center' : 'justify-start flex-1'"
        @click="goProfile"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5.121 17.804A12 12 0 0012 21a12 12 0 006.879-3.196M15 10a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span class="ml-3" v-if="!collapsed">個人中心</span>
      </button>
      <button
        class="flex items-center justify-center size-7 rounded-full shadow-lg border-2 border-slate-200 bg-white/70 backdrop-blur hover:bg-blue-100 hover:border-blue-400 transition-all"
        @click="$emit('toggle')"
        :title="collapsed ? '展開側欄' : '收合側欄'"
        tabindex="0"
      >
        <ChevronLeft
          class="w-6 h-6 transition-transform duration-300"
          :style="{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }"
        />
      </button>
    </div>
  </aside>
</template>

<script setup>
import {
  Home,
  MessageCircle,
  Settings,
  ChevronLeft,
  Edit,
} from "lucide-vue-next";
import { useRouter, useRoute } from "vue-router";
import { computed ,inject  } from "vue";
import AiHistory from "@/components/AiHistory.vue";

const props = defineProps({
  collapsed: Boolean,
});
const router = useRouter();
const route = useRoute();

const menu = [
  { key: "home", label: "首頁", icon: Home, route: "/" },
  { key: "chat", label: "對話", icon: MessageCircle, route: "/chat" },
  { key: "setting", label: "設定", icon: Settings, route: "/setting" },
];

// 根據當前 route 判斷 active
const isActive = (item) => item.route === route.path;

// 判斷是不是在對話頁
const isChat = computed(() => route.path === "/chat");

const send_conversation_id = inject("send_conversation_id");

function selectMenu(item) {
  if (item.route) router.push(item.route);
}
function addChat() {
  // 傳空Id
  const id = "";
  send_conversation_id(id);
}
function goProfile() {
  router.push("/profile");
}
</script>
