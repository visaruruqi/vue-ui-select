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
        <button
          v-if="open"
          type="button"
          class="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          @click="copyCode"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <!--
        Code block — breaks out of parent max-w-md by sizing relative
        to the nearest scrollable ancestor (<main>) via CSS.
      -->
      <div
        v-show="open"
        class="code-breakout mt-2 rounded-lg border border-gray-700 bg-gray-900 overflow-x-auto"
      >
        <pre class="p-4 text-sm leading-relaxed whitespace-pre"><code class="text-gray-100" v-html="highlightedCode"></code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlight(code: string): string {
  const escaped = esc(code)
  return escaped
    // Comments  <!-- ... -->
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color:#6a9955">$1</span>')
    // Template/script/style tags
    .replace(/(&lt;\/?(?:template|script|style)[^&]*?&gt;)/g, '<span style="color:#569cd6">$1</span>')
    // Vue directives & special attrs  v-xxx, :xxx, @xxx, #xxx
    .replace(/\b(v-[\w.-]+|:[a-z][\w.-]*|@[\w.-]+|#[\w.-]+)(=)/g, '<span style="color:#c586c0">$1</span><span style="color:#d4d4d4">$2</span>')
    .replace(/\b(v-[\w.-]+|:[a-z][\w.-]*|@[\w.-]+|#[\w.-]+)(?=[\s/&])/g, '<span style="color:#c586c0">$1</span>')
    // Tag names  <ui-select...> etc.
    .replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span style="color:#4ec9b0">$2</span>')
    // Strings
    .replace(/(=&quot;)(.*?)(&quot;)/g, '$1<span style="color:#ce9178">$2</span>$3')
    .replace(/(=&#39;)(.*?)(&#39;)/g, '$1<span style="color:#ce9178">$2</span>$3')
    // Mustache interpolation {{ ... }}
    .replace(/(\{\{)([\s\S]*?)(\}\})/g, '<span style="color:#dcdcaa">$1$2$3</span>')
    // JS keywords (in script blocks)
    .replace(/\b(import|from|export|const|let|var|function|return|if|else|async|await|ref|computed|reactive)\b/g, '<span style="color:#569cd6">$1</span>')
    // Types / special values
    .replace(/\b(true|false|null|undefined|string|number|boolean|any)\b/g, '<span style="color:#4fc1ff">$1</span>')
}
</script>

<style scoped>
/* Fit to content but allow expanding beyond the parent max-w-md */
.code-breakout {
  width: fit-content;
  max-width: calc(100vw - 16rem - 4rem);
}
</style>
