// ============================================================
// useThemeClasses composable tests
// ============================================================

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useThemeClasses } from '../../src/composables/useThemeClasses'

describe('useThemeClasses', () => {
  describe('themeDataAttr', () => {
    it('returns data attribute with theme name', () => {
      const { themeDataAttr } = useThemeClasses(ref('tailwind'))
      expect(themeDataAttr.value).toEqual({ 'data-ui-select-theme': 'tailwind' })
    })

    it('reflects theme changes reactively', () => {
      const theme = ref<string>('tailwind')
      const { themeDataAttr } = useThemeClasses(theme)
      expect(themeDataAttr.value['data-ui-select-theme']).toBe('tailwind')

      theme.value = 'bootstrap'
      expect(themeDataAttr.value['data-ui-select-theme']).toBe('bootstrap')
    })

    it('supports all built-in themes', () => {
      for (const name of ['tailwind', 'bootstrap', 'select2', 'selectize']) {
        const { themeDataAttr } = useThemeClasses(ref(name))
        expect(themeDataAttr.value['data-ui-select-theme']).toBe(name)
      }
    })

    it('supports custom theme names', () => {
      const { themeDataAttr } = useThemeClasses(ref('my-custom-theme'))
      expect(themeDataAttr.value['data-ui-select-theme']).toBe('my-custom-theme')
    })
  })

  describe('partAttrs', () => {
    it('returns base data attribute for a part', () => {
      const { partAttrs } = useThemeClasses(ref('tailwind'))
      const attrs = partAttrs('dropdown')
      expect(attrs).toHaveProperty('data-ui-select-dropdown', '')
    })

    it('returns additional boolean state attributes', () => {
      const { partAttrs } = useThemeClasses(ref('tailwind'))
      const attrs = partAttrs('choice', { active: true, disabled: false })
      expect(attrs).toHaveProperty('data-ui-select-choice', '')
      expect(attrs).toHaveProperty('data-active', '')
      expect(attrs).not.toHaveProperty('data-disabled')
    })

    it('returns string state attributes', () => {
      const { partAttrs } = useThemeClasses(ref('tailwind'))
      const attrs = partAttrs('dropdown', { position: 'up' })
      expect(attrs['data-position']).toBe('up')
    })

    it('omits undefined state attributes', () => {
      const { partAttrs } = useThemeClasses(ref('tailwind'))
      const attrs = partAttrs('match', { selected: undefined })
      expect(attrs).not.toHaveProperty('data-selected')
    })

    it('works with no state parameter', () => {
      const { partAttrs } = useThemeClasses(ref('tailwind'))
      const attrs = partAttrs('spinner')
      expect(Object.keys(attrs)).toEqual(['data-ui-select-spinner'])
    })
  })
})
