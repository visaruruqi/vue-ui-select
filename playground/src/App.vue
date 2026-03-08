<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <nav class="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4" data-testid="sidebar">
      <h1 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">vue-ui-select</h1>
      <ul class="space-y-1">
        <li v-for="route in navRoutes" :key="route.path">
          <router-link
            :to="route.path"
            class="block px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            active-class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
            :data-testid="`nav-${route.path.slice(1)}`"
          >
            {{ route.meta?.title }}
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-800">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { routes } from './router'

const navRoutes = routes.filter((r) => r.path !== '/')
</script>
