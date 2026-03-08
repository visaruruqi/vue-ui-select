<template>
  <div data-testid="page-append-to-body">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Append To Body</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Dropdown renders via Teleport to escape overflow clipping.</p>

    <div class="max-w-md">
      <ExampleSection title="Teleported dropdown" :code="code1">
        <div class="overflow-hidden border border-gray-300 dark:border-gray-600 p-4 rounded h-32" data-testid="overflow-container">
          <ui-select
            v-model="selected"
            :append-to-body="true"
            placeholder="Select a person..."
            :clearable="true"
            data-testid="append-select"
          >
            <ui-select-match placeholder="Pick one (teleported dropdown)...">
              <template #default="{ selected: sel }">{{ sel?.name }}</template>
            </ui-select-match>
            <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
              <template #choice="{ item, search, highlighted }">
                <span v-html="highlighted(item.name, search)"></span>
              </template>
            </ui-select-choices>
          </ui-select>
        </div>

        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 break-all" data-testid="append-output">
          Selected: {{ selected ? selected.name : 'none' }}
        </p>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selected = ref<any>(null)

const code1 = `<template>
  <!-- Container with overflow:hidden to demonstrate teleport -->
  <div class="overflow-hidden h-32">
    <ui-select
      v-model="selected"
      :append-to-body="true"
      :clearable="true"
    >
      <ui-select-match placeholder="Pick one (teleported dropdown)...">
        <template #default="{ selected: sel }">{{ sel?.name }}</template>
      </ui-select-match>
      <ui-select-choices
        :items="people"
        :track-by="'id'"
        :search-fields="['name']"
      >
        <template #choice="{ item, search, highlighted }">
          <span v-html="highlighted(item.name, search)"></span>
        </template>
      </ui-select-choices>
    </ui-select>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { people } from '../data'

const selected = ref(null)
<\/script>`
</script>
