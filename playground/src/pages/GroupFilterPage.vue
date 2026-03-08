<template>
  <div data-testid="page-group-filter">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Group Filter</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Filter and reorder which groups are shown.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Show only specific groups (array)" :code="codeArray">
        <ui-select v-model="sel1" :clearable="true" data-testid="group-filter-array">
          <ui-select-match placeholder="Only US & UK...">
            <template #default="{ selected: s }">{{ s?.name }}</template>
          </ui-select-match>
          <ui-select-choices
            :items="people"
            :track-by="'id'"
            :group-by="'country'"
            :group-filter="['United States', 'United Kingdom']"
            :search-fields="['name']"
          >
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Custom group filter (function: reverse sort)" :code="codeFn">
        <ui-select v-model="sel2" :clearable="true" data-testid="group-filter-fn">
          <ui-select-match placeholder="Select (groups reversed)...">
            <template #default="{ selected: s }">{{ s?.name }}</template>
          </ui-select-match>
          <ui-select-choices
            :items="people"
            :track-by="'id'"
            :group-by="'country'"
            :group-filter="reverseGroups"
            :search-fields="['name']"
          >
            <template #choice="{ item }">{{ item.name }}</template>
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

const sel1 = ref(null)
const sel2 = ref(null)

function reverseGroups(groups: string[]): string[] {
  return [...groups].sort().reverse()
}

const codeArray = `<!-- Pass an array of allowed group names -->
<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Only US & UK...">
    <template #default="{ selected }">{{ selected?.name }}</template>
  </ui-select-match>
  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :group-by="'country'"
    :group-filter="['United States', 'United Kingdom']"
    :search-fields="['name']"
  >
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`

const codeFn = `<!-- Pass a function to reorder/filter groups -->
<script setup>
function reverseGroups(groups) {
  return [...groups].sort().reverse()
}
<\/script>

<template>
  <ui-select v-model="selected" :clearable="true">
    <ui-select-match placeholder="Select (groups reversed)...">
      <template #default="{ selected }">{{ selected?.name }}</template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :group-by="'country'"
      :group-filter="reverseGroups"
      :search-fields="['name']"
    >
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>`
</script>
