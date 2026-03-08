<template>
  <div data-testid="page-select2-theme">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Select2 Theme</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Preview with Select2-inspired theme.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Single select" :code="codeSingle">
        <ui-select v-model="sel1" theme="select2" :clearable="true" data-testid="s2-single">
          <ui-select-match placeholder="Pick a person...">
            <template #default="{ selected }">{{ selected?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Multiple select" :code="codeMulti">
        <ui-select v-model="sel2" theme="select2" :multiple="true" :clearable="true" data-testid="s2-multi">
          <ui-select-match placeholder="Pick people...">
            <template #tag="{ item, removeItem }">
              <span style="display:inline-flex;align-items:center;gap:4px;background:#e4e4e4;border:1px solid #aaa;border-radius:3px;padding:0 4px;margin:2px;font-size:.85em">
                {{ item.name }}
                <button type="button" @click="removeItem(item)" style="border:none;background:none;cursor:pointer">&times;</button>
              </span>
            </template>
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
import { useExternalCss } from '../composables/useExternalCss'

// Load Select2 CSS for this demo page only
useExternalCss([
  'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css',
])

const sel1 = ref(null)
const sel2 = ref<any[]>([])

const codeSingle = `<ui-select v-model="selected" theme="select2" :clearable="true">
  <ui-select-match placeholder="Pick a person...">
    <template #default="{ selected }">{{ selected?.name }}</template>
  </ui-select-match>
  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :search-fields="['name']"
  >
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`

const codeMulti = `<ui-select
  v-model="selected"
  theme="select2"
  :multiple="true"
  :clearable="true"
>
  <ui-select-match placeholder="Pick people...">
    <template #tag="{ item, removeItem }">
      <span class="tag">
        {{ item.name }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :search-fields="['name']"
  >
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`
</script>
