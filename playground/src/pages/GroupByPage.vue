<template>
  <div data-testid="page-group-by">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Group By</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Group items by string property and by function.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Group by string ('country')" :code="codeString">
        <ui-select v-model="sel1" :clearable="true" data-testid="group-string-select">
          <ui-select-match placeholder="Select with groups...">
            <template #default="{ selected: s }">{{ s?.name }} ({{ s?.country }})</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :group-by="'country'" :search-fields="['name']">
            <template #choice="{ item, search, highlighted }">
              <span v-html="highlighted(item.name, search)"></span>
              <small class="text-gray-500 ml-2">{{ item.email }}</small>
            </template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Group by function (age range)" :code="codeFn">
        <ui-select v-model="sel2" :clearable="true" data-testid="group-fn-select">
          <ui-select-match placeholder="Select grouped by age range...">
            <template #default="{ selected: s }">{{ s?.name }} (age {{ s?.age }})</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :group-by="groupByAge" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }} — age {{ item.age }}</template>
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

function groupByAge(item: any): string | undefined {
  if (item.age < 30) return 'Under 30'
  if (item.age < 40) return '30–39'
  return '40+'
}

const codeString = `<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Select with groups...">
    <template #default="{ selected: s }">
      {{ s?.name }} ({{ s?.country }})
    </template>
  </ui-select-match>
  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :group-by="'country'"
    :search-fields="['name']"
  >
    <template #choice="{ item, search, highlighted }">
      <span v-html="highlighted(item.name, search)"></span>
      <small>{{ item.email }}</small>
    </template>
  </ui-select-choices>
</ui-select>`

const codeFn = `<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Select grouped by age range...">
    <template #default="{ selected: s }">
      {{ s?.name }} (age {{ s?.age }})
    </template>
  </ui-select-match>
  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :group-by="groupByAge"
    :search-fields="['name']"
  >
    <template #choice="{ item }">
      {{ item.name }} — age {{ item.age }}
    </template>
  </ui-select-choices>
</ui-select>

<script setup>
function groupByAge(item) {
  if (item.age < 30) return 'Under 30'
  if (item.age < 40) return '30–39'
  return '40+'
}
<\/script>`
</script>
