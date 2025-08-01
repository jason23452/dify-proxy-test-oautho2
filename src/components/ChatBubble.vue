<template>
  <div
    class="flex items-start gap-3 my-2"
    :class="isUser ? 'flex-row-reverse' : 'justify-start flex-row'"
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
      <!-- 檔案預覽區塊 -->
      <div
        v-if="file"
        class="flex items-center bg-white rounded-xl shadow border border-gray-100 px-3 py-2 w-max mt-2"
      >
        <!-- icon -->
        <div
          class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 rounded mr-2"
        >
          <svg
            class="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <!-- 圖片預覽（file + previewUrl 有值就顯示圖片）-->
        <template v-if="previewUrl">
          <a :href="previewUrl" target="_blank" rel="noopener noreferrer">
            <img
              :src="previewUrl"
              :alt="file.filename || file.name"
              class="max-w-[96px] max-h-[80px] rounded-xl border border-gray-100 shadow mr-2"
            />
          </a>
        </template>

        <!-- 其他檔案 -->
        <template v-else>
          <a
            :href="file.url"
            :download="file.filename || file.name"
            class="text-[15px] text-blue-700 hover:underline truncate max-w-[120px]"
            :title="file.filename || file.name"
            target="_blank"
          >
            {{ file.filename || file.name }}
          </a>
          <span v-if="file.size" class="ml-2 text-xs text-gray-400"
            >({{ humanFileSize(file.size) }})</span
          >
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  message: String,
  avatar: String,
  isUser: Boolean,
  file: Object,
  previewUrl: String,
});
function humanFileSize(size) {
  if (!size) return "";
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (size / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}
</script>
