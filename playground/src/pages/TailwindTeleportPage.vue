<template>
  <div data-testid="page-tailwind-teleport">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tailwind — Teleport (Append to Body)</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Dropdown is teleported to document body to escape overflow clipping.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Teleported dropdown in overflow container" :code="code1">
        <div class="border rounded-lg p-4 overflow-hidden" style="height: 160px;">
          <p class="text-sm text-gray-500 mb-2">This container has <code>overflow: hidden</code> and limited height.</p>
          <ui-select v-model="selected" :append-to-body="true" :clearable="true" data-testid="tw-teleport">
            <ui-select-match placeholder="Select a person...">
              <template #default="{ selected: s }">{{ s?.name }}</template>
            </ui-select-match>
            <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
              <template #choice="{ item }">{{ item.name }} — {{ item.email }}</template>
            </ui-select-choices>
          </ui-select>
        </div>

        <p class="text-sm text-gray-500 italic mt-2">
          The dropdown renders outside this overflow container, attached to &lt;body&gt;.
        </p>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { people } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selected = ref(null)

const code1 = `<template>
  <!-- Container with overflow:hidden -->
  <div class="overflow-hidden" style="height: 160px;">
    <ui-select
      v-model="selected"
      :append-to-body="true"
      :clearable="true"
    >
      <ui-select-match placeholder="Select a person...">
        <template #default="{ selected: s }">
          {{ s?.name }}
        </template>
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
    </ui-select>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { people } from '../data'

const selected = ref(null)
<\/script>`
</script>
