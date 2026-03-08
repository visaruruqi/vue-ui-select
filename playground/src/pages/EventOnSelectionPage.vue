<template>
  <div data-testid="page-event-on-selection">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Event On Selection</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">@select emits both the selected item and the current model value.</p>

    <div class="max-w-md">
      <ExampleSection title="Select & remove events" :code="code1">
        <ui-select v-model="selected" :clearable="true" @select="onSelect" @remove="onRemove" data-testid="event-select">
          <ui-select-match placeholder="Pick someone...">
            <template #default="{ selected: sel }">{{ sel?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>

        <div class="mt-4 text-sm space-y-1" data-testid="event-log">
          <div v-for="(entry, i) in log" :key="i" class="text-gray-500">{{ entry }}</div>
        </div>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selected = ref(null)
const log = ref<string[]>([])

function onSelect(payload: { item: any; model: any }) {
  log.value.unshift(`@select → item: ${JSON.stringify(payload.item?.name)}, model: ${JSON.stringify(payload.model)}`)
}
function onRemove(payload: { item: any; model: any }) {
  log.value.unshift(`@remove → item: ${JSON.stringify(payload.item?.name)}, model: ${JSON.stringify(payload.model)}`)
}

const code1 = `<template>
  <ui-select
    v-model="selected"
    :clearable="true"
    @select="onSelect"
    @remove="onRemove"
  >
    <ui-select-match placeholder="Pick someone...">
      <template #default="{ selected: sel }">{{ sel?.name }}</template>
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

const selected = ref(null)

function onSelect({ item, model }) {
  console.log('Selected:', item, 'Model:', model)
}
function onRemove({ item, model }) {
  console.log('Removed:', item, 'Model:', model)
}
<\/script>`
</script>
