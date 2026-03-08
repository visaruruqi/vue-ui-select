<template>
  <div class="flex items-center gap-2 mb-4">
    <span
      class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold shrink-0"
    >
      {{ n }}
    </span>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
defineProps<{ n: string | number; title: string }>()
</script>
