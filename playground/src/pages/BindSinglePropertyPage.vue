<template>
  <div data-testid="page-bind-single-property">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Bind To Single Property</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">v-model binds to a single field (e.g. person.id) instead of the full object.</p>

    <div class="max-w-md">
      <ExampleSection title="Bind to ID property" :code="code1">
        <ui-select v-model="selectedId" placeholder="Select a person..." :clearable="true" data-testid="bind-prop-select">
          <ui-select-match placeholder="Pick one (v-model is the ID)...">
            <template #default="{ selected: sel }">{{ sel?.name }} (ID: {{ sel?.id }})</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :bind-property="'id'" :search-fields="['name']">
            <template #choice="{ item, search, highlighted }">
              <span v-html="highlighted(item.name, search)"></span>
              <small class="text-gray-500 ml-2">id={{ item.id }}</small>
            </template>
          </ui-select-choices>
        </ui-select>

        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 break-all" data-testid="bind-prop-output">
          v-model value: {{ selectedId }} (type: {{ typeof selectedId }})
        </p>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selectedId = ref<number | null>(null)

const code1 = `<template>
  <ui-select v-model="selectedId" :clearable="true">
    <ui-select-match placeholder="Pick one (v-model is the ID)...">
      <template #default="{ selected: sel }">
        {{ sel?.name }} (ID: {{ sel?.id }})
      </template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :bind-property="'id'"
      :search-fields="['name']"
    >
      <template #choice="{ item, search, highlighted }">
        <span v-html="highlighted(item.name, search)"></span>
        <small>id={{ item.id }}</small>
      </template>
    </ui-select-choices>
  </ui-select>
</template>

<script setup>
import { ref } from 'vue'
import { people } from '../data'

// v-model is the ID (number), not the full object
const selectedId = ref(null)
<\/script>`
</script>
