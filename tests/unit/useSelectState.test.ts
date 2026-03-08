// ============================================================
// useSelectState composable tests
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick, effectScope } from 'vue'
import { useSelectState } from '../../src/composables/useSelectState'

function makeProps(overrides: Record<string, any> = {}) {
  return {
    modelValue: ref(null),
    multiple: ref(false),
    disabled: ref(false),
    loading: ref(false),
    searchEnabled: ref(true),
    resetSearchInput: ref(true),
    closeOnSelect: ref(true),
    clearable: ref(true),
    appendToBody: ref(false),
    position: ref<any>('auto'),
    theme: ref<any>('tailwind'),
    placeholder: ref('Select...'),
    tagging: ref<any>(false),
    taggingLabel: ref<any>(false),
    taggingTokens: ref<string[]>([]),
    removeSelected: ref(false),
    lockChoice: ref(undefined),
    inputId: ref(undefined),
    autofocus: ref(false),
    limit: ref(undefined),
    ...overrides,
  }
}

describe('useSelectState', () => {
  it('generates a unique uid', () => {
    const s1 = useSelectState(makeProps())
    const s2 = useSelectState(makeProps())
    expect(s1.uid).not.toBe(s2.uid)
  })

  it('starts closed with empty search', () => {
    const state = useSelectState(makeProps())
    expect(state.isOpen.value).toBe(false)
    expect(state.search.value).toBe('')
    expect(state.activeIndex.value).toBe(-1)
  })

  it('open() opens', () => {
    const state = useSelectState(makeProps())
    state.open()
    expect(state.isOpen.value).toBe(true)
  })

  it('open() does nothing when disabled', () => {
    const state = useSelectState(makeProps({ disabled: ref(true) }))
    state.open()
    expect(state.isOpen.value).toBe(false)
  })

  it('close() closes and resets activeIndex', () => {
    const state = useSelectState(makeProps())
    state.open()
    state.activeIndex.value = 5
    state.close()
    expect(state.isOpen.value).toBe(false)
    expect(state.activeIndex.value).toBe(-1)
  })

  it('toggle() toggles', () => {
    const state = useSelectState(makeProps())
    state.toggle()
    expect(state.isOpen.value).toBe(true)
    state.toggle()
    expect(state.isOpen.value).toBe(false)
  })

  it('resets search on close when resetSearchInput is true', async () => {
    const scope = effectScope()
    await scope.run(async () => {
      const state = useSelectState(makeProps())
      state.open()
      await nextTick()
      state.search.value = 'hello'
      state.close()
      await nextTick()
      await nextTick()
      expect(state.search.value).toBe('')
    })
    scope.stop()
  })

  it('preserves search on close when resetSearchInput is false', async () => {
    const scope = effectScope()
    await scope.run(async () => {
      const state = useSelectState(makeProps({ resetSearchInput: ref(false) }))
      state.open()
      state.search.value = 'hello'
      state.close()
      await nextTick()
      expect(state.search.value).toBe('hello')
    })
    scope.stop()
  })
})
