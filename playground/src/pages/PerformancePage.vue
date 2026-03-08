<template>
  <div data-testid="page-performance">
    <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Performance</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Stress-test <code class="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">ui-select</code>
      with large datasets &mdash; 1k, 5k, 10k, and 20k items.
    </p>

    <div class="max-w-xl space-y-10">
      <!-- ═══ controls ═══ -->
      <div class="flex flex-wrap gap-3 items-center">
        <button
          v-for="size in sizes"
          :key="size"
          class="px-4 py-1.5 text-sm rounded border font-medium transition"
          :class="activeSize === size
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'"
          @click="switchSize(size)"
        >
          {{ size.toLocaleString() }} items
        </button>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Generated in <strong>{{ genTime }}ms</strong>
        </span>
      </div>

      <!-- ═══ 1. Single select ═══ -->
      <ExampleSection title="Single select — search through all items" :code="codeSingle">
        <ui-select v-model="sel1" :clearable="true" data-testid="perf-single">
          <ui-select-match placeholder="Search...">
            <template #default="{ selected }">{{ selected?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="items" :track-by="'id'" :search-fields="['name', 'email']">
            <template #choice="{ item }">
              <div class="flex justify-between items-center">
                <span>{{ item.name }}</span>
                <span class="text-xs text-gray-400">{{ item.department }}</span>
              </div>
            </template>
          </ui-select-choices>
          <ui-select-no-choice>No matches.</ui-select-no-choice>
        </ui-select>
      </ExampleSection>

      <!-- ═══ 2. Multiple select ═══ -->
      <ExampleSection title="Multiple select — pick many from large list" :code="codeMulti">
        <ui-select v-model="sel2" :multiple="true" :clearable="true" :limit="20" data-testid="perf-multi">
          <ui-select-match placeholder="Pick up to 20...">
            <template #tag="{ item, removeItem }">
              <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-sm mr-1">
                {{ item.name }}
                <button type="button" @click="removeItem(item)">&times;</button>
              </span>
            </template>
          </ui-select-match>
          <ui-select-choices :items="items" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item, isSelected }">
              {{ item.name }}
              <span v-if="isSelected" class="text-green-500 text-xs ml-1">✓</span>
            </template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500">Selected: {{ sel2.length }} items</p>
      </ExampleSection>

      <!-- ═══ 3. Grouped ═══ -->
      <ExampleSection title="Grouped — items grouped by department" :code="codeGrouped">
        <ui-select v-model="sel3" :clearable="true" data-testid="perf-grouped">
          <ui-select-match placeholder="Search by name...">
            <template #default="{ selected }">{{ selected?.name }} ({{ selected?.department }})</template>
          </ui-select-match>
          <ui-select-choices
            :items="items"
            :track-by="'id'"
            :group-by="'department'"
            :search-fields="['name']"
          >
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </ExampleSection>

      <!-- ═══ 4. Bind-property ═══ -->
      <ExampleSection title="Bind-property — v-model is just the id" :code="codeBind">
        <ui-select v-model="sel4" :clearable="true" data-testid="perf-bind">
          <ui-select-match placeholder="Pick one (emits id)...">
            <template #default="{ selected }">{{ selected?.name }}</template>
          </ui-select-match>
          <ui-select-choices
            :items="items"
            :track-by="'id'"
            :bind-property="'id'"
            :search-fields="['name']"
          >
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
        <p class="mt-1 text-sm text-gray-500 break-all">v-model (id): {{ sel4 ?? 'null' }}</p>
      </ExampleSection>

      <!-- ═══ 5. Minimum input length ═══ -->
      <ExampleSection title="Minimum input length — don't render until 2+ chars" :code="codeMinInput">
        <ui-select v-model="sel5" :clearable="true" data-testid="perf-min-input">
          <ui-select-match placeholder="Type 2+ characters to search...">
            <template #default="{ selected }">{{ selected?.name }}</template>
          </ui-select-match>
          <ui-select-choices
            :items="items"
            :track-by="'id'"
            :search-fields="['name', 'email']"
            :minimum-input-length="2"
          >
            <template #choice="{ item }">
              <div>{{ item.name }} <small class="text-gray-400">{{ item.email }}</small></div>
            </template>
          </ui-select-choices>
          <ui-select-no-choice>No matches.</ui-select-no-choice>
        </ui-select>
        <p class="mt-1 text-xs text-gray-400 italic">
          Tip: <code>minimum-input-length</code> avoids rendering thousands of DOM nodes on open.
        </p>
      </ExampleSection>

      <!-- ═══ Metrics ═══ -->
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 class="text-base font-semibold mb-3 text-gray-800 dark:text-gray-200">Quick stats</h3>
        <dl class="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
          <dt class="text-gray-500 dark:text-gray-400">Dataset size</dt>
          <dd class="font-mono text-gray-900 dark:text-white">{{ activeSize.toLocaleString() }} objects</dd>
          <dt class="text-gray-500 dark:text-gray-400">Generation time</dt>
          <dd class="font-mono text-gray-900 dark:text-white">{{ genTime }}ms</dd>
          <dt class="text-gray-500 dark:text-gray-400">Departments (groups)</dt>
          <dd class="font-mono text-gray-900 dark:text-white">{{ departments.length }}</dd>
          <dt class="text-gray-500 dark:text-gray-400">Object shape</dt>
          <dd class="font-mono text-gray-900 dark:text-white text-xs">{ id, name, email, age, department }</dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import ExampleSection from '../components/ExampleSection.vue'

// ── types ──
interface BigItem {
  id: number
  name: string
  email: string
  age: number
  department: string
}

// ── generators ──
const firstNames = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda',
  'David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica',
  'Thomas','Sarah','Charles','Karen','Christopher','Lisa','Daniel','Nancy',
  'Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley',
  'Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle',
  'Kenneth','Carol','Kevin','Amanda','Brian','Dorothy','George','Melissa',
  'Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon',
  'Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy',
  'Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda',
  'Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen',
  'Benjamin','Samantha','Samuel','Katherine','Raymond','Christine','Gregory','Debra',
  'Frank','Rachel','Alexander','Carolyn','Patrick','Janet','Jack','Catherine',
]
const lastNames = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
  'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson',
  'Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson',
  'White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker',
  'Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill',
  'Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell',
  'Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz',
]
const departments = [
  'Engineering','Marketing','Sales','Design','Product','Finance',
  'Operations','Legal','HR','Support','Research','QA',
]

function generateItems(count: number): BigItem[] {
  const arr: BigItem[] = new Array(count)
  for (let i = 0; i < count; i++) {
    const first = firstNames[i % firstNames.length]
    const last = lastNames[Math.floor(i / firstNames.length) % lastNames.length]
    const dept = departments[i % departments.length]
    arr[i] = {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@company.com`,
      age: 20 + (i % 45),
      department: dept,
    }
  }
  return arr
}

// ── state ──
const sizes = [1_000, 5_000, 10_000, 20_000] as const
const activeSize = ref<number>(1_000)
const genTime = ref(0)
const items = shallowRef<BigItem[]>([])

// selections
const sel1 = ref<BigItem | null>(null)
const sel2 = ref<BigItem[]>([])
const sel3 = ref<BigItem | null>(null)
const sel4 = ref<number | null>(null)
const sel5 = ref<BigItem | null>(null)

function switchSize(size: number) {
  activeSize.value = size
  sel1.value = null
  sel2.value = []
  sel3.value = null
  sel4.value = null
  sel5.value = null
  const t0 = performance.now()
  items.value = generateItems(size)
  genTime.value = Math.round(performance.now() - t0)
}

// Generate initial dataset
switchSize(1_000)

// ── code snippets ──

const codeSingle = `<!-- Single select with 1 000+ items -->
<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Search...">
    <template #default="{ selected }">{{ selected?.name }}</template>
  </ui-select-match>
  <ui-select-choices
    :items="items"
    :track-by="'id'"
    :search-fields="['name', 'email']"
  >
    <template #choice="{ item }">
      {{ item.name }}
      <small>{{ item.department }}</small>
    </template>
  </ui-select-choices>
</ui-select>`

const codeMulti = `<!-- Multi-select with limit -->
<ui-select v-model="selected" :multiple="true" :clearable="true" :limit="20">
  <ui-select-match placeholder="Pick up to 20...">
    <template #tag="{ item, removeItem }">
      <span class="chip">
        {{ item.name }}
        <button @click="removeItem(item)">&times;</button>
      </span>
    </template>
  </ui-select-match>
  <ui-select-choices :items="items" :track-by="'id'" :search-fields="['name']">
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`

const codeGrouped = `<!-- Grouped by department -->
<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Search by name...">
    <template #default="{ selected }">
      {{ selected?.name }} ({{ selected?.department }})
    </template>
  </ui-select-match>
  <ui-select-choices
    :items="items"
    :track-by="'id'"
    :group-by="'department'"
    :search-fields="['name']"
  >
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`

const codeBind = `<!-- Bind-property emits only the id -->
<ui-select v-model="selectedId" :clearable="true">
  <ui-select-match placeholder="Pick (emits id)...">
    <template #default="{ selected }">{{ selected?.name }}</template>
  </ui-select-match>
  <ui-select-choices
    :items="items"
    :track-by="'id'"
    :bind-property="'id'"
    :search-fields="['name']"
  >
    <template #choice="{ item }">{{ item.name }}</template>
  </ui-select-choices>
</ui-select>`

const codeMinInput = `<!-- Minimum input length avoids rendering all items on open -->
<ui-select v-model="selected" :clearable="true">
  <ui-select-match placeholder="Type 2+ characters...">
    <template #default="{ selected }">{{ selected?.name }}</template>
  </ui-select-match>
  <ui-select-choices
    :items="items"
    :track-by="'id'"
    :search-fields="['name', 'email']"
    :minimum-input-length="2"
  >
    <template #choice="{ item }">
      {{ item.name }}
      <small>{{ item.email }}</small>
    </template>
  </ui-select-choices>
</ui-select>`
</script>
