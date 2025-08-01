<template>
  <div ref="rootEl" class="relative select-none">
    <!-- 選擇按鈕 -->
    <button
      class=" px-4 py-3 bg-white rounded-xl shadow flex justify-between items-center text-left"
      @click="open = !open"
      type="button"
    >
      <span>
        <div class="font-bold">{{ modelValue.label }}</div>
        <div class="text-xs text-gray-500">{{ modelValue.desc }}</div>
      </span>
      <svg class="w-4 h-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
      </svg>
    </button>
    <!-- 下拉選單 -->
    <div
      v-if="open"
      class="absolute top-full left-0 w-full bg-white rounded-xl shadow mt-2 z-50"
    >
      <div
        v-for="option in options"
        :key="option.value"
        @click="select(option)"
        class="px-4 py-3 hover:bg-gray-100 cursor-pointer transition"
      >
        <div class="font-bold">{{ option.label }}</div>
        <div class="text-xs text-gray-500">{{ option.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

// 父層傳入
const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: Object,
    required: false,
    default: null,
  }
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const rootEl = ref(null)

// 選取
function select(option) {
  emit('update:modelValue', option)
  open.value = false
}

// 點擊外部關閉 (可用 vueuse 的 onClickOutside，也可自己寫)
function handleClickOutside(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
