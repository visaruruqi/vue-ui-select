<template>
  <div class="relative group">
    <button
      type="button"
      class="absolute top-2 right-2 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      title="Copy to clipboard"
      @click="copy"
    >
      <!-- Checkmark when copied -->
      <svg v-if="copied" class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <!-- Copy icon -->
      <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>
    <pre class="bg-gray-900 rounded-lg px-4 py-3 overflow-x-auto"><code
      class="text-sm text-gray-100 leading-relaxed"
      v-html="highlighted"
    ></code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { highlight } from '../composables/useHighlight'

const props = defineProps<{
  code: string
}>()

const copied = ref(false)

const highlighted = computed(() => highlight(props.code))

function copy() {
  navigator.clipboard.writeText(props.code).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>
