// ============================================================
// useSelectFiltering composable tests
// ============================================================

import { describe, it, expect } from 'vitest'
import { ref, shallowRef, nextTick } from 'vue'
import { useSelectFiltering } from '../../src/composables/useSelectFiltering'
import type { ChoicesConfig } from '../../src/types'

function makeChoicesConfig(overrides: Partial<Record<keyof ChoicesConfig, any>> = {}): ChoicesConfig {
  return {
    items: ref(overrides.items ?? []),
    trackBy: ref(overrides.trackBy),
    bindProperty: ref(overrides.bindProperty),
    searchFields: ref(overrides.searchFields ?? []),
    filterFn: ref(overrides.filterFn),
    groupBy: ref(overrides.groupBy),
    groupFilter: ref(overrides.groupFilter),
    disableChoice: ref(overrides.disableChoice),
    sortFn: ref(overrides.sortFn),
    minimumInputLength: ref(overrides.minimumInputLength ?? 0),
  }
}

function makeOpts(configOverrides: any = {}, opts: any = {}) {
  return {
    search: ref(opts.search ?? ''),
    choicesConfig: shallowRef(makeChoicesConfig(configOverrides)),
    isItemSelected: opts.isItemSelected ?? (() => false),
    removeSelected: ref(opts.removeSelected ?? false),
  }
}

const people = [
  { id: 1, name: 'Alice', country: 'US', age: 25 },
  { id: 2, name: 'Bob', country: 'UK', age: 30 },
  { id: 3, name: 'Charlie', country: 'US', age: 35 },
  { id: 4, name: 'Diana', country: 'UK', age: 28 },
]

describe('useSelectFiltering', () => {
  describe('rawItems', () => {
    it('returns array items as-is', () => {
      const { rawItems } = useSelectFiltering(makeOpts({ items: people }))
      expect(rawItems.value).toHaveLength(4)
    })

    it('normalizes object source into { key, value } pairs', () => {
      const { rawItems } = useSelectFiltering(
        makeOpts({ items: { r: 'Red', g: 'Green' } })
      )
      expect(rawItems.value).toEqual([
        { key: 'r', value: 'Red' },
        { key: 'g', value: 'Green' },
      ])
    })

    it('returns empty array if no config', () => {
      const { rawItems } = useSelectFiltering({
        search: ref(''),
        choicesConfig: shallowRef(null),
        isItemSelected: () => false,
        removeSelected: ref(false),
      })
      expect(rawItems.value).toEqual([])
    })
  })

  describe('filteredItems', () => {
    it('returns all items when search is empty', () => {
      const { filteredItems } = useSelectFiltering(
        makeOpts({ items: people, searchFields: ['name'] })
      )
      expect(filteredItems.value).toHaveLength(4)
    })

    it('filters by search fields', () => {
      const o = makeOpts({ items: people, searchFields: ['name'] })
      o.search.value = 'ali'
      const { filteredItems } = useSelectFiltering(o)
      expect(filteredItems.value).toHaveLength(1)
      expect(filteredItems.value[0].name).toBe('Alice')
    })

    it('uses custom filterFn when provided', () => {
      const filterFn = (item: any, search: string) =>
        item.age > parseInt(search)
      const o = makeOpts({ items: people, filterFn })
      o.search.value = '29'
      const { filteredItems } = useSelectFiltering(o)
      expect(filteredItems.value).toHaveLength(2) // Bob(30), Charlie(35)
    })

    it('applies sortFn', () => {
      const sortFn = (a: any, b: any) => b.age - a.age
      const { filteredItems } = useSelectFiltering(
        makeOpts({ items: people, sortFn })
      )
      expect(filteredItems.value[0].name).toBe('Charlie')
      expect(filteredItems.value[3].name).toBe('Alice')
    })

    it('removes selected items when removeSelected is true', () => {
      const selectedIds = new Set([1]) // Alice
      const { filteredItems } = useSelectFiltering(
        makeOpts(
          { items: people },
          {
            removeSelected: true,
            isItemSelected: (item: any) => selectedIds.has(item.id),
          }
        )
      )
      expect(filteredItems.value).toHaveLength(3)
      expect(filteredItems.value.find((i: any) => i.name === 'Alice')).toBeUndefined()
    })

    it('returns empty array when search is below minimumInputLength', () => {
      const o = makeOpts({ items: people, minimumInputLength: 3, searchFields: ['name'] })
      o.search.value = 'Al'
      const { filteredItems } = useSelectFiltering(o)
      expect(filteredItems.value).toEqual([])
    })

    it('filters string arrays by substring match', () => {
      const colors = ['red', 'green', 'blue', 'grey']
      const o = makeOpts({ items: colors })
      o.search.value = 'gre'
      const { filteredItems } = useSelectFiltering(o)
      expect(filteredItems.value).toEqual(['green', 'grey'])
    })
  })

  describe('groupedItems', () => {
    it('returns single group with no label when groupBy not set', () => {
      const { groupedItems } = useSelectFiltering(makeOpts({ items: people }))
      expect(groupedItems.value).toHaveLength(1)
      expect(groupedItems.value[0].label).toBeUndefined()
      expect(groupedItems.value[0].items).toHaveLength(4)
    })

    it('groups by string property', () => {
      const { groupedItems } = useSelectFiltering(
        makeOpts({ items: people, groupBy: 'country' })
      )
      expect(groupedItems.value.length).toBeGreaterThanOrEqual(2)
      const labels = groupedItems.value.map((g) => g.label)
      expect(labels).toContain('US')
      expect(labels).toContain('UK')
    })

    it('groups by function', () => {
      const groupBy = (item: any) => (item.age < 30 ? 'Young' : 'Senior')
      const { groupedItems } = useSelectFiltering(
        makeOpts({ items: people, groupBy })
      )
      const labels = groupedItems.value.map((g) => g.label)
      expect(labels).toContain('Young')
      expect(labels).toContain('Senior')
    })

    it('applies array groupFilter', () => {
      const { groupedItems } = useSelectFiltering(
        makeOpts({ items: people, groupBy: 'country', groupFilter: ['UK'] })
      )
      expect(groupedItems.value).toHaveLength(1)
      expect(groupedItems.value[0].label).toBe('UK')
    })

    it('applies function groupFilter', () => {
      const groupFilter = (groups: string[]) => groups.sort().reverse()
      const { groupedItems } = useSelectFiltering(
        makeOpts({ items: people, groupBy: 'country', groupFilter })
      )
      const labels = groupedItems.value.map((g) => g.label)
      // Sorted reverse: US, UK
      expect(labels[0]).toBe('US')
      expect(labels[1]).toBe('UK')
    })
  })

  describe('flatFilteredItems', () => {
    it('is a flat array of all visible items across groups', () => {
      const { flatFilteredItems } = useSelectFiltering(
        makeOpts({ items: people, groupBy: 'country' })
      )
      expect(flatFilteredItems.value).toHaveLength(4)
    })
  })
})
