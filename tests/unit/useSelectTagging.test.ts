// ============================================================
// useSelectTagging composable tests
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import { ref, computed } from 'vue'
import { useSelectTagging } from '../../src/composables/useSelectTagging'

function makeOpts(overrides: Record<string, any> = {}) {
  return {
    tagging: ref<boolean | ((s: string) => any)>(overrides.tagging ?? true),
    taggingLabel: ref<string | false>(overrides.taggingLabel ?? '(new)'),
    taggingTokens: ref<string[]>(overrides.taggingTokens ?? [',']),
    search: ref<string>(overrides.search ?? ''),
    multiple: ref<boolean>(overrides.multiple ?? false),
    limit: ref<number | undefined>(overrides.limit),
    selected: ref<any>(overrides.selected ?? null),
    flatFilteredItems: computed(() => overrides.flatFilteredItems ?? []),
    isItemSelected: overrides.isItemSelected ?? (() => false),
    itemsEqual: overrides.itemsEqual ?? ((a: any, b: any) => a === b),
  }
}

describe('useSelectTagging', () => {
  describe('isTaggingEnabled', () => {
    it('returns true when tagging is true', () => {
      const { isTaggingEnabled } = useSelectTagging(makeOpts({ tagging: true }))
      expect(isTaggingEnabled()).toBe(true)
    })

    it('returns true when tagging is a function', () => {
      const { isTaggingEnabled } = useSelectTagging(makeOpts({ tagging: (s: string) => ({ name: s }) }))
      expect(isTaggingEnabled()).toBe(true)
    })

    it('returns false when tagging is false', () => {
      const { isTaggingEnabled } = useSelectTagging(makeOpts({ tagging: false }))
      expect(isTaggingEnabled()).toBe(false)
    })
  })

  describe('createTag', () => {
    it('returns the raw string when tagging is boolean true', () => {
      const { createTag } = useSelectTagging(makeOpts({ tagging: true }))
      expect(createTag('hello')).toBe('hello')
    })

    it('calls tagging function when provided', () => {
      const tagFn = (s: string) => ({ id: 0, name: s })
      const { createTag } = useSelectTagging(makeOpts({ tagging: tagFn }))
      expect(createTag('test')).toEqual({ id: 0, name: 'test' })
    })

    it('returns null for empty/whitespace strings', () => {
      const { createTag } = useSelectTagging(makeOpts({ tagging: true }))
      expect(createTag('')).toBeNull()
      expect(createTag('   ')).toBeNull()
    })

    it('returns null when multi-select limit is reached', () => {
      const { createTag } = useSelectTagging(makeOpts({
        tagging: true,
        multiple: true,
        limit: 2,
        selected: [{ id: 1 }, { id: 2 }],
      }))
      expect(createTag('new-tag')).toBeNull()
    })

    it('returns tag when multi-select limit is not reached', () => {
      const { createTag } = useSelectTagging(makeOpts({
        tagging: true,
        multiple: true,
        limit: 3,
        selected: [{ id: 1 }],
      }))
      expect(createTag('new-tag')).toBe('new-tag')
    })

    it('returns tag when no limit is set in multi mode', () => {
      const { createTag } = useSelectTagging(makeOpts({
        tagging: true,
        multiple: true,
        selected: [1, 2, 3],
      }))
      expect(createTag('fourth')).toBe('fourth')
    })
  })

  describe('shouldShowTagRow', () => {
    it('returns false when tagging is disabled', () => {
      const opts = makeOpts({ tagging: false, search: 'hello' })
      const { shouldShowTagRow } = useSelectTagging(opts)
      expect(shouldShowTagRow()).toBe(false)
    })

    it('returns false when search is empty', () => {
      const opts = makeOpts({ tagging: true, search: '' })
      const { shouldShowTagRow } = useSelectTagging(opts)
      expect(shouldShowTagRow()).toBe(false)
    })

    it('returns false when search is only whitespace', () => {
      const opts = makeOpts({ tagging: true, search: '   ' })
      const { shouldShowTagRow } = useSelectTagging(opts)
      expect(shouldShowTagRow()).toBe(false)
    })

    it('returns true when search has text and no match in items', () => {
      const opts = makeOpts({ tagging: true, search: 'newval', flatFilteredItems: ['other'] })
      const { shouldShowTagRow } = useSelectTagging(opts)
      expect(shouldShowTagRow()).toBe(true)
    })

    it('returns false when exact match exists in filtered items (string)', () => {
      const opts = makeOpts({
        tagging: true,
        search: 'hello',
        flatFilteredItems: ['hello', 'world'],
        itemsEqual: (a: any, b: any) => a === b,
      })
      const { shouldShowTagRow } = useSelectTagging(opts)
      expect(shouldShowTagRow()).toBe(false)
    })

    it('returns false when case-insensitive match exists in filtered items', () => {
      const opts = makeOpts({
        tagging: true,
        search: 'Hello',
        flatFilteredItems: ['hello', 'world'],
      })
      const { shouldShowTagRow } = useSelectTagging(opts)
      expect(shouldShowTagRow()).toBe(false)
    })

    it('returns false when item is already selected', () => {
      const opts = makeOpts({
        tagging: true,
        search: 'tag1',
        flatFilteredItems: [],
        isItemSelected: (item: any) => item === 'tag1',
      })
      const { shouldShowTagRow } = useSelectTagging(opts)
      expect(shouldShowTagRow()).toBe(false)
    })

    it('returns false when multi-select limit is reached', () => {
      const opts = makeOpts({
        tagging: true,
        search: 'new',
        multiple: true,
        limit: 2,
        selected: ['a', 'b'],
        flatFilteredItems: [],
      })
      const { shouldShowTagRow } = useSelectTagging(opts)
      expect(shouldShowTagRow()).toBe(false)
    })

    it('returns true when multi-select limit is not reached', () => {
      const opts = makeOpts({
        tagging: true,
        search: 'new',
        multiple: true,
        limit: 3,
        selected: ['a'],
        flatFilteredItems: [],
      })
      const { shouldShowTagRow } = useSelectTagging(opts)
      expect(shouldShowTagRow()).toBe(true)
    })
  })

  describe('getTagRowLabel', () => {
    it('appends taggingLabel to search text', () => {
      const opts = makeOpts({ tagging: true, search: 'hello', taggingLabel: '(new)' })
      const { getTagRowLabel } = useSelectTagging(opts)
      expect(getTagRowLabel()).toBe('hello (new)')
    })

    it('returns only search text when taggingLabel is false', () => {
      const opts = makeOpts({ tagging: true, search: 'hello', taggingLabel: false })
      const { getTagRowLabel } = useSelectTagging(opts)
      expect(getTagRowLabel()).toBe('hello')
    })

    it('uses custom taggingLabel string', () => {
      const opts = makeOpts({ tagging: true, search: 'item', taggingLabel: '[create]' })
      const { getTagRowLabel } = useSelectTagging(opts)
      expect(getTagRowLabel()).toBe('item [create]')
    })
  })
})
