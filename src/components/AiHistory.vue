<template>
  <div class="mx-auto">
    <div v-if="records.length === 0" class="text-center text-slate-400 text-base py-12">
      暫無歷史紀錄
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="record in records"
        :key="record.id"
        class="bg-white rounded-2xl shadow flex items-center justify-between border border-slate-200 hover:shadow-lg transition px-4 py-3"
      >
        <!-- 只顯示 title（這裡取用 question 當 title） -->
        <span class="text-base text-slate-800 font-semibold truncate">
          {{ record.question }}
        </span>
        <!-- 刪除icon -->
        <button
          @click="deleteRecord(record.id)"
          class="ml-3 text-slate-400 hover:text-red-500 transition"
          title="刪除"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Trash2 } from 'lucide-vue-next'

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
  },
    {
    id: 3,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  },
    {
    id: 4,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  },
    {
    id: 5,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  },
    {
    id: 6,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  },
    {
    id: 7,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  },
    {
    id: 8,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  },
    {
    id: 9,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  },
    {
    id: 10,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  },
    {
    id: 11,
    question: '請幫我生成一段祝賀詞',
    answer: '祝你前程似錦、心想事成！',
    createdAt: '2025-06-12T14:01:00'
  }
  
])

function deleteRecord(id) {
  records.value = records.value.filter(r => r.id !== id)
}
</script>
