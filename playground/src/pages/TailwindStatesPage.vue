<template>
  <div data-testid="page-tailwind-states">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tailwind — States</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Disabled, loading, and validation states.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Disabled" :code="codeDisabled">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disabled</label>
        <ui-select v-model="disabledVal" :disabled="true" data-testid="tw-disabled">
          <ui-select-match placeholder="Cannot interact...">
            <template #default="{ selected: s }">{{ s?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Loading state" :code="codeLoading">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loading state</label>
        <ui-select v-model="loadingVal" :loading="isLoading" :clearable="true" data-testid="tw-loading">
          <ui-select-match placeholder="Loading data...">
            <template #default="{ selected: s }">{{ s?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="loadingItems" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
        <button
          class="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          @click="simulateLoading"
        >
          Simulate loading
        </button>
      </ExampleSection>

      <ExampleSection title="Some choices disabled" :code="codeDisabledChoices">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Some choices disabled</label>
        <ui-select v-model="disabledChoiceVal" :clearable="true" data-testid="tw-disabled-choices">
          <ui-select-match placeholder="Some items disabled...">
            <template #default="{ selected: s }">{{ s?.name }}</template>
          </ui-select-match>
          <ui-select-choices
            :items="people"
            :track-by="'id'"
            :search-fields="['name']"
            :disable-choice="(item: any) => item.age > 35"
          >
            <template #choice="{ item, disabled }">
              <span :class="{ 'line-through opacity-50': disabled }">{{ item.name }} (age {{ item.age }})</span>
              <span v-if="disabled" class="text-xs text-red-400 ml-2">35+ disabled</span>
            </template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Minimum input length (3)" :code="codeMinInput">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum input length (3)</label>
        <ui-select v-model="minLenVal" :clearable="true" data-testid="tw-min-input">
          <ui-select-match placeholder="Type 3+ chars to search...">
            <template #default="{ selected: s }">{{ s?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']" :minimum-input-length="3">
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

const disabledVal = ref(people[0])
const loadingVal = ref(null)
const isLoading = ref(false)
const loadingItems = ref<typeof people>([])
const disabledChoiceVal = ref(null)
const minLenVal = ref(null)

function simulateLoading() {
  isLoading.value = true
  loadingItems.value = []
  setTimeout(() => {
    loadingItems.value = people
    isLoading.value = false
  }, 2000)
}

const codeDisabled = `<ui-select v-model="selected" :disabled="true">
  <ui-select-match placeholder="Cannot interact...">
    <template #default="{ selected: s }">{{ s?.name }}</template>
  </ui-select-match>
  <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`

const codeLoading = `<template>
  <ui-select v-model="selected" :loading="isLoading" :clearable="true">
    <ui-select-match placeholder="Loading data...">
      <template #default="{ selected: s }">{{ s?.name }}</template>
    </ui-select-match>
    <ui-select-choices :items="items" :track-by="'id'" :search-fields="['name']">
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
  <button @click="simulateLoading">Simulate loading</button>
</template>

<script setup>
import { ref } from 'vue'

const isLoading = ref(false)
const items = ref([])

function simulateLoading() {
  isLoading.value = true
  items.value = []
  setTimeout(() => {
    items.value = people
    isLoading.value = false
  }, 2000)
}
<\/script>`

const codeDisabledChoices = `<!-- disable-choice receives each item, return true to disable -->
<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Some items disabled...">
    <template #default="{ selected: s }">{{ s?.name }}</template>
  </ui-select-match>
  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :search-fields="['name']"
    :disable-choice="(item) => item.age > 35"
  >
    <template #choice="{ item, disabled }">
      <span :class="{ 'line-through opacity-50': disabled }">
        {{ item.name }} (age {{ item.age }})
      </span>
      <span v-if="disabled" class="text-xs text-red-400 ml-2">
        35+ disabled
      </span>
    </template>
  </ui-select-choices>
</ui-select>`

const codeMinInput = `<!-- Dropdown only opens after typing 3+ characters -->
<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Type 3+ chars to search...">
    <template #default="{ selected: s }">{{ s?.name }}</template>
  </ui-select-match>
  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :search-fields="['name']"
    :minimum-input-length="3"
  >
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`
</script>
