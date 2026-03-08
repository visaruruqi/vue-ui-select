<template>
  <div data-testid="page-object-source">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Object as Source</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Use a plain <code>{ key: value }</code> dictionary as the items source.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="String values — select by value" :code="codeValue">
        <ui-select v-model="sel1" :clearable="true" data-testid="obj-string-value">
          <ui-select-match placeholder="Pick a colour...">
            <template #default="{ selected }">{{ selected }}</template>
          </ui-select-match>
          <ui-select-choices :items="colorMap">
            <template #choice="{ item }">{{ item }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Model: {{ JSON.stringify(sel1) }}</p>
      </ExampleSection>

      <ExampleSection title="String values — bind to key" :code="codeKey">
        <ui-select v-model="sel2" :clearable="true" :bind-property="'key'" data-testid="obj-key-bind">
          <ui-select-match placeholder="Pick by key...">
            <template #default="{ selected }">{{ selected }}</template>
          </ui-select-match>
          <ui-select-choices :items="colorMap">
            <template #choice="{ item, key }">{{ key }}: {{ item }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Model (key): {{ JSON.stringify(sel2) }}</p>
      </ExampleSection>

      <ExampleSection title="Object values — dictionary with rich entries" :code="codeDict">
        <p class="mb-2 text-xs text-gray-500 dark:text-gray-400 italic">Each key maps to an object. The dropdown shows the key and the nested label; the model stores the unwrapped value object.</p>
        <ui-select v-model="sel3" :clearable="true" data-testid="obj-dict">
          <ui-select-match placeholder="Pick a role...">
            <template #default="{ selected }">{{ selected?.label }}</template>
          </ui-select-match>
          <ui-select-choices :items="roleMap" :search-fields="['label']">
            <template #choice="{ item, key }">{{ key }} — {{ item.label }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Model: {{ sel3 ? `${sel3.label} (${sel3.level})` : 'null' }}</p>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ExampleSection from '../components/ExampleSection.vue'

const colorMap: Record<string, string> = {
  r: 'Red',
  g: 'Green',
  b: 'Blue',
  y: 'Yellow',
  p: 'Purple',
}

const roleMap: Record<string, { label: string; level: number }> = {
  admin:  { label: 'Administrator', level: 3 },
  editor: { label: 'Editor',        level: 2 },
  viewer: { label: 'Viewer',        level: 1 },
  guest:  { label: 'Guest',         level: 0 },
}

const sel1 = ref<any>(null)
const sel2 = ref<any>(null)
const sel3 = ref<any>(null)

const codeValue = `<!-- Items is a plain object { key: value } -->
<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Pick a colour...">
    <template #default="{ selected }">{{ selected }}</template>
  </ui-select-match>
  <ui-select-choices :items="colorMap">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>

<script setup>
const colorMap = { r: 'Red', g: 'Green', b: 'Blue' }
<\/script>`

const codeKey = `<!-- bind-property="key" makes v-model the key instead of value -->
<ui-select v-model="selected" :clearable="true" :bind-property="'key'">
  <ui-select-match placeholder="Pick by key...">
    <template #default="{ selected }">{{ selected }}</template>
  </ui-select-match>
  <ui-select-choices :items="colorMap">
    <template #choice="{ item, key }">{{ key }}: {{ item }}</template>
  </ui-select-choices>
</ui-select>`

const codeDict = `<!-- Dictionary whose values are objects -->
<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Pick a role...">
    <template #default="{ selected }">{{ selected?.label }}</template>
  </ui-select-match>
  <ui-select-choices :items="roleMap" :search-fields="['label']">
    <template #choice="{ item, key }">
      {{ key }} — {{ item.label }}
    </template>
  </ui-select-choices>
</ui-select>

<script setup>
const roleMap = {
  admin:  { label: 'Administrator', level: 3 },
  editor: { label: 'Editor',        level: 2 },
  viewer: { label: 'Viewer',        level: 1 },
  guest:  { label: 'Guest',         level: 0 },
}
<\/script>`
</script>
