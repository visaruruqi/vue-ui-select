import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { inject } from '@vercel/analytics'
import App from './App.vue'
import { UiSelectPlugin } from 'vue-ui-select'
import { VueValidationPlugin } from 'oop-validator/vue'
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
  scrollBehavior() {
    return { top: 0 }
  },
})

// SEO: update document title + meta description on every navigation
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title
    ? `${title} — vue-ui-select`
    : 'vue-ui-select Playground'

  const description = to.meta.description as string | undefined
  let tag = document.querySelector('meta[name="description"]')
  if (description) {
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', description)
  }
})

const app = createApp(App)
app.use(router)
app.use(UiSelectPlugin, { theme: 'tailwind' })
app.use(VueValidationPlugin)
app.mount('#app')

// Vercel Analytics — auto-tracks page views
inject()
