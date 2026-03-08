<template>
  <div data-testid="page-tailwind-tagging">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tailwind — Tagging</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Tag creation with Tailwind styling.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Skills tagging" :code="code1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
        <ui-select
          v-model="tags"
          :multiple="true"
          :tagging="true"
          :tagging-tokens="[',', ';']"
          data-testid="tw-tagging"
        >
          <ui-select-match placeholder="Type skills and press Enter...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded-full px-2.5 py-0.5 text-sm mr-1 mb-1">
                {{ item }}
                <button type="button" @click="removeItem(item)" class="ml-0.5 hover:text-emerald-600">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="suggestions" :search-fields="[]">
            <template #choice="{ item }">{{ item }}</template>
          </ui-select-choices>
        </ui-select>

        <div v-if="tags.length" class="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
          <strong>Tags:</strong> {{ tags.join(', ') }}
        </div>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ExampleSection from '../components/ExampleSection.vue'

const suggestions = ['Vue', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'GraphQL', 'Docker', 'AWS']
const tags = ref<string[]>([])

const code1 = `<template>
  <ui-select
    v-model="tags"
    :multiple="true"
    :tagging="true"
    :tagging-tokens="[',', ';']"
  >
    <ui-select-match placeholder="Type skills and press Enter...">
      <template #tag="{ item, removeItem }">
        <span class="inline-flex items-center gap-1
                     bg-emerald-100 text-emerald-800
                     rounded-full px-2.5 py-0.5 text-sm mr-1 mb-1">
          {{ item }}
          <button @click="removeItem(item)">&times;</button>
        </span>
      </template>
    </ui-select-match>
    <ui-select-choices :items="suggestions" :search-fields="[]">
      <template #choice="{ item }">{{ item }}</template>
    </ui-select-choices>
  </ui-select>
</template>

<script setup>
import { ref } from 'vue'

const suggestions = ['Vue', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js']
const tags = ref([])
<\/script>`
</script>
