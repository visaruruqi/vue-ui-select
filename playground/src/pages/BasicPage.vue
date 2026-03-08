<template>
  <div data-testid="page-basic">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Basic</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Single select with search.</p>

    <div class="max-w-md">
      <ExampleSection title="Basic single select" :code="code1">
        <ui-select
          v-model="selected"
          placeholder="Select a person..."
          data-testid="basic-select"
        >
          <ui-select-match placeholder="Select a person in the list or search...">
            <template #default="{ selected: sel }">
              {{ sel?.name }}
            </template>
          </ui-select-match>

          <ui-select-choices
            :items="people"
            :track-by="'id'"
            :search-fields="['name', 'email']"
          >
            <template #choice="{ item, search, highlighted }">
              <div v-html="highlighted(item.name, search)"></div>
              <small class="text-gray-500">{{ item.email }}</small>
            </template>
          </ui-select-choices>

          <ui-select-no-choice>
            No results found.
          </ui-select-no-choice>
        </ui-select>

        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 break-all" data-testid="basic-output">
          Selected: {{ selected ? JSON.stringify(selected) : 'none' }}
        </p>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { people } from '../data'
import type { Person } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selected = ref<Person | null>(null)

const code1 = `<template>
  <ui-select v-model="selected" placeholder="Select a person...">
    <ui-select-match placeholder="Select a person in the list or search...">
      <template #default="{ selected: sel }">
        {{ sel?.name }}
      </template>
    </ui-select-match>

    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :search-fields="['name', 'email']"
    >
      <template #choice="{ item, search, highlighted }">
        <div v-html="highlighted(item.name, search)"></div>
        <small>{{ item.email }}</small>
      </template>
    </ui-select-choices>

    <ui-select-no-choice>
      No results found.
    </ui-select-no-choice>
  </ui-select>
</template>

<script setup>
import { ref } from 'vue'
import { people } from '../data'

const selected = ref(null)
<\/script>`
</script>
