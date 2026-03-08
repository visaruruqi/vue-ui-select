<template>
  <div data-testid="page-disable-search">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Disable Search</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Search input hidden in both single and multiple modes.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Single (no search)" :code="codeSingle">
        <ui-select v-model="single" :search-enabled="false" :clearable="true" data-testid="disable-search-single">
          <ui-select-match placeholder="Pick one...">
            <template #default="{ selected: sel }">{{ sel?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Multiple (no search)" :code="codeMulti">
        <ui-select v-model="multi" :multiple="true" :search-enabled="false" data-testid="disable-search-multi">
          <ui-select-match placeholder="Pick several...">
            <template #default="{ item }">{{ item.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'">
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

const single = ref(null)
const multi = ref([])

const codeSingle = `<ui-select v-model="single" :search-enabled="false" :clearable="true">
  <ui-select-match placeholder="Pick one...">
    <template #default="{ selected: sel }">{{ sel?.name }}</template>
  </ui-select-match>
  <ui-select-choices :items="people" :track-by="'id'">
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`

const codeMulti = `<ui-select v-model="multi" :multiple="true" :search-enabled="false">
  <ui-select-match placeholder="Pick several...">
    <template #default="{ item }">{{ item.name }}</template>
  </ui-select-match>
  <ui-select-choices :items="people" :track-by="'id'">
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`
</script>
