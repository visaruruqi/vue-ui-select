import { onMounted, onUnmounted } from 'vue'

/**
 * Dynamically inject external CSS stylesheets into <head> when the component
 * mounts and remove them when unmounted.  This keeps framework CSS (Bootstrap,
 * Select2, Selectize) scoped to the demo pages that actually need it — without
 * polluting the global playground or conflicting with Tailwind.
 */
export function useExternalCss(urls: string[]) {
  const links: HTMLLinkElement[] = []

  onMounted(() => {
    for (const url of urls) {
      // Skip if already present (e.g. navigated back quickly)
      if (document.querySelector(`link[href="${url}"]`)) continue

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      document.head.appendChild(link)
      links.push(link)
    }
  })

  onUnmounted(() => {
    for (const link of links) {
      link.remove()
    }
    links.length = 0
  })
}
