import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { UiSelectPlugin } from 'vue-ui-select'
import { routes } from './router'

// Tailwind utility classes for the playground layout & demo pages
import './style.css'

// Component theme CSS
import '../../src/themes/tailwind.css'
import '../../src/themes/bootstrap.css'
import '../../src/themes/select2.css'
import '../../src/themes/selectize.css'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.use(UiSelectPlugin, { theme: 'tailwind' })
app.mount('#app')
