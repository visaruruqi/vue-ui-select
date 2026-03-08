<template>
  <div data-testid="page-multiple-selection">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Multiple Selection</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Multi-select with strings, objects, bind-property, groups, and limit.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="String items" :code="codeStrings">
        <ui-select v-model="selColors" :multiple="true" :clearable="true" data-testid="multi-strings">
          <ui-select-match placeholder="Pick colors...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="colors" :search-fields="[]">
            <template #choice="{ item }">{{ item }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Selected: {{ selColors }}</p>
      </ExampleSection>

      <ExampleSection title="Object items" :code="codeObjects">
        <ui-select v-model="selPeople" :multiple="true" :clearable="true" data-testid="multi-objects">
          <ui-select-match placeholder="Pick people...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-green-100 text-green-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item.name }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name', 'email']">
            <template #choice="{ item }">{{ item.name }} — {{ item.email }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Bind property (IDs only)" :code="codeBind">
        <ui-select v-model="selIds" :multiple="true" :bind-property="'id'" :clearable="true" data-testid="multi-bind">
          <ui-select-match placeholder="Pick IDs...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-purple-100 text-purple-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Model (IDs): {{ selIds }}</p>
      </ExampleSection>

      <ExampleSection title="Grouped multi-select" :code="codeGrouped">
        <ui-select v-model="selGrouped" :multiple="true" data-testid="multi-grouped">
          <ui-select-match placeholder="Pick (grouped)...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item.name }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :group-by="'country'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Limit to 3 selections" :code="codeLimit">
        <ui-select v-model="selLimited" :multiple="true" :limit="3" data-testid="multi-limit">
          <ui-select-match placeholder="Max 3...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-red-100 text-red-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item.name }}
                <button type="button" @click="removeItem(item)">&times;</button>
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
import { people, colors } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const selColors = ref<string[]>([])
const selPeople = ref<any[]>([])
const selIds = ref<number[]>([])
const selGrouped = ref<any[]>([])
const selLimited = ref<any[]>([])

const codeStrings = `<ui-select v-model="selected" :multiple="true" :clearable="true">
  <ui-select-match placeholder="Pick colors...">
    <template #tag="{ item, removeItem }">
      <span class="tag">
        {{ item }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices :items="colors" :search-fields="[]">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>`

const codeObjects = `<ui-select v-model="selected" :multiple="true" :clearable="true">
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
    :search-fields="['name', 'email']"
  >
    <template #choice="{ item }">
      {{ item.name }} — {{ item.email }}
    </template>
  </ui-select-choices>
</ui-select>`

const codeBind = `<!-- v-model will be an array of IDs, not objects -->
<ui-select
  v-model="selectedIds"
  :multiple="true"
  :bind-property="'id'"
  :clearable="true"
>
  <ui-select-match placeholder="Pick IDs...">
    <template #tag="{ item, removeItem }">
      <span class="tag">{{ item }}
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

const codeGrouped = `<ui-select v-model="selected" :multiple="true">
  <ui-select-match placeholder="Pick (grouped)...">
    <template #tag="{ item, removeItem }">
      <span class="tag">{{ item.name }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :group-by="'country'"
    :search-fields="['name']"
  >
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`

const codeLimit = `<!-- Limit maximum selections to 3 -->
<ui-select v-model="selected" :multiple="true" :limit="3">
  <ui-select-match placeholder="Max 3...">
    <template #tag="{ item, removeItem }">
      <span class="tag">{{ item.name }}
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
