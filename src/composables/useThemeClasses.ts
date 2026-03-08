import { computed, type Ref } from 'vue'
import type { ThemeName } from '../types'

/**
 * Provides theme-specific data attributes and class helpers.
 * Components use semantic CSS classes + data attributes.
 * Each theme CSS file targets these hooks.
 */
export function useThemeClasses(theme: Ref<ThemeName>) {

  const themeDataAttr = computed(() => ({
    'data-ui-select-theme': theme.value,
  }))

  /** 
   * Generates data attributes for a specific component part.
   * These are used by theme CSS selectors.
   */
  function partAttrs(part: string, state?: Record<string, boolean | string | undefined>) {
    const attrs: Record<string, string | boolean | undefined> = {
      [`data-ui-select-${part}`]: '',
    }
    if (state) {
      for (const [key, val] of Object.entries(state)) {
        if (val === true) {
          attrs[`data-${key}`] = ''
        } else if (typeof val === 'string') {
          attrs[`data-${key}`] = val
        }
      }
    }
    return attrs
  }

  return {
    themeDataAttr,
    partAttrs,
  }
}
