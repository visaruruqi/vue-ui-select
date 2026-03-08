<template>
  <div data-testid="page-tailwind-multiple">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tailwind — Multiple Select</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Multi-select with chip tags using the Tailwind theme.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Team members multi-select" :code="code1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team members</label>
        <ui-select v-model="selected" :multiple="true" :clearable="true" data-testid="tw-multi">
          <ui-select-match placeholder="Add team members...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full px-2.5 py-0.5 text-sm mr-1 mb-1">
                <span class="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                  {{ item.name.charAt(0) }}
                </span>
                {{ item.name }}
                <button type="button" @click="removeItem(item)" class="ml-0.5 hover:text-indigo-600">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name', 'email']">
            <template #choice="{ item, search, highlighted }">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
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

        <div class="text-sm text-gray-500 mt-2">
          {{ selected.length }} selected
        </div>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selected = ref<any[]>([])

const code1 = `<template>
  <ui-select v-model="selected" :multiple="true" :clearable="true">
    <ui-select-match placeholder="Add team members...">
      <template #tag="{ item, removeItem }">
        <span class="inline-flex items-center gap-1
                     bg-indigo-100 text-indigo-800
                     rounded-full px-2.5 py-0.5 text-sm mr-1 mb-1">
          <span class="w-4 h-4 rounded-full bg-indigo-500 text-white
                       flex items-center justify-center text-[10px] font-bold">
            {{ item.name.charAt(0) }}
          </span>
          {{ item.name }}
          <button @click="removeItem(item)">&times;</button>
        </span>
      </template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :search-fields="['name', 'email']"
    >
      <template #choice="{ item, search, highlighted }">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700
                      flex items-center justify-center text-xs font-bold">
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

const selected = ref([])
<\/script>`
</script>
