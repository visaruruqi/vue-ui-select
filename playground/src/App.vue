<template>
  <div class="flex h-screen relative">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/40 z-30 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <nav
      class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 transform transition-transform duration-200 ease-in-out lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      data-testid="sidebar"
    >
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-lg font-bold text-gray-900 dark:text-white">vue-ui-select</h1>
        <button
          type="button"
          class="lg:hidden p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          @click="sidebarOpen = false"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ul class="space-y-1">
        <li v-for="route in navRoutes" :key="route.path">
          <router-link
            :to="route.path"
            class="block px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            active-class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
            :data-testid="`nav-${route.path.slice(1)}`"
            @click="sidebarOpen = false"
          >
            {{ route.meta?.title }}
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile header -->
      <header class="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <button
          type="button"
          class="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="sidebarOpen = true"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="font-semibold text-gray-900 dark:text-white text-sm truncate">vue-ui-select</span>
      </header>

      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { routes } from './router'

const navRoutes = routes.filter((r) => r.path !== '/')
const sidebarOpen = ref(false)
</script>
