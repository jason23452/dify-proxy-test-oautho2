<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <!-- 主標題 -->
    <h1 class="text-3xl font-bold text-slate-800 mb-6">
      生成式AI 歷史紀錄
    </h1>
    <div v-if="records.length === 0" class="text-center text-slate-400 text-base py-12">
      暫無歷史紀錄
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="record in records"
        :key="record.id"
        class="bg-white rounded-2xl shadow flex flex-col md:flex-row border border-slate-200 hover:shadow-lg transition"
      >
        <div class="flex-1 p-4">
          <!-- 問題 -->
          <div class="mb-2">
            <span class="text-slate-400 text-sm">你：</span>
            <span class="text-base text-slate-800">{{ record.question }}</span>
          </div>
          <!-- AI 回答 -->
          <div class="mb-2">
            <span class="text-teal-500 text-sm">AI：</span>
            <span class="text-base text-slate-800">{{ record.answer }}</span>
          </div>
          <!-- 時間 -->
          <div class="text-sm text-slate-400">
            {{ formatDate(record.createdAt) }}
          </div>
        </div>
        <!-- 刪除按鈕 -->
        <button
          @click="deleteRecord(record.id)"
          class="m-4 md:ml-0 md:mr-6 h-10 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-base font-medium shadow transition"
          title="刪除這筆紀錄"
        >
          刪除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const records = ref([
  {
    id: 1,
    question: '什麼是生成式AI？',
    answer: '生成式AI是一種能夠產生文本、圖片、音樂等內容的人工智慧技術。',
    createdAt: '2025-06-12T13:40:00'
  },
  {
    id: 2,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  }
  // 實際應該從API獲取
])

function formatDate(dateString) {
  const d = new Date(dateString)
  return d.toLocaleString('zh-TW', { hour12: false })
}

function deleteRecord(id) {
  records.value = records.value.filter(r => r.id !== id)
}
</script>

<style scoped>
/* 可根據需求微調細節 */
</style>
