<template>
  <div class="mx-auto">
    <div
      v-if="history.length === 0"
      class="text-center text-slate-400 text-base py-12"
    >
      暫無歷史紀錄
    </div>
    <div v-else class="space-y-4 ">
      <div
        v-for="record in history"
        :key="record.id"
        @click="Set_History_id(record.id)"
        class="bg-white rounded-2xl shadow flex items-center justify-between border border-slate-200 hover:shadow-lg transition px-4 py-3"
        
      >
        <!-- 顯示 name（已經是 Unicode 格式） -->
        <div class="flex flex-col">
          <span class="text-base text-slate-800 font-semibold truncate">
            {{ record.name }}
          </span>
          <!-- 顯示 question（如果需要） -->
          <span class="text-base text-slate-800 font-semibold truncate">
            {{ record.updated_at }}
          </span>
        </div>

        <!-- 刪除icon -->
        <button
          @click="Set_deleteRecord(record.id)"
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
import { ref, onMounted, inject } from "vue";
import { Trash2 } from "lucide-vue-next";

const history = inject('history', ref([])) // 沒拿到就用空陣列



const send_conversation_id = inject('send_conversation_id')
const deleteRecord = inject('deleteRecord')


function Set_deleteRecord(id) {
  // history.value = history.value.filter((r) => r.id !== id);
  deleteRecord(id);
  
}

function Set_History_id(id) {
  send_conversation_id(id)
  console.log("ID:", id);
}

</script>
