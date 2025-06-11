<template>
  <div class="p-4">
    <header>這是共用 Layout</header>
    <main>
      <router-view />
    </main>
    <!-- <div v-if="user.isLogged">
      <p>歡迎, {{ user.account.name }}</p>
      <p>使用者帳號: {{ user.account.username }}</p>

      <section v-if="data">
        <h2 class="mt-6 text-xl font-semibold">Dify 初始化資料</h2>
        <pre class="bg-gray-100 p-4 rounded overflow-auto"
          >{{ formattedData }}
        </pre>
      </section>
      <p v-else class="mt-4 text-gray-500">正在載入資料...</p>

      <p v-if="error" class="mt-4 text-red-500">
        載入資料失敗：{{ error.message }}
      </p>
    </div>

    <div v-else>
      <p>您尚未登入，請先點擊「Azure SSO 登入」</p>
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useUserStore } from "../stores/user";
import { Get_Mata } from "../constants/general";

const user = useUserStore();
const data = ref(null);
const error = ref(null);

// 格式化顯示 JSON
const formattedData = computed(() => {
  try {
    return JSON.stringify(data.value, null, 2);
  } catch {
    return String(data.value);
  }
});

// 載入 Dify 資料的函式
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

// 監聽登入狀態變更，登入後自動載入資料
watch(
  () => user.isLogged,
  (loggedIn) => {
    if (loggedIn) {
      loadData();
    }
  }
);
</script>

<style scoped>
/* 自訂 Home 頁面樣式 */
</style>
<route lang="json">
{
  "layout": true
}
</route>