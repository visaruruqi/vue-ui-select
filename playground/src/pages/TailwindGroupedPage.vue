<template>
  <div data-testid="page-tailwind-grouped">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tailwind — Grouped</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Grouped items with Tailwind styling.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Grouped by country" :code="code1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grouped by country</label>
        <ui-select v-model="selected" :clearable="true" data-testid="tw-grouped">
          <ui-select-match placeholder="Select a person...">
            <template #default="{ selected: s }">{{ s?.name }} ({{ s?.country }})</template>
          </ui-select-match>
          <ui-select-choices
            :items="people"
            :track-by="'id'"
            :group-by="'country'"
            :search-fields="['name', 'country']"
          >
            <template #group-header="{ groupName }">
              <div class="flex items-center gap-2">
                <span class="text-lg">🌍</span>
                <span>{{ groupName }}</span>
              </div>
            </template>
            <template #choice="{ item, search, highlighted }">
              <div class="flex justify-between items-center">
                <span v-html="highlighted(item.name, search)"></span>
                <span class="text-xs text-gray-400 dark:text-gray-500">age {{ item.age }}</span>
              </div>
            </template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selected = ref(null)

const code1 = `<template>
  <ui-select v-model="selected" :clearable="true">
    <ui-select-match placeholder="Select a person...">
      <template #default="{ selected: s }">
        {{ s?.name }} ({{ s?.country }})
      </template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :group-by="'country'"
      :search-fields="['name', 'country']"
    >
      <template #group-header="{ groupName }">
        <div class="flex items-center gap-2">
          <span>🌍</span>
          <span>{{ groupName }}</span>
        </div>
      </template>
      <template #choice="{ item, search, highlighted }">
        <div class="flex justify-between items-center">
          <span v-html="highlighted(item.name, search)"></span>
          <span class="text-xs text-gray-400">
            age {{ item.age }}
          </span>
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
