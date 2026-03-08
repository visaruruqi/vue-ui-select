<template>
  <div data-testid="page-install">
    <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Install &amp; Configure</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Get <code class="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">vue-ui-select</code> up and running in your Vue 3 project.
    </p>

    <div class="max-w-2xl space-y-8">
      <!-- ── 1. Install ── -->
      <section>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">1. Install the package</h3>
        <CodeBlock :code="npm" />
      </section>

      <!-- ── 2. Plugin registration ── -->
      <section>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">2. Register the plugin <span class="text-sm font-normal text-gray-500">(recommended)</span></h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          This registers all components globally so you can use them anywhere without imports.
        </p>
        <CodeBlock :code="plugin" />
      </section>

      <!-- ── 3. Individual imports ── -->
      <section>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">3. Or import components individually</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          For tree-shaking or if you prefer explicit imports per component.
        </p>
        <CodeBlock :code="components" />
      </section>

      <!-- ── 4. Themes ── -->
      <section>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">4. Choose a theme</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Import <strong>one</strong> CSS file to style the component. Four built-in themes are available:
        </p>
        <CodeBlock :code="themes" />
        <div class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div v-for="t in themeList" :key="t.name"
            class="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-center"
          >
            <span class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ t.name }}</span>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ t.desc }}</p>
          </div>
        </div>
      </section>

      <!-- ── 5. TypeScript ── -->
      <section>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">5. TypeScript support</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Type definitions are bundled — no extra <code class="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">@types</code> package needed.
        </p>
        <CodeBlock :code="types" />
      </section>

      <!-- ── Next step ── -->
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <router-link
          to="/getting-started"
          class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Next: Getting Started →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeBlock from '../components/CodeBlock.vue'

const themeList = [
  { name: 'Tailwind', desc: 'Default' },
  { name: 'Bootstrap', desc: 'Bootstrap 5' },
  { name: 'Select2', desc: 'Classic' },
  { name: 'Selectize', desc: 'Minimal' },
]

// ── Code strings ──

const npm  = 'npm install vue-ui-select'

const plugin = `// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { UiSelectPlugin } from 'vue-ui-select'
import 'vue-ui-select/themes/tailwind.css' // pick your theme

const app = createApp(App)
app.use(UiSelectPlugin, { theme: 'tailwind' })
app.mount('#app')`

const components = `// MyComponent.vue
import {
  UiSelect,
  UiSelectMatch,
  UiSelectChoices,
  UiSelectNoChoice,
} from 'vue-ui-select'
import 'vue-ui-select/themes/tailwind.css'`

const themes = `// Pick one:
import 'vue-ui-select/themes/tailwind.css'   // Tailwind (default)
import 'vue-ui-select/themes/bootstrap.css'  // Bootstrap 5
import 'vue-ui-select/themes/select2.css'    // Select2
import 'vue-ui-select/themes/selectize.css'  // Selectize`

const types = `// Types are auto-resolved, but you can import them explicitly:
import type {
  UiSelectProps,
  UiSelectContext,
  UiSelectSlotBindings,
} from 'vue-ui-select'`
</script>
