<template>
  <div
    class=" flex items-start gap-3  my-2  "
    :class="isUser ? 'flex-row-reverse ' : '  justify-start  flex-row  '"
  >
    <img
      v-if="avatar"
      :src="avatar"
      alt="avatar"
      class="w-10 h-10 rounded-full object-cover border-2"
      :class="isUser ? 'border-blue-600' : 'border-teal-500'"
    />
    <div
      class="relative px-5 py-3 rounded-2xl shadow break-words"
      :class="[
        isUser
          ? 'bg-white text-slate-800 border border-blue-600'
          : 'bg-slate-50 text-slate-800 border border-slate-200',
        'transition-all duration-150',
      ]"
    >
      <div
        class="text-sm font-semibold mb-1"
        :class="isUser ? 'text-blue-600' : 'text-teal-500'"
      >
        {{ isUser ? "你" : "AI" }}
      </div>
      <div class="text-base whitespace-pre-line max-w-[700px]">
        <slot>{{ message }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  message: String,
  avatar: String,
  isUser: Boolean,
});
</script>
