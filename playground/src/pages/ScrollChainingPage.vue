<template>
  <div data-testid="page-scroll-chaining">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Scroll Chaining</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">
      Reproduces the app-shell layout that broke wheel scrolling: the page scrolls on an
      inner container, not on the window, and the dropdown is teleported to
      <code>&lt;body&gt;</code>. Because the browser chains wheel scrolling along DOM
      ancestors, the teleported dropdown used to hand the scroll to
      <code>&lt;body&gt;</code> — which app shells leave at <code>overflow: hidden</code> —
      so the page froze while the dropdown was open.
    </p>

    <!-- The app shell: fixed height, clipped, exactly like a sidebar/navbar layout. -->
    <div
      class="border border-gray-300 dark:border-gray-600 rounded overflow-hidden h-64"
      data-testid="app-shell"
    >
      <!-- The real scroller. It is NOT an ancestor of the teleported dropdown. -->
      <div class="h-full overflow-y-auto p-4" data-testid="scroll-container">
        <p class="mb-4 text-sm text-gray-500">Scroll me with the wheel.</p>

        <!-- Filler above too, so the select can sit mid-scroll: opening it must
             not jerk the page to bring the search input into view. -->
        <p
          v-for="row in 10"
          :key="`lead-${row}`"
          class="py-2 text-sm text-gray-600 dark:text-gray-400"
          data-testid="lead-row"
        >
          Lead row {{ row }}
        </p>

        <div class="max-w-sm mb-4">
          <ui-select
            v-model="selected"
            :append-to-body="true"
            :search-enabled="true"
            data-testid="chaining-select"
          >
            <ui-select-match placeholder="Pick a timezone...">
              <template #default="{ selected: sel }">{{ sel?.name }}</template>
            </ui-select-match>
            <ui-select-choices :items="zones" :track-by="'id'" :search-fields="['name']">
              <template #choice="{ item }">{{ item.name }}</template>
            </ui-select-choices>
          </ui-select>
        </div>

        <!-- Filler so the container genuinely has somewhere to scroll. -->
        <p
          v-for="row in 30"
          :key="row"
          class="py-2 text-sm text-gray-600 dark:text-gray-400"
          data-testid="filler-row"
        >
          Row {{ row }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const selected = ref<any>(null)

// A long list, so the dropdown's own scroller has plenty to consume before the
// scroll should chain outwards.
const zones = Array.from({ length: 60 }, (_, index) => ({
  id: `zone-${index}`,
  name: `(GMT${index % 2 ? '+' : '-'}0${index % 10}:00) Zone ${index}`,
}))

// Match the app shell: with the document unable to scroll there is no fallback,
// so a broken chain leaves the user with nothing that moves at all.
let previousOverflow = ''

onMounted(() => {
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
})
</script>
