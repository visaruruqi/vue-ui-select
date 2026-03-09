<template>
  <div data-testid="page-checkbox-selection">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Checkbox Selection</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Multi-select with inline checkboxes rendered by <code>ui-select-choices</code>.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="Strings with checkboxes" :code="codeStrings">
        <ui-select v-model="selColors" :multiple="true" :remove-selected="false" :close-on-select="false" :clearable="true" data-testid="cb-strings">
          <ui-select-match placeholder="Pick colors...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="colors" :search-fields="[]" :show-checkboxes="true">
            <template #choice="{ item }">{{ item }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Selected: {{ selColors }}</p>
      </ExampleSection>

      <ExampleSection title="Objects with checkboxes" :code="codeObjects">
        <ui-select v-model="selPeople" :multiple="true" :remove-selected="false" :close-on-select="false" :clearable="true" data-testid="cb-objects">
          <ui-select-match placeholder="Pick people...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-green-100 text-green-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item.name }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name', 'email']" :show-checkboxes="true">
            <template #choice="{ item }">{{ item.name }} — {{ item.email }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Selected: {{ JSON.stringify(selPeople.map(p => p.name)) }}</p>
      </ExampleSection>

      <ExampleSection title="Searchable with checkboxes" :code="codeSearch">
        <ui-select v-model="selSearch" :multiple="true" :remove-selected="false" :close-on-select="false" :clearable="true" data-testid="cb-search">
          <ui-select-match placeholder="Search & pick people...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item.name }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name', 'email', 'country']" :show-checkboxes="true">
            <template #choice="{ item, search, highlighted }">
              <span v-html="highlighted(item.name, search)"></span>
              <span class="text-xs text-gray-400 ml-1">{{ item.country }}</span>
            </template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Selected: {{ JSON.stringify(selSearch.map(p => p.name)) }}</p>
      </ExampleSection>

      <ExampleSection title="Without checkboxes (default)" :code="codeDefault">
        <ui-select v-model="selDefault" :multiple="true" :clearable="true" data-testid="cb-default">
          <ui-select-match placeholder="Normal multi-select...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-gray-100 text-gray-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="colors" :search-fields="[]">
            <template #choice="{ item }">{{ item }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500">No checkboxes — same behavior as before.</p>
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
const selSearch = ref<any[]>([])
const selDefault = ref<string[]>([])

const codeStrings = `<ui-select v-model="selected" :multiple="true" :remove-selected="false" :close-on-select="false" :clearable="true">
  <ui-select-match placeholder="Pick colors...">
    <template #tag="{ item, removeItem }">
      <span class="tag">
        {{ item }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices :items="colors" :show-checkboxes="true">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>`

const codeObjects = `<ui-select v-model="selected" :multiple="true" :remove-selected="false" :close-on-select="false" :clearable="true">
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
    :show-checkboxes="true"
  >
    <template #choice="{ item }">
      {{ item.name }} — {{ item.email }}
    </template>
  </ui-select-choices>
</ui-select>`

const codeSearch = `<ui-select v-model="selected" :multiple="true" :remove-selected="false" :close-on-select="false" :clearable="true">
  <ui-select-match placeholder="Search & pick people...">
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
    :search-fields="['name', 'email', 'country']"
    :show-checkboxes="true"
  >
    <template #choice="{ item, search, highlighted }">
      <span v-html="highlighted(item.name, search)"></span>
      <span class="text-xs text-gray-400 ml-1">{{ item.country }}</span>
    </template>
  </ui-select-choices>
</ui-select>`

const codeDefault = `<!-- No show-checkboxes — normal multi-select -->
<ui-select v-model="selected" :multiple="true" :clearable="true">
  <ui-select-match placeholder="Normal multi-select...">
    <template #tag="{ item, removeItem }">
      <span class="tag">{{ item }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices :items="colors">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>`
</script>
