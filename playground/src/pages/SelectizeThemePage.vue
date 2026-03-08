<template>
  <div data-testid="page-selectize-theme">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Selectize Theme</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Preview with Selectize-inspired theme.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Single select" :code="codeSingle">
        <ui-select v-model="sel1" theme="selectize" :clearable="true" data-testid="sz-single">
          <ui-select-match placeholder="Pick a person...">
            <template #default="{ selected }">{{ selected?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }} — {{ item.email }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Multiple select" :code="codeMulti">
        <ui-select v-model="sel2" theme="selectize" :multiple="true" :clearable="true" data-testid="sz-multi">
          <ui-select-match placeholder="Pick people...">
            <template #tag="{ item, removeItem }">
              <span style="display:inline-flex;align-items:center;gap:4px;background:#f1f1f1;border:1px solid #d0d0d0;border-radius:3px;padding:1px 6px;margin:2px;font-size:.85em">
                {{ item.name }}
                <button type="button" @click="removeItem(item)" style="border:none;background:none;cursor:pointer;font-size:1.1em">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Tagging" :code="codeTagging">
        <ui-select v-model="tags" theme="selectize" :multiple="true" :tagging="true" data-testid="sz-tagging">
          <ui-select-match placeholder="Type to add tags...">
            <template #tag="{ item, removeItem }">
              <span style="display:inline-flex;align-items:center;gap:4px;background:#f1f1f1;border:1px solid #d0d0d0;border-radius:3px;padding:1px 6px;margin:2px;font-size:.85em">
                {{ item }}
                <button type="button" @click="removeItem(item)" style="border:none;background:none;cursor:pointer;font-size:1.1em">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="['Vue', 'React', 'Angular', 'Svelte', 'Solid']">
            <template #choice="{ item }">{{ item }}</template>
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

// Load Selectize CSS for this demo page only
useExternalCss([
  'https://cdn.jsdelivr.net/npm/selectize@0.15.2/dist/css/selectize.default.min.css',
])

const sel1 = ref(null)
const sel2 = ref<any[]>([])
const tags = ref<string[]>([])

const codeSingle = `<ui-select v-model="selected" theme="selectize" :clearable="true">
  <ui-select-match placeholder="Pick a person...">
    <template #default="{ selected }">{{ selected?.name }}</template>
  </ui-select-match>
  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :search-fields="['name']"
  >
    <template #choice="{ item }">
      {{ item.name }} — {{ item.email }}
    </template>
  </ui-select-choices>
</ui-select>`

const codeMulti = `<ui-select
  v-model="selected"
  theme="selectize"
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

const codeTagging = `<ui-select
  v-model="tags"
  theme="selectize"
  :multiple="true"
  :tagging="true"
>
  <ui-select-match placeholder="Type to add tags...">
    <template #tag="{ item, removeItem }">
      <span class="tag">{{ item }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices :items="['Vue', 'React', 'Angular', 'Svelte', 'Solid']">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>`
</script>
