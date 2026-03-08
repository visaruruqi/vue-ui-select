<template>
  <div data-testid="page-tailwind">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tailwind — Single Select</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Basic single select with the Tailwind theme (default).</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Single select with avatar" :code="code1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Person</label>
        <ui-select v-model="selected" :clearable="true" data-testid="tw-single">
          <ui-select-match placeholder="Choose a person...">
            <template #default="{ selected: s }">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                  {{ s?.name?.charAt(0) }}
                </div>
                {{ s?.name }}
              </div>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name', 'email']">
            <template #choice="{ item, search, highlighted }">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                  {{ item.name.charAt(0) }}
                </div>
                <div>
                  <div v-html="highlighted(item.name, search)"></div>
                  <div class="text-xs text-gray-400">{{ item.email }}</div>
                </div>
              </div>
            </template>
          </ui-select-choices>
        </ui-select>

        <div v-if="selected" class="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
          <strong>Selected:</strong> {{ selected.name }} — {{ selected.email }}
        </div>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selected = ref(null as any)

const code1 = `<template>
  <ui-select v-model="selected" :clearable="true">
    <ui-select-match placeholder="Choose a person...">
      <template #default="{ selected: s }">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-indigo-500 text-white
                      flex items-center justify-center text-xs font-bold">
            {{ s?.name?.charAt(0) }}
          </div>
          {{ s?.name }}
        </div>
      </template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :search-fields="['name', 'email']"
    >
      <template #choice="{ item, search, highlighted }">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700
                      flex items-center justify-center text-sm font-bold">
            {{ item.name.charAt(0) }}
          </div>
          <div>
            <div v-html="highlighted(item.name, search)"></div>
            <div class="text-xs text-gray-400">{{ item.email }}</div>
          </div>
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
</script>
