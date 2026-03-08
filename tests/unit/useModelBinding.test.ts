// ============================================================
// useModelBinding composable tests
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useModelBinding } from '../../src/composables/useModelBinding'

function makeOpts(overrides: Record<string, any> = {}) {
  return {
    modelValue: ref(null),
    multiple: ref(false),
    trackBy: ref<any>(undefined),
    bindProperty: ref<any>(undefined),
    rawItems: ref<any[]>([]),
    emit: vi.fn(),
    ...overrides,
  }
}

describe('useModelBinding', () => {
  // --- Single mode ---
  describe('single mode', () => {
    it('initializes selected as null', () => {
      const { selected } = useModelBinding(makeOpts())
      expect(selected.value).toBeNull()
    })

    it('hydrates from modelValue', () => {
      const item = { id: 1, name: 'Alice' }
      const { selected } = useModelBinding(makeOpts({ modelValue: ref(item) }))
      expect(selected.value).toEqual(item)
    })

    it('selectItem sets selected and emits', () => {
      const emit = vi.fn()
      const { selected, selectItem } = useModelBinding(makeOpts({ emit }))
      const item = { id: 1, name: 'Alice' }

      selectItem(item)

      expect(selected.value).toEqual(item)
      expect(emit).toHaveBeenCalledWith('update:modelValue', item)
      expect(emit).toHaveBeenCalledWith('select', { item, model: item })
    })

    it('removeItem clears selected', () => {
      const emit = vi.fn()
      const item = { id: 1, name: 'Alice' }
      const { selected, selectItem, removeItem } = useModelBinding(
        makeOpts({ emit, modelValue: ref(item) })
      )

      removeItem(item)

      expect(selected.value).toBeNull()
      expect(emit).toHaveBeenCalledWith('update:modelValue', null)
      expect(emit).toHaveBeenCalledWith('remove', { item, model: null })
    })

    it('clearSelection sets null', () => {
      const emit = vi.fn()
      const { selected, selectItem, clearSelection } = useModelBinding(
        makeOpts({ emit })
      )
      selectItem({ id: 1 })
      clearSelection()
      expect(selected.value).toBeNull()
      expect(emit).toHaveBeenCalledWith('update:modelValue', null)
    })

    it('isItemSelected returns correct boolean', () => {
      const item = { id: 1, name: 'Alice' }
      const { isItemSelected, selectItem } = useModelBinding(makeOpts())
      expect(isItemSelected(item)).toBe(false)
      selectItem(item)
      expect(isItemSelected(item)).toBe(true)
    })
  })

  // --- Multiple mode ---
  describe('multiple mode', () => {
    it('initializes selected as empty array', () => {
      const { selected } = useModelBinding(makeOpts({ multiple: ref(true) }))
      expect(selected.value).toEqual([])
    })

    it('hydrates from array modelValue', () => {
      const items = [{ id: 1 }, { id: 2 }]
      const { selected } = useModelBinding(
        makeOpts({ multiple: ref(true), modelValue: ref(items) })
      )
      expect(selected.value).toHaveLength(2)
    })

    it('selectItem appends to array', () => {
      const emit = vi.fn()
      const { selected, selectItem } = useModelBinding(
        makeOpts({ multiple: ref(true), emit })
      )
      selectItem({ id: 1 })
      selectItem({ id: 2 })
      expect(selected.value).toHaveLength(2)
    })

    it('selectItem does not add duplicate (trackBy)', () => {
      const emit = vi.fn()
      const { selected, selectItem } = useModelBinding(
        makeOpts({ multiple: ref(true), trackBy: ref('id'), emit })
      )
      selectItem({ id: 1, name: 'A' })
      selectItem({ id: 1, name: 'A copy' })
      expect(selected.value).toHaveLength(1)
    })

    it('removeItem removes from array', () => {
      const emit = vi.fn()
      const { selected, selectItem, removeItem } = useModelBinding(
        makeOpts({ multiple: ref(true), trackBy: ref('id'), emit })
      )
      selectItem({ id: 1 })
      selectItem({ id: 2 })
      removeItem({ id: 1 })
      expect(selected.value).toHaveLength(1)
      expect(selected.value[0].id).toBe(2)
    })

    it('clearSelection empties array', () => {
      const emit = vi.fn()
      const { selected, selectItem, clearSelection } = useModelBinding(
        makeOpts({ multiple: ref(true), emit })
      )
      selectItem({ id: 1 })
      clearSelection()
      expect(selected.value).toEqual([])
    })
  })

  // --- bindProperty ---
  describe('bindProperty', () => {
    it('emits bound value in single mode', () => {
      const emit = vi.fn()
      const items = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
      const { selectItem } = useModelBinding(
        makeOpts({ bindProperty: ref('id'), rawItems: ref(items), emit })
      )
      selectItem(items[0])
      expect(emit).toHaveBeenCalledWith('update:modelValue', 1)
    })

    it('emits array of bound values in multi mode', () => {
      const emit = vi.fn()
      const items = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
      const { selectItem } = useModelBinding(
        makeOpts({
          multiple: ref(true),
          bindProperty: ref('id'),
          rawItems: ref(items),
          emit,
        })
      )
      selectItem(items[0])
      selectItem(items[1])
      // The last emit is 'select', but we check that update:modelValue was called with [1,2]
      expect(emit).toHaveBeenCalledWith('update:modelValue', [1, 2])
    })

    it('hydrates from primitive modelValue using rawItems', async () => {
      const items = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
      const { selected } = useModelBinding(
        makeOpts({
          modelValue: ref(1),
          bindProperty: ref('id'),
          rawItems: ref(items),
        })
      )
      expect(selected.value).toEqual({ id: 1, name: 'Alice' })
    })
  })

  // --- trackBy ---
  describe('trackBy', () => {
    it('uses string trackBy for identity', () => {
      const a = { id: 1, name: 'A' }
      const b = { id: 1, name: 'B' }
      const { itemsEqual } = useModelBinding(makeOpts({ trackBy: ref('id') }))
      expect(itemsEqual(a, b)).toBe(true)
    })

    it('uses function trackBy for identity', () => {
      const fn = (item: any) => item.code
      const a = { code: 'X', label: '1' }
      const b = { code: 'X', label: '2' }
      const { itemsEqual } = useModelBinding(makeOpts({ trackBy: ref(fn) }))
      expect(itemsEqual(a, b)).toBe(true)
    })
  })
})
