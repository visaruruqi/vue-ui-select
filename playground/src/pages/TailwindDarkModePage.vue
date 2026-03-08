<template>
  <div data-testid="page-tailwind-dark">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tailwind — Dark Mode</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Toggle between light and dark mode. The Tailwind theme responds automatically.</p>

    <div class="max-w-md space-y-6">
      <div class="flex items-center gap-3 mb-4">
        <button
          class="px-4 py-2 rounded text-sm font-medium transition"
          :class="isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'"
          @click="toggleDark"
          data-testid="dark-toggle"
        >
          {{ isDark ? '🌙 Dark' : '☀️ Light' }}
        </button>
      </div>

      <ExampleSection title="Single select" :code="codeSingle">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Single select</label>
        <ui-select v-model="sel1" :clearable="true" data-testid="dark-single">
          <ui-select-match placeholder="Pick a person...">
            <template #default="{ selected: s }">{{ s?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name', 'email']">
            <template #choice="{ item, search, highlighted }">
              <div>
                <div v-html="highlighted(item.name, search)"></div>
                <div class="text-xs text-gray-400">{{ item.email }}</div>
              </div>
            </template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Multiple select" :code="codeMulti">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Multiple select</label>
        <ui-select v-model="sel2" :multiple="true" :clearable="true" data-testid="dark-multi">
          <ui-select-match placeholder="Add people...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full px-2.5 py-0.5 text-sm mr-1 mb-1">
                {{ item.name }}
                <button type="button" @click="removeItem(item)" class="hover:text-red-500">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const sel1 = ref(null)
const sel2 = ref<any[]>([])
const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const codeSingle = `<template>
  <ui-select v-model="selected" :clearable="true">
    <ui-select-match placeholder="Pick a person...">
      <template #default="{ selected: s }">{{ s?.name }}</template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :search-fields="['name', 'email']"
    >
      <template #choice="{ item, search, highlighted }">
        <div>
          <div v-html="highlighted(item.name, search)"></div>
          <div class="text-xs text-gray-400">{{ item.email }}</div>
        </div>
      </template>
    </ui-select-choices>
  </ui-select>
</template>

<script setup>
import { ref } from 'vue'
import { people } from '../data'

const selected = ref(null)
<\/script>`

const codeMulti = `<template>
  <ui-select v-model="selected" :multiple="true" :clearable="true">
    <ui-select-match placeholder="Add people...">
      <template #tag="{ item, removeItem }">
        <span class="inline-flex items-center gap-1
                     bg-indigo-100 text-indigo-800
                     dark:bg-indigo-900 dark:text-indigo-200
                     rounded-full px-2.5 py-0.5 text-sm mr-1 mb-1">
          {{ item.name }}
          <button @click="removeItem(item)">&times;</button>
        </span>
      </template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :search-fields="['name']"
    >
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>

<script setup>
import { ref } from 'vue'
import { people } from '../data'

const selected = ref([])
<\/script>`
</script>
