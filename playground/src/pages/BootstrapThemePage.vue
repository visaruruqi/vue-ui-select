<template>
  <div data-testid="page-bootstrap-theme">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Bootstrap Theme</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Preview with Bootstrap-inspired theme.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Single select" :code="codeSingle">
        <ui-select v-model="sel1" theme="bootstrap" :clearable="true" data-testid="bs-single">
          <ui-select-match placeholder="Pick a person...">
            <template #default="{ selected }">{{ selected?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }} — {{ item.email }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Multiple select" :code="codeMulti">
        <ui-select v-model="sel2" theme="bootstrap" :multiple="true" :clearable="true" data-testid="bs-multi">
          <ui-select-match placeholder="Pick people...">
            <template #tag="{ item, removeItem }">
              <span class="badge bg-primary me-1">
                {{ item.name }}
                <button type="button" class="btn-close btn-close-white ms-1" style="font-size:.6em" @click="removeItem(item)"></button>
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

// Load Bootstrap 5 CSS for this demo page only
useExternalCss([
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
])

const sel1 = ref(null)
const sel2 = ref<any[]>([])

const codeSingle = `<ui-select v-model="selected" theme="bootstrap" :clearable="true">
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
  theme="bootstrap"
  :multiple="true"
  :clearable="true"
>
  <ui-select-match placeholder="Pick people...">
    <template #tag="{ item, removeItem }">
      <span class="badge bg-primary me-1">
        {{ item.name }}
        <button class="btn-close btn-close-white ms-1"
          @click="removeItem(item)"></button>
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
