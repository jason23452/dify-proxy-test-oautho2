<template>
  <aside
    :class="[
      // flex基底
      'flex flex-col space-y-6 py-6 bg-white shadow border-r border-slate-200 transition-all duration-300 z-10 overflow-y-auto relative pb-20',
      // 響應式寬度
      collapsed
        ? 'w-16 min-w-[56px] max-w-[64px] px-2'
        : 'w-64 min-w-[220px] max-w-xs px-6',
      // 響應式圓角&高度
      'sm:rounded-r-2xl sm:min-h-screen',
      'min-h-screen rounded-none',
    ]"
  >
    <!-- LOGO區 -->
    <div class="flex flex-col items-center">
      <div
        :class="
          collapsed
            ? 'flex flex-col items-center space-y-2'
            : 'flex flex-row items-center space-x-3 w-full'
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
        <!-- 展開時，且在對話頁時 edit 在 logo 右方 -->
        <button
          v-if="!collapsed && selected === 'chat'"
          @click="addChat"
          class="ml-3 flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition px-2 py-1 rounded-xl"
          :title="'新增對話'"
        >
          <Edit class="w-5 h-5" />
        </button>
      </div>
      <!-- 收合時，且在對話頁時 edit 獨立在 logo 下方 -->
      <button
        v-if="collapsed && selected === 'chat'"
        @click="addChat"
        class="mt-3 flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition px-2 py-1 rounded-xl"
        :title="'新增對話'"
      >
        <Edit class="w-5 h-5" />
      </button>
    </div>

    <!-- Menu區，自動填滿剩餘空間 -->
    <ul class="space-y-2 max-sm:space-y-0 max-sm:flex max-sm:justify-between">
      <li v-for="item in menu" :key="item.key" @click="selectMenu(item)">
        <button
          :class="[
            'w-full flex items-center sm:py-3 sm:rounded-4xl transition',
            selected === item.key
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-slate-800 hover:bg-slate-50 hover:text-blue-600',
            collapsed ? 'justify-center px-2' : 'px-4',
            'max-sm:justify-center max-sm:px-2 max-sm:w-auto max-sm:aspect-square max-sm:rounded-full',
          ]"
        >
          <component v-if="item.icon" :is="item.icon" class="w-5 h-5" />
          <span v-if="!collapsed" class="ml-3 max-sm:hidden">{{
            item.label
          }}</span>
        </button>
      </li>
    </ul>

    <!-- Footer: sm 以上絕對定位，手機則正常流動 -->
    <div
      :class="[
        'w-full z-10 flex  px-1  pt-2 border-t border-gray-200  ',
        collapsed
          ? 'flex-col space-y-2 items-center'
          : 'flex-row space-x-2 items-center',
        'sm:absolute sm:left-0 sm:bottom-5',
      ]"
    >
      <button
        class="flex items-center justify-center  py-1 sm:py-2  rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition w-full"
        :class="collapsed ? 'justify-center px-1' : 'justify-start px-2 flex-1'"
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
        class="flex items-center justify-center  size-7 rounded-full shadow-lg border-2 border-slate-200 bg-white/70 backdrop-blur hover:bg-blue-100 hover:border-blue-400 transition-all"
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
