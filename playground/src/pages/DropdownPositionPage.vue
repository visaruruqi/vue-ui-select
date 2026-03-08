<template>
  <div data-testid="page-dropdown-position">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dropdown Position</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Position: up, down, or auto.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Position variants (down, up, auto)" :code="code1">
        <div class="space-y-4">
          <div v-for="pos in ['down', 'up', 'auto']" :key="pos">
            <h4 class="text-sm font-medium mb-1 text-gray-500">position="{{ pos }}"</h4>
            <ui-select v-model="selected[pos]" :position="pos" :clearable="true" :data-testid="'position-' + pos">
              <ui-select-match :placeholder="'Position: ' + pos">
                <template #default="{ selected: sel }">{{ sel?.name }}</template>
              </ui-select-match>
              <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
                <template #choice="{ item }">{{ item.name }}</template>
              </ui-select-choices>
            </ui-select>
          </div>
        </div>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selected = reactive<Record<string, any>>({ down: null, up: null, auto: null })

const code1 = `<template>
  <!-- position can be 'down', 'up', or 'auto' -->
  <ui-select v-model="selected" :position="'up'" :clearable="true">
    <ui-select-match placeholder="Position: up">
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
<\/script>`
</script>
