// ============================================================
// useSelectAccessibility composable tests
// ============================================================

import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { useSelectAccessibility } from '../../src/composables/useSelectAccessibility'

function makeOpts(overrides: Record<string, any> = {}) {
  return {
    uid: overrides.uid ?? 'ui-select-1',
    isOpen: ref(overrides.isOpen ?? false),
    activeIndex: ref(overrides.activeIndex ?? -1),
    multiple: ref(overrides.multiple ?? false),
    disabled: ref(overrides.disabled ?? false),
    selected: ref(overrides.selected ?? null),
    flatFilteredItems: computed(() => overrides.flatFilteredItems ?? []),
    placeholder: ref(overrides.placeholder ?? 'Select...'),
    inputId: ref(overrides.inputId ?? undefined),
    appendToBody: ref(overrides.appendToBody ?? false),
  }
}

describe('useSelectAccessibility', () => {
  describe('rootAriaAttrs', () => {
    it('has combobox role', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts())
      expect(rootAriaAttrs.value.role).toBe('combobox')
    })

    it('reports closed state', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts({ isOpen: false }))
      expect(rootAriaAttrs.value['aria-expanded']).toBe(false)
    })

    it('reports open state', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts({ isOpen: true }))
      expect(rootAriaAttrs.value['aria-expanded']).toBe(true)
    })

    it('has haspopup listbox', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts())
      expect(rootAriaAttrs.value['aria-haspopup']).toBe('listbox')
    })

    it('sets aria-owns when open AND teleported (listbox is not a DOM descendant)', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts({ uid: 'test-1', isOpen: true, appendToBody: true }))
      expect(rootAriaAttrs.value['aria-owns']).toBe('test-1-listbox')
    })

    it('omits aria-owns when open but listbox is a DOM descendant', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts({ isOpen: true, appendToBody: false }))
      expect(rootAriaAttrs.value['aria-owns']).toBeUndefined()
    })

    it('unsets aria-owns when closed', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts({ isOpen: false }))
      expect(rootAriaAttrs.value['aria-owns']).toBeUndefined()
    })

    it('sets aria-disabled when disabled', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts({ disabled: true }))
      expect(rootAriaAttrs.value['aria-disabled']).toBe(true)
    })

    it('unsets aria-disabled when not disabled', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts({ disabled: false }))
      expect(rootAriaAttrs.value['aria-disabled']).toBeFalsy()
    })

    it('sets aria-multiselectable when multiple', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts({ multiple: true }))
      expect(rootAriaAttrs.value['aria-multiselectable']).toBe(true)
    })

    it('unsets aria-multiselectable when single', () => {
      const { rootAriaAttrs } = useSelectAccessibility(makeOpts({ multiple: false }))
      expect(rootAriaAttrs.value['aria-multiselectable']).toBeFalsy()
    })
  })

  describe('inputAriaAttrs', () => {
    it('has searchbox role', () => {
      const { inputAriaAttrs } = useSelectAccessibility(makeOpts())
      expect(inputAriaAttrs.value.role).toBe('searchbox')
    })

    it('sets aria-autocomplete to list', () => {
      const { inputAriaAttrs } = useSelectAccessibility(makeOpts())
      expect(inputAriaAttrs.value['aria-autocomplete']).toBe('list')
    })

    it('sets aria-controls when open', () => {
      const { inputAriaAttrs } = useSelectAccessibility(makeOpts({ uid: 'test-2', isOpen: true }))
      expect(inputAriaAttrs.value['aria-controls']).toBe('test-2-listbox')
    })

    it('unsets aria-controls when closed', () => {
      const { inputAriaAttrs } = useSelectAccessibility(makeOpts({ isOpen: false }))
      expect(inputAriaAttrs.value['aria-controls']).toBeUndefined()
    })

    it('uses placeholder as aria-label', () => {
      const { inputAriaAttrs } = useSelectAccessibility(makeOpts({ placeholder: 'Pick a fruit' }))
      expect(inputAriaAttrs.value['aria-label']).toBe('Pick a fruit')
    })

    it('defaults aria-label to Search when placeholder is empty', () => {
      const { inputAriaAttrs } = useSelectAccessibility(makeOpts({ placeholder: '' }))
      expect(inputAriaAttrs.value['aria-label']).toBe('Search')
    })

    it('uses custom inputId when provided', () => {
      const { inputAriaAttrs } = useSelectAccessibility(makeOpts({ inputId: 'my-input' }))
      expect(inputAriaAttrs.value.id).toBe('my-input')
    })

    it('generates id from uid when no inputId', () => {
      const { inputAriaAttrs } = useSelectAccessibility(makeOpts({ uid: 'test-3' }))
      expect(inputAriaAttrs.value.id).toBe('test-3-input')
    })
  })

  describe('activeDescendantId', () => {
    it('returns undefined when no active item', () => {
      const { activeDescendantId } = useSelectAccessibility(makeOpts({ activeIndex: -1 }))
      expect(activeDescendantId.value).toBeUndefined()
    })

    it('returns option id when item is active', () => {
      const { activeDescendantId } = useSelectAccessibility(makeOpts({
        uid: 'sel-1',
        activeIndex: 2,
        flatFilteredItems: ['a', 'b', 'c'],
      }))
      expect(activeDescendantId.value).toBe('sel-1-option-2')
    })

    it('returns undefined when activeIndex exceeds items length', () => {
      const { activeDescendantId } = useSelectAccessibility(makeOpts({
        activeIndex: 5,
        flatFilteredItems: ['a', 'b'],
      }))
      expect(activeDescendantId.value).toBeUndefined()
    })
  })

  describe('inputAriaAttrs activedescendant tracking', () => {
    it('includes activedescendant in inputAriaAttrs', () => {
      const { inputAriaAttrs } = useSelectAccessibility(makeOpts({
        uid: 'sel-2',
        isOpen: true,
        activeIndex: 1,
        flatFilteredItems: ['a', 'b', 'c'],
      }))
      expect(inputAriaAttrs.value['aria-activedescendant']).toBe('sel-2-option-1')
    })
  })

  describe('listboxAriaAttrs', () => {
    it('has listbox role', () => {
      const { listboxAriaAttrs } = useSelectAccessibility(makeOpts())
      expect(listboxAriaAttrs.value.role).toBe('listbox')
    })

    it('has correct id', () => {
      const { listboxAriaAttrs } = useSelectAccessibility(makeOpts({ uid: 'sel-3' }))
      expect(listboxAriaAttrs.value.id).toBe('sel-3-listbox')
    })

    it('sets aria-multiselectable for multi mode', () => {
      const { listboxAriaAttrs } = useSelectAccessibility(makeOpts({ multiple: true }))
      expect(listboxAriaAttrs.value['aria-multiselectable']).toBe(true)
    })
  })

  describe('optionAriaAttrs', () => {
    it('returns correct attrs for a selected option', () => {
      const { optionAriaAttrs } = useSelectAccessibility(makeOpts({ uid: 'sel-4' }))
      const attrs = optionAriaAttrs(3, true, false)
      expect(attrs).toEqual({
        role: 'option',
        id: 'sel-4-option-3',
        'aria-selected': true,
        'aria-disabled': undefined,
      })
    })

    it('returns correct attrs for a disabled option', () => {
      const { optionAriaAttrs } = useSelectAccessibility(makeOpts({ uid: 'sel-5' }))
      const attrs = optionAriaAttrs(0, false, true)
      expect(attrs).toEqual({
        role: 'option',
        id: 'sel-5-option-0',
        'aria-selected': false,
        'aria-disabled': true,
      })
    })
  })

  describe('groupHeaderAriaAttrs', () => {
    it('returns presentation role and label', () => {
      const { groupHeaderAriaAttrs } = useSelectAccessibility(makeOpts())
      const attrs = groupHeaderAriaAttrs('US')
      expect(attrs).toEqual({
        role: 'presentation',
        'aria-label': 'US',
      })
    })
  })
})
