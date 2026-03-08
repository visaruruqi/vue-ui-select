<template>
  <div data-testid="page-focus">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Focus</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Autofocus + imperative focus via template ref.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Autofocus" :code="codeAutofocus">
        <ui-select v-model="sel1" :autofocus="true" data-testid="autofocus-select">
          <ui-select-match placeholder="I auto-focus on mount">
            <template #default="{ selected: s }">{{ s?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Imperative focus" :code="codeImperative">
        <button class="mb-2 px-3 py-1 text-sm bg-blue-500 text-white rounded" @click="focusSelect" data-testid="focus-btn">
          Focus the select
        </button>
        <ui-select ref="selectRef" v-model="sel2" data-testid="imperative-focus-select">
          <ui-select-match placeholder="Click button above to focus me">
            <template #default="{ selected: s }">{{ s?.name }}</template>
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
import { ref } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const sel1 = ref(null)
const sel2 = ref(null)
const selectRef = ref<any>(null)

function focusSelect() {
  selectRef.value?.focus()
  selectRef.value?.open()
}

const codeAutofocus = `<ui-select v-model="selected" :autofocus="true">
  <ui-select-match placeholder="I auto-focus on mount">
    <template #default="{ selected: s }">{{ s?.name }}</template>
  </ui-select-match>
  <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`

const codeImperative = `<template>
  <button @click="focusSelect">Focus the select</button>
  <ui-select ref="selectRef" v-model="selected">
    <ui-select-match placeholder="Click button above to focus me">
      <template #default="{ selected: s }">{{ s?.name }}</template>
    </ui-select-match>
    <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>

<script setup>
import { ref } from 'vue'

const selectRef = ref(null)

function focusSelect() {
  selectRef.value?.focus()
  selectRef.value?.open()
}
<\/script>`
</script>
