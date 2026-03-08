<template>
  <div data-testid="page-getting-started">
    <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Getting Started</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Learn <code class="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">vue-ui-select</code> step&nbsp;by&nbsp;step &mdash; from the simplest use-case to advanced features.
    </p>

    <div class="max-w-xl space-y-10">
      <!-- ───────── Step 1 ───────── -->
      <section>
        <StepHeader n="1" title="Simplest possible select" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          A flat list of strings &mdash; no config needed beyond <code>:items</code>.
        </p>
        <ExampleSection title="String array" :code="code1">
          <ui-select v-model="s1" data-testid="gs-step1">
            <ui-select-match placeholder="Pick a color...">
              <template #default="{ selected }">{{ selected }}</template>
            </ui-select-match>
            <ui-select-choices :items="colors">
              <template #choice="{ item }">{{ item }}</template>
            </ui-select-choices>
          </ui-select>
          <p class="mt-1 text-sm text-gray-500 break-all">v-model: {{ s1 ?? 'null' }}</p>
        </ExampleSection>
      </section>

      <!-- ───────── Step 2 ───────── -->
      <section>
        <StepHeader n="2" title="Object items + trackBy" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Use objects as items. <code>track-by</code> tells the component how to compare items (here by <code>id</code>).
          <code>search-fields</code> controls which properties are searched.
        </p>
        <ExampleSection title="Object array with search" :code="code2">
          <ui-select v-model="s2" :clearable="true" data-testid="gs-step2">
            <ui-select-match placeholder="Search people...">
              <template #default="{ selected }">{{ selected?.name }}</template>
            </ui-select-match>
            <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name', 'email']">
              <template #choice="{ item }">{{ item.name }} &mdash; {{ item.email }}</template>
            </ui-select-choices>
          </ui-select>
          <p class="mt-1 text-sm text-gray-500 break-all">v-model: {{ s2 ? JSON.stringify(s2) : 'null' }}</p>
        </ExampleSection>
      </section>

      <!-- ───────── Step 3 ───────── -->
      <section>
        <StepHeader n="3" title="Bind to a single property" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <code>bind-property="id"</code> makes <code>v-model</code> emit only the <code>id</code> field instead of the whole object.
        </p>
        <ExampleSection title="Bind property" :code="code3">
          <ui-select v-model="s3" :clearable="true" data-testid="gs-step3">
            <ui-select-match placeholder="Pick a person...">
              <template #default="{ selected }">{{ selected?.name }}</template>
            </ui-select-match>
            <ui-select-choices :items="people" :track-by="'id'" :bind-property="'id'" :search-fields="['name']">
              <template #choice="{ item }">{{ item.name }}</template>
            </ui-select-choices>
          </ui-select>
          <p class="mt-1 text-sm text-gray-500 break-all">v-model (id only): {{ s3 ?? 'null' }}</p>
        </ExampleSection>
      </section>

      <!-- ───────── Step 4 ───────── -->
      <section>
        <StepHeader n="4" title="Multiple selection" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Add <code>:multiple="true"</code>. The model becomes an array.
          Use the <code>#tag</code> slot to customise each selected chip.
        </p>
        <ExampleSection title="Multi-select" :code="code4">
          <ui-select v-model="s4" :multiple="true" :clearable="true" data-testid="gs-step4">
            <ui-select-match placeholder="Pick colors...">
              <template #tag="{ item, removeItem }">
                <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-sm mr-1">
                  {{ item }}
                  <button type="button" @click="removeItem(item)">&times;</button>
                </span>
              </template>
            </ui-select-match>
            <ui-select-choices :items="colors">
              <template #choice="{ item }">{{ item }}</template>
            </ui-select-choices>
          </ui-select>
          <p class="mt-1 text-sm text-gray-500 break-all">v-model: {{ s4 }}</p>
        </ExampleSection>
      </section>

      <!-- ───────── Step 5 ───────── -->
      <section>
        <StepHeader n="5" title="Grouping" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <code>group-by</code> accepts a property name or function. Items are rendered under group headers automatically.
        </p>
        <ExampleSection title="Group by country" :code="code5">
          <ui-select v-model="s5" :clearable="true" data-testid="gs-step5">
            <ui-select-match placeholder="Grouped by country...">
              <template #default="{ selected }">{{ selected?.name }}</template>
            </ui-select-match>
            <ui-select-choices :items="people" :track-by="'id'" :group-by="'country'" :search-fields="['name']">
              <template #choice="{ item }">{{ item.name }}</template>
            </ui-select-choices>
          </ui-select>
        </ExampleSection>
      </section>

      <!-- ───────── Step 6 ───────── -->
      <section>
        <StepHeader n="6" title="Tagging (create on the fly)" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <code>:tagging="true"</code> lets users type a new value and press Enter to add it.
          Combine with <code>:tagging-tokens="[',', ';']"</code> to split pasted text automatically.
        </p>
        <ExampleSection title="String tags with token separators" :code="code6">
          <ui-select v-model="s6" :multiple="true" :tagging="true" :tagging-tokens="[',', ';']" data-testid="gs-step6">
            <ui-select-match placeholder="Type or paste tags (separated by , or ;)">
              <template #tag="{ item, removeItem }">
                <span class="inline-flex items-center gap-1 bg-green-100 text-green-800 rounded px-2 py-0.5 text-sm mr-1">
                  {{ item }}
                  <button type="button" @click="removeItem(item)">&times;</button>
                </span>
              </template>
            </ui-select-match>
            <ui-select-choices :items="tagSuggestions">
              <template #choice="{ item }">{{ item }}</template>
            </ui-select-choices>
          </ui-select>
          <p class="mt-1 text-sm text-gray-500 break-all">v-model: {{ s6 }}</p>
        </ExampleSection>
      </section>

      <!-- ───────── Step 7 ───────── -->
      <section>
        <StepHeader n="7" title="Async / remote search" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Listen to <code>@search</code>, fetch data, and pass the results as <code>:items</code>.
          Show a spinner with <code>:loading</code>.
        </p>
        <ExampleSection title="Async search" :code="code7">
          <ui-select v-model="s7" :clearable="true" :loading="asyncLoading" @search="onAsyncSearch" data-testid="gs-step7">
            <ui-select-match placeholder="Type a name (e.g. Adam, Maria)...">
              <template #default="{ selected }">{{ selected?.name }}</template>
            </ui-select-match>
            <ui-select-choices :items="asyncResults" :track-by="'id'" :search-fields="['name']">
              <template #choice="{ item }">{{ item.name }} &mdash; {{ item.email }}</template>
            </ui-select-choices>
            <ui-select-no-choice>No results found.</ui-select-no-choice>
          </ui-select>
        </ExampleSection>
      </section>

      <!-- ───────── Step 8 ───────── -->
      <section>
        <StepHeader n="8" title="Events" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <code>@select</code> and <code>@remove</code> fire when items are added/removed.
          <code>@open</code>, <code>@close</code>, <code>@search</code>, <code>@highlight</code> round out the event API.
        </p>
        <ExampleSection title="Selection events" :code="code8">
          <ui-select
            v-model="s8"
            :multiple="true"
            :clearable="true"
            @select="eventLog.unshift(`✅ select: ${JSON.stringify($event.item?.name ?? $event.item)}`)"
            @remove="eventLog.unshift(`❌ remove: ${JSON.stringify($event.item?.name ?? $event.item)}`)"
            data-testid="gs-step8"
          >
            <ui-select-match placeholder="Pick people to see events...">
              <template #tag="{ item, removeItem }">
                <span class="inline-flex items-center gap-1 bg-purple-100 text-purple-800 rounded px-2 py-0.5 text-sm mr-1">
                  {{ item.name }}
                  <button type="button" @click="removeItem(item)">&times;</button>
                </span>
              </template>
            </ui-select-match>
            <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
              <template #choice="{ item }">{{ item.name }}</template>
            </ui-select-choices>
          </ui-select>
          <div v-if="eventLog.length" class="mt-2 max-h-28 overflow-y-auto rounded bg-gray-50 dark:bg-gray-900 p-2 text-xs font-mono text-gray-700 dark:text-gray-300">
            <div v-for="(msg, i) in eventLog" :key="i">{{ msg }}</div>
          </div>
        </ExampleSection>
      </section>

      <!-- ───────── Step 9 ───────── -->
      <section>
        <StepHeader n="9" title="Disabled & loading states" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <code>:disabled</code> prevents interaction. <code>:loading</code> shows a spinner.
          <code>:disable-choice</code> disables individual items.
        </p>
        <ExampleSection title="States" :code="code9">
          <div class="space-y-3">
            <ui-select v-model="s9a" :disabled="true" data-testid="gs-step9-disabled">
              <ui-select-match placeholder="I am disabled">
                <template #default="{ selected }">{{ selected }}</template>
              </ui-select-match>
              <ui-select-choices :items="colors">
                <template #choice="{ item }">{{ item }}</template>
              </ui-select-choices>
            </ui-select>

            <ui-select v-model="s9b" :loading="true" data-testid="gs-step9-loading">
              <ui-select-match placeholder="I am loading...">
                <template #default="{ selected }">{{ selected }}</template>
              </ui-select-match>
              <ui-select-choices :items="colors">
                <template #choice="{ item }">{{ item }}</template>
              </ui-select-choices>
            </ui-select>

            <ui-select v-model="s9c" :clearable="true" data-testid="gs-step9-disable-choice">
              <ui-select-match placeholder="Some choices disabled...">
                <template #default="{ selected }">{{ selected?.name }}</template>
              </ui-select-match>
              <ui-select-choices
                :items="people"
                :track-by="'id'"
                :search-fields="['name']"
                :disable-choice="(p: any) => p.age < 18"
              >
                <template #choice="{ item, isDisabled }">
                  <span :class="{ 'opacity-40': isDisabled }">
                    {{ item.name }} (age {{ item.age }})
                    <small v-if="isDisabled" class="italic"> — too young</small>
                  </span>
                </template>
              </ui-select-choices>
            </ui-select>
          </div>
        </ExampleSection>
      </section>

      <!-- ───────── Step 10 ───────── -->
      <section>
        <StepHeader n="10" title="Theming" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Switch between four built-in themes: <code>tailwind</code> (default),
          <code>bootstrap</code>, <code>select2</code>, <code>selectize</code>.
        </p>
        <ExampleSection title="Theme switcher" :code="code10">
          <div class="flex gap-2 mb-3 flex-wrap">
            <button
              v-for="t in themes"
              :key="t"
              class="px-3 py-1 text-xs rounded border"
              :class="activeTheme === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'"
              @click="activeTheme = t"
            >
              {{ t }}
            </button>
          </div>
          <ui-select v-model="s10" :theme="activeTheme" :clearable="true" data-testid="gs-step10">
            <ui-select-match placeholder="Pick a person...">
              <template #default="{ selected }">{{ selected?.name }}</template>
            </ui-select-match>
            <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
              <template #choice="{ item }">{{ item.name }}</template>
            </ui-select-choices>
          </ui-select>
        </ExampleSection>
      </section>

      <!-- ───────── Step 11 ───────── -->
      <section>
        <StepHeader n="11" title="Dropdown position" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <code>position="up"</code> opens the dropdown above,
          <code>"auto"</code> picks the direction with more space.
        </p>
        <ExampleSection title="Position up" :code="code11">
          <div class="pt-48">
            <ui-select v-model="s11" position="up" :clearable="true" data-testid="gs-step11">
              <ui-select-match placeholder="Opens upward...">
                <template #default="{ selected }">{{ selected?.name }}</template>
              </ui-select-match>
              <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
                <template #choice="{ item }">{{ item.name }}</template>
              </ui-select-choices>
            </ui-select>
          </div>
        </ExampleSection>
      </section>

      <!-- ───────── Step 12 ───────── -->
      <section>
        <StepHeader n="12" title="Putting it all together" />
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Combine multiple features: multi-select, grouped, clearable, with custom slots.
        </p>
        <ExampleSection title="Full-featured example" :code="code12">
          <ui-select v-model="s12" :multiple="true" :clearable="true" data-testid="gs-step12">
            <ui-select-match placeholder="Multi + grouped + custom slots">
              <template #tag="{ item, removeItem }">
                <span class="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-sm mr-1">
                  <span class="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                    {{ item.name[0] }}
                  </span>
                  {{ item.name }}
                  <button type="button" @click="removeItem(item)">&times;</button>
                </span>
              </template>
            </ui-select-match>
            <ui-select-choices
              :items="people"
              :track-by="'id'"
              :group-by="'country'"
              :search-fields="['name', 'email']"
            >
              <template #choice="{ item, isSelected }">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {{ item.name[0] }}
                  </span>
                  <div class="leading-tight">
                    <div>{{ item.name }}</div>
                    <div class="text-xs text-gray-400">{{ item.email }}</div>
                  </div>
                  <span v-if="isSelected" class="ml-auto text-green-500 text-xs">✓</span>
                </div>
              </template>
            </ui-select-choices>
            <ui-select-no-choice>Nothing matched your search.</ui-select-no-choice>
          </ui-select>
          <p class="mt-1 text-sm text-gray-500 break-all">
            v-model: {{ s12.map((p: any) => p.name) }}
          </p>
        </ExampleSection>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { people, colors, tags as tagSuggestions, searchPeopleAsync } from '../data'
import type { Person } from '../data'
import ExampleSection from '../components/ExampleSection.vue'
import StepHeader from '../components/StepHeader.vue'

// Step models
const s1 = ref<string | null>(null)
const s2 = ref<Person | null>(null)
const s3 = ref<number | null>(null)
const s4 = ref<string[]>([])
const s5 = ref<Person | null>(null)
const s6 = ref<string[]>([])
const s7 = ref<Person | null>(null)
const s8 = ref<any[]>([])
const s9a = ref<string | null>(null)
const s9b = ref<string | null>(null)
const s9c = ref<Person | null>(null)
const s10 = ref<Person | null>(null)
const s11 = ref<Person | null>(null)
const s12 = ref<any[]>([])

// Step 7: async
const asyncResults = ref<Person[]>([])
const asyncLoading = ref(false)
let asyncTimer: ReturnType<typeof setTimeout> | null = null
function onAsyncSearch(q: string) {
  if (asyncTimer) clearTimeout(asyncTimer)
  if (!q) { asyncResults.value = []; return }
  asyncLoading.value = true
  asyncTimer = setTimeout(async () => {
    asyncResults.value = await searchPeopleAsync(q, 0)
    asyncLoading.value = false
  }, 400)
}

// Step 8: event log
const eventLog = reactive<string[]>([])

// Step 10: themes
const themes = ['tailwind', 'bootstrap', 'select2', 'selectize'] as const
const activeTheme = ref<string>('tailwind')

// ──────────── Code snippets ────────────

const code1 = `<script setup>
import { ref } from 'vue'

const selected = ref(null)

const colors = [
  'Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Maroon',
  'Umbra', 'Turquoise', 'Orange', 'Purple', 'Pink', 'Cyan',
]
<\/script>

<template>
  <ui-select v-model="selected">
    <ui-select-match placeholder="Pick a color...">
      <template #default="{ selected }">{{ selected }}</template>
    </ui-select-match>
    <ui-select-choices :items="colors">
      <template #choice="{ item }">{{ item }}</template>
    </ui-select-choices>
  </ui-select>
</template>`

const code2 = `<script setup>
import { ref } from 'vue'

const selected = ref(null)

const people = [
  { id: 1, name: 'Adam',    email: 'adam@email.com',    age: 12, country: 'United States' },
  { id: 2, name: 'Amalie',  email: 'amalie@email.com',  age: 12, country: 'Argentina' },
  { id: 3, name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
  // ... more items
]
<\/script>

<template>
  <ui-select v-model="selected" :clearable="true">
    <ui-select-match placeholder="Search people...">
      <template #default="{ selected }">{{ selected?.name }}</template>
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
  </ui-select>
</template>`

const code3 = `<script setup>
import { ref } from 'vue'

// v-model will hold the id (number), not the whole object
const selectedId = ref(null)

const people = [
  { id: 1, name: 'Adam',    email: 'adam@email.com',    age: 12, country: 'United States' },
  { id: 2, name: 'Amalie',  email: 'amalie@email.com',  age: 12, country: 'Argentina' },
  // ... more items
]
<\/script>

<template>
  <ui-select v-model="selectedId" :clearable="true">
    <ui-select-match placeholder="Pick a person...">
      <template #default="{ selected }">{{ selected?.name }}</template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :bind-property="'id'"
      :search-fields="['name']"
    >
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>`

const code4 = `<script setup>
import { ref } from 'vue'

const selected = ref([])

const colors = [
  'Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Maroon',
  'Umbra', 'Turquoise', 'Orange', 'Purple', 'Pink', 'Cyan',
]
<\/script>

<template>
  <ui-select v-model="selected" :multiple="true" :clearable="true">
    <ui-select-match placeholder="Pick colors...">
      <template #tag="{ item, removeItem }">
        <span class="chip">
          {{ item }}
          <button @click="removeItem(item)">&times;</button>
        </span>
      </template>
    </ui-select-match>
    <ui-select-choices :items="colors">
      <template #choice="{ item }">{{ item }}</template>
    </ui-select-choices>
  </ui-select>
</template>`

const code5 = `<script setup>
import { ref } from 'vue'

const selected = ref(null)

const people = [
  { id: 1, name: 'Adam',      email: 'adam@email.com',      age: 12, country: 'United States' },
  { id: 2, name: 'Amalie',    email: 'amalie@email.com',    age: 12, country: 'Argentina' },
  { id: 3, name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
  { id: 4, name: 'Adrian',    email: 'adrian@email.com',    age: 21, country: 'Ecuador' },
  // ... items with different countries for grouping
]
<\/script>

<template>
  <ui-select v-model="selected" :clearable="true">
    <ui-select-match placeholder="Grouped by country...">
      <template #default="{ selected }">{{ selected?.name }}</template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :group-by="'country'"
      :search-fields="['name']"
    >
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>`

const code6 = `<script setup>
import { ref } from 'vue'

const tags = ref([])

// Optional: pre-defined suggestions shown in dropdown
const suggestions = [
  'JavaScript', 'TypeScript', 'Vue', 'React', 'Angular',
  'Svelte', 'Node.js', 'Deno', 'Bun', 'Vite',
]
<\/script>

<template>
  <ui-select
    v-model="tags"
    :multiple="true"
    :tagging="true"
    :tagging-tokens="[',', ';']"
  >
    <ui-select-match placeholder="Type or paste tags...">
      <template #tag="{ item, removeItem }">
        <span class="chip">
          {{ item }}
          <button @click="removeItem(item)">&times;</button>
        </span>
      </template>
    </ui-select-match>
    <ui-select-choices :items="suggestions">
      <template #choice="{ item }">{{ item }}</template>
    </ui-select-choices>
  </ui-select>
</template>`

const code7 = `<script setup>
import { ref } from 'vue'
import { searchPeopleAsync } from './data'

const results = ref([])
const loading = ref(false)

function onSearch(query) {
  if (!query) { results.value = []; return }
  loading.value = true
  searchPeopleAsync(query).then((data) => {
    results.value = data
    loading.value = false
  })
}
<\/script>

<template>
  <ui-select v-model="selected" :loading="loading" @search="onSearch">
    <ui-select-match placeholder="Type a name...">
      <template #default="{ selected }">{{ selected?.name }}</template>
    </ui-select-match>
    <ui-select-choices :items="results" :track-by="'id'" :search-fields="['name']">
      <template #choice="{ item }">{{ item.name }} — {{ item.email }}</template>
    </ui-select-choices>
    <ui-select-no-choice>No results found.</ui-select-no-choice>
  </ui-select>
</template>`

const code8 = `<script setup>
import { ref } from 'vue'

const selected = ref([])

const people = [
  { id: 1, name: 'Adam', email: 'adam@email.com', age: 12, country: 'United States' },
  // ... more items
]

function onSelect(event) {
  console.log('Selected:', event.item)
}

function onRemove(event) {
  console.log('Removed:', event.item)
}
<\/script>

<template>
  <ui-select
    v-model="selected"
    :multiple="true"
    @select="onSelect($event)"
    @remove="onRemove($event)"
  >
    <ui-select-match placeholder="Pick people...">
      <template #tag="{ item, removeItem }">
        {{ item.name }}
        <button @click="removeItem(item)">&times;</button>
      </template>
    </ui-select-match>
    <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>`

const code9 = `<script setup>
import { ref } from 'vue'

const selected = ref(null)

const people = [
  { id: 1, name: 'Adam',   age: 12, country: 'United States' },
  { id: 3, name: 'Estefanía', age: 21, country: 'Argentina' },
  { id: 9, name: 'Michael', age: 15, country: 'Colombia' },
  // ... items with varying ages
]
<\/script>

<template>
  <!-- Disabled -->
  <ui-select :disabled="true" v-model="selected">
    <ui-select-match placeholder="I am disabled">
      <template #default="{ selected }">{{ selected?.name }}</template>
    </ui-select-match>
    <ui-select-choices :items="people" :track-by="'id'"
      :search-fields="['name']">
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>

  <!-- Loading spinner -->
  <ui-select :loading="true" v-model="selected">
    <!-- same structure -->
  </ui-select>

  <!-- Disable individual choices -->
  <ui-select v-model="selected">
    <ui-select-match placeholder="Some choices disabled...">
      <template #default="{ selected }">{{ selected?.name }}</template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :search-fields="['name']"
      :disable-choice="(p) => p.age < 18"
    >
      <template #choice="{ item, isDisabled }">
        {{ item.name }} (age {{ item.age }})
        <small v-if="isDisabled"> — too young</small>
      </template>
    </ui-select-choices>
  </ui-select>
</template>`

const code10 = `<script setup>
import { ref } from 'vue'

const selected = ref(null)
const activeTheme = ref('tailwind')

const people = [
  { id: 1, name: 'Adam', email: 'adam@email.com' },
  // ... more items
]

// Remember to import the theme CSS:
// import 'vue-ui-select/themes/tailwind.css'
// import 'vue-ui-select/themes/bootstrap.css'
// import 'vue-ui-select/themes/select2.css'
// import 'vue-ui-select/themes/selectize.css'
<\/script>

<template>
  <!-- Available themes: tailwind, bootstrap, select2, selectize -->
  <ui-select v-model="selected" :theme="activeTheme" :clearable="true">
    <ui-select-match placeholder="Pick a person...">
      <template #default="{ selected }">{{ selected?.name }}</template>
    </ui-select-match>
    <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>`

const code11 = `<script setup>
import { ref } from 'vue'

const selected = ref(null)

const people = [
  { id: 1, name: 'Adam', email: 'adam@email.com', age: 12, country: 'United States' },
  // ... more items
]
<\/script>

<template>
  <!-- position="up" opens above, position="auto" picks direction with more space -->
  <ui-select v-model="selected" position="up" :clearable="true">
    <ui-select-match placeholder="Opens upward...">
      <template #default="{ selected }">{{ selected?.name }}</template>
    </ui-select-match>
    <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>`

const code12 = `<script setup>
import { ref } from 'vue'

const selected = ref([])

const people = [
  { id: 1,  name: 'Adam',      email: 'adam@email.com',      age: 12, country: 'United States' },
  { id: 2,  name: 'Amalie',    email: 'amalie@email.com',    age: 12, country: 'Argentina' },
  { id: 3,  name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
  { id: 4,  name: 'Adrian',    email: 'adrian@email.com',    age: 21, country: 'Ecuador' },
  { id: 5,  name: 'Wladimir',  email: 'wladimir@email.com',  age: 30, country: 'Ecuador' },
  { id: 6,  name: 'Samantha',  email: 'samantha@email.com',  age: 30, country: 'United States' },
  { id: 7,  name: 'Nicole',    email: 'nicole@email.com',    age: 43, country: 'Colombia' },
  // ... more items
]
<\/script>

<template>
  <ui-select v-model="selected" :multiple="true" :clearable="true">
    <ui-select-match placeholder="Multi + grouped + custom slots">
      <template #tag="{ item, removeItem }">
        <span class="chip avatar-chip">
          <span class="avatar">{{ item.name[0] }}</span>
          {{ item.name }}
          <button @click="removeItem(item)">&times;</button>
        </span>
      </template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :group-by="'country'"
      :search-fields="['name', 'email']"
    >
      <template #choice="{ item, isSelected }">
        <div class="choice-row">
          <span class="avatar">{{ item.name[0] }}</span>
          <div>
            <div>{{ item.name }}</div>
            <small>{{ item.email }}</small>
          </div>
          <span v-if="isSelected">✓</span>
        </div>
      </template>
    </ui-select-choices>
    <ui-select-no-choice>Nothing matched.</ui-select-no-choice>
  </ui-select>
</template>`
</script>
