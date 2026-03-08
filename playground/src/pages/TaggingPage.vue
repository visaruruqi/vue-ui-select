<template>
  <div data-testid="page-tagging">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tagging</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">Create new items on the fly with tagging.</p>

    <div class="max-w-md space-y-6">
      <ExampleSection title="String tags" :code="codeString">
        <ui-select v-model="tags1" :multiple="true" :tagging="true" data-testid="tag-string">
          <ui-select-match placeholder="Type and press Enter...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="existingTags" :search-fields="[]">
            <template #choice="{ item }">{{ item }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Model: {{ tags1 }}</p>
      </ExampleSection>

      <ExampleSection title="Predictive tagging" :code="codePredictive">
        <ui-select v-model="tags2" :multiple="true" :tagging="true" data-testid="tag-predictive">
          <ui-select-match placeholder="Type to search or create...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-green-100 text-green-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="programmingLanguages" :search-fields="[]">
            <template #choice="{ item }">{{ item }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Object tags (custom tagging function)" :code="codeObject">
        <ui-select
          v-model="tags3"
          :multiple="true"
          :tagging="createPersonTag"
          data-testid="tag-object"
        >
          <ui-select-match placeholder="Create people tags...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-purple-100 text-purple-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item.name }} <small v-if="item.isTag" class="opacity-50">(new)</small>
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <ExampleSection title="Token separators (, and ;)" :code="codeTokens">
        <ui-select
          v-model="tags4"
          :multiple="true"
          :tagging="true"
          :tagging-tokens="[',', ';']"
          data-testid="tag-tokens"
        >
          <ui-select-match placeholder="Paste comma-separated values...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="[]">
            <template #choice="{ item }">{{ item }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">Model: {{ tags4 }}</p>
      </ExampleSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { people, tags as existingTags } from '../data'
import ExampleSection from '../components/ExampleSection.vue'

const programmingLanguages = [
  'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C#', 'Ruby', 'Swift', 'Kotlin',
]

const tags1 = ref<string[]>([])
const tags2 = ref<string[]>([])
const tags3 = ref<any[]>([])
const tags4 = ref<string[]>([])

let tagIdCounter = 1000
function createPersonTag(text: string) {
  return { id: tagIdCounter++, name: text, email: '', age: 0, country: 'Unknown', isTag: true }
}

const codeString = `<!-- Simple string tagging -->
<ui-select v-model="tags" :multiple="true" :tagging="true">
  <ui-select-match placeholder="Type and press Enter...">
    <template #tag="{ item, removeItem }">
      <span class="tag">{{ item }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices :items="existingTags" :search-fields="[]">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>`

const codePredictive = `<!-- Tagging with suggestions from a list -->
<ui-select v-model="tags" :multiple="true" :tagging="true">
  <ui-select-match placeholder="Type to search or create...">
    <template #tag="{ item, removeItem }">
      <span class="tag">{{ item }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices :items="languages" :search-fields="[]">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>`

const codeObject = `<!-- Custom tagging function to create object tags -->
<script setup>
import { people } from './data'

let tagId = 1000
function createPersonTag(text) {
  return {
    id: tagId++,
    name: text,
    email: '',
    age: 0,
    country: 'Unknown',
    isTag: true,
  }
}
<\/script>

<template>
  <ui-select
    v-model="tags"
    :multiple="true"
    :tagging="createPersonTag"
  >
    <ui-select-match placeholder="Create people tags...">
      <template #tag="{ item, removeItem }">
        {{ item.name }}
        <small v-if="item.isTag">(new)</small>
        <button @click="removeItem(item)">&times;</button>
      </template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :search-fields="['name']"
    >
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>`

const codeTokens = `<!-- Token separators auto-split pasted text into tags -->
<ui-select
  v-model="tags"
  :multiple="true"
  :tagging="true"
  :tagging-tokens="[',', ';']"
>
  <ui-select-match placeholder="Paste comma-separated values...">
    <template #tag="{ item, removeItem }">
      <span class="tag">{{ item }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices :items="[]">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>`
</script>
