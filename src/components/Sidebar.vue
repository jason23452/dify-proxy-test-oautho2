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
        <!-- 展開且在對話頁時 edit 在 logo 右方 -->
        <button
          v-if="!collapsed && selected === 'chat'"
          @click="addChat"
          class="ml-3 flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition sm:px-3 sm:py-3 rounded-full"
          :title="'新增對話'"
        >
          <Edit class="w-5 h-5" />
        </button>
      </div>
      <!-- 收合且在對話頁時 edit 獨立在 logo 下方 -->
      <button
        v-if="collapsed && selected === 'chat'"
        @click="addChat"
        class="mt-3 flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition px-3 py-3 rounded-full"
        :title="'新增對話'"
      >
        <Edit class="w-5 h-5" />
      </button>
    </div>

    <!-- Menu區 -->
    <ul class="flex sm:flex-col  justify-between gap-1 w-full px-3 py-3 flex-1">
      <li v-for="item in menu" :key="item.key" @click="selectMenu(item)">
        <button
          :class="[
            // 共用
            'flex items-center transition group',
            // 圓形＆置中
            'rounded-full',
            // 小螢幕：圓形，icon置中，label隱藏
            'max-sm:w-12 max-sm:h-12 max-sm:justify-center max-sm:p-0',
            // 大螢幕：橫向長條
            'sm:w-full sm:px-4 sm:py-3 sm:justify-start',
            // 選中/未選中
            selected === item.key
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-slate-800 hover:bg-slate-50 hover:text-blue-600',
          ]"
        >
          <!-- Icon 動態調整大小 -->
          <component
            v-if="item.icon"
            :is="item.icon"
            class="transition-all duration-200 w-6 h-6"
          />
          <!-- label: 小螢幕隱藏 -->
          <span class="ml-3 max-sm:hidden">{{ item.label }}</span>
        </button>
      </li>
    </ul>

    <!-- AI紀錄，僅在對話頁展開時顯示，max-h 防止超出 -->
    <div
      v-if="selected === 'chat' && !collapsed"
      class="w-full px-3 pb-4 overflow-auto  min-h-screen  sm:min-h-0  sm:max-h-[calc(100vh-316px)]"
    >
      <AiHistory />
    </div>

    <!-- Footer：sm 以上絕對定位 -->
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
import { useRouter } from "vue-router";
import { ref, defineProps } from "vue";
import AiHistory from "@/components/AiHistory.vue";

const props = defineProps({
  collapsed: Boolean,
});
const router = useRouter();

const menu = [
  { key: "home", label: "首頁", icon: Home, route: "/" },
  { key: "chat", label: "對話", icon: MessageCircle, route: "/chat" },
  { key: "setting", label: "設定", icon: Settings, route: "/setting" },
];

const selected = ref("home");

function selectMenu(item) {
  selected.value = item.key;
  if (item.route) router.push(item.route);
}
function addChat(e) {
  e.stopPropagation();
  alert("新增對話！");
}
function goProfile() {
  router.push("/profile");
}
</script>

<style scoped>
aside {
  box-shadow: 0 6px 24px 0 rgb(30 41 59 / 8%);
  position: relative;
}
</style>
