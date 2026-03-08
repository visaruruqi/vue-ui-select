<template>
  <div class="mb-8">
    <!-- Demo card -->
    <div class="rounded-lg border border-gray-200 dark:border-gray-700">
      <!-- Header -->
      <div
        v-if="title"
        class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg"
      >
        <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200">{{ title }}</h3>
      </div>

      <!-- Live demo area — no overflow hidden so dropdowns render freely -->
      <div class="p-4 break-words">
        <slot />
      </div>
    </div>

    <!-- Code toggle — separate from the demo card -->
    <div class="mt-3">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          @click="open = !open"
        >
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-90': open }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {{ open ? 'Hide Code' : 'Show Code' }}
        </button>
      </div>

      <!--
        Code block — breaks out of parent max-w-md by sizing relative
        to the nearest scrollable ancestor (<main>) via CSS.
      -->
      <div
        v-show="open"
        class="code-breakout mt-2 rounded-lg border border-gray-700 bg-gray-900 overflow-x-auto relative group"
      >
        <button
          type="button"
          class="absolute top-2 right-2 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
          title="Copy to clipboard"
          @click="copyCode"
        >
          <svg v-if="copied" class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <pre class="p-4 text-sm leading-relaxed whitespace-pre"><code class="text-gray-100" v-html="highlightedCode"></code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { highlight } from '../composables/useHighlight'

const props = defineProps<{
  title?: string
  code: string
}>()

const open = ref(false)
const copied = ref(false)

function copyCode() {
  navigator.clipboard.writeText(props.code).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}

const highlightedCode = computed(() => highlight(props.code))
</script>

<style scoped>
/* Fit to content but allow expanding beyond the parent max-w-md */
.code-breakout {
  width: fit-content;
  max-width: calc(100vw - 16rem - 4rem);
}
</style>
