<template>
    <div></div>

  <router-view />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "./stores/user";
import "@/style.css"
const user = useUserStore();
const initialized = ref(false);

onMounted(async () => {
  try {
    await user.init();
  } catch (e) {
    console.error("MSAL init error:", e);
  } finally {
    initialized.value = true;
  }
});
</script>
