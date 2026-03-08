<template>
  <div data-testid="page-bind-single-property-async">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Bind To Single Property (Async)</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Same as bind-property but items load asynchronously. Selected value hydrates correctly once items arrive.</p>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">Try typing <strong>Adam</strong>, <strong>Maria</strong>, <strong>Nic</strong>, or <strong>Dan</strong> to see async results.</p>

    <div class="max-w-md">
      <ExampleSection title="Async search with bind-property" :code="code1">
        <ui-select v-model="selectedId" :loading="loading" placeholder="Type to search..." data-testid="bind-async-select" @search="onSearch">
          <ui-select-match placeholder="Search people...">
            <template #default="{ selected: sel }">{{ sel?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="results" :track-by="'id'" :bind-property="'id'" :search-fields="['name']">
            <template #choice="{ item, search, highlighted }">
              <span v-html="highlighted(item.name, search)"></span>
            </template>
          </ui-select-choices>
          <ui-select-no-choice>No results found.</ui-select-no-choice>
        </ui-select>

        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 break-all" data-testid="bind-async-output">
          v-model value: {{ selectedId }}
        </p>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { searchPeopleAsync, type Person } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selectedId = ref<number | null>(null)
const results = ref<Person[]>([])
const loading = ref(false)

async function onSearch(q: string) {
  if (!q) { results.value = []; return }
  loading.value = true
  results.value = await searchPeopleAsync(q)
  loading.value = false
}

const code1 = `<template>
  <ui-select v-model="selectedId" :loading="loading" @search="onSearch">
    <ui-select-match placeholder="Search people...">
      <template #default="{ selected: sel }">{{ sel?.name }}</template>
    </ui-select-match>
    <ui-select-choices
      :items="results"
      :track-by="'id'"
      :bind-property="'id'"
      :search-fields="['name']"
    >
      <template #choice="{ item, search, highlighted }">
        <span v-html="highlighted(item.name, search)"></span>
      </template>
    </ui-select-choices>
    <ui-select-no-choice>No results found.</ui-select-no-choice>
  </ui-select>
</template>

<script setup>
import { ref } from 'vue'
import { searchPeopleAsync } from '../data'

const selectedId = ref(null)
const results = ref([])
const loading = ref(false)

async function onSearch(q) {
  if (!q) { results.value = []; return }
  loading.value = true
  results.value = await searchPeopleAsync(q)
  loading.value = false
}
<\/script>`
</script>
