<template>
  <div data-testid="page-focus-scroll">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Focus &amp; Page Scroll</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-4">
      Opening a searchable dropdown focuses its search input. When the dropdown is
      teleported to <code>&lt;body&gt;</code> that input can sit far down the document, and
      the browser's default focus behaviour scrolls the window to reveal it — throwing the
      user to the bottom of the page and out of sight of the header.
    </p>

    <!-- Deliberately tall, so the window itself has somewhere to be thrown to. -->
    <div style="height: 150vh" class="flex flex-col justify-center">
      <div class="max-w-sm">
        <ui-select
          v-model="selected"
          :append-to-body="true"
          :search-enabled="true"
          data-testid="focus-scroll-select"
        >
          <ui-select-match placeholder="Pick a timezone...">
            <template #default="{ selected: sel }">{{ sel?.name }}</template>
          </ui-select-match>
          <ui-select-choices :items="zones" :track-by="'id'" :search-fields="['name']">
            <template #choice="{ item }">{{ item.name }}</template>
          </ui-select-choices>
        </ui-select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const selected = ref<any>(null)

const zones = Array.from({ length: 60 }, (_, index) => ({
  id: `zone-${index}`,
  name: `(GMT${index % 2 ? '+' : '-'}0${index % 10}:00) Zone ${index}`,
}))

// The bug needs the *document* to be what scrolls, since a dropdown teleported to
// <body> has only <body>/<html> above it. The playground shell scrolls an inner
// <main>, so force the document taller than the viewport the way real app shells
// do (a shell sized past 100vh is a common pattern, and is what surfaced this).
let previousMinHeight = ''

onMounted(() => {
  previousMinHeight = document.body.style.minHeight
  document.body.style.minHeight = '115vh'
})

onBeforeUnmount(() => {
  document.body.style.minHeight = previousMinHeight
})
</script>
