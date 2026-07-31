import { computed, type Ref, type ComputedRef } from 'vue'
import { normalizeObjectSource, getNestedValue } from '../utils/objectSource'
import type { GroupedItems, ChoicesConfig } from '../types'

export function useSelectFiltering(opts: {
  search: Ref<string>
  choicesConfig: Ref<ChoicesConfig | null>
  isItemSelected: (item: any) => boolean
  removeSelected: Ref<boolean>
}) {
  const { search, choicesConfig, isItemSelected, removeSelected } = opts

  // Raw items normalized to an array
  const rawItems = computed<any[]>(() => {
    const cfg = choicesConfig.value
    if (!cfg) return []
    const items = cfg.items.value
    // Plain objects (Records / dictionaries) are auto-detected and normalised;
    // arrays pass through as-is.
    if (items && typeof items === 'object' && !Array.isArray(items)) {
      return normalizeObjectSource(items as Record<string, any>)
    }
    return Array.isArray(items) ? items : []
  })

  // Filtered items (after search, before grouping)
  const filteredItems = computed<any[]>(() => {
    const cfg = choicesConfig.value
    if (!cfg) return rawItems.value

    let result = [...rawItems.value]

    // Minimum input length
    if (cfg.minimumInputLength.value > 0 && search.value.length < cfg.minimumInputLength.value) {
      return []
    }

    // Apply search filter
    const q = search.value.trim().toLowerCase()
    if (q) {
      if (cfg.filterFn.value) {
        result = result.filter((item) => cfg.filterFn.value!(item, search.value))
      } else {
        const fields = cfg.searchFields.value
        result = result.filter((item) => matchesSearch(item, q, fields))
      }
    }

    // Apply sort
    if (cfg.sortFn.value) {
      result.sort(cfg.sortFn.value)
    }

    // Remove selected items from dropdown if removeSelected is true
    if (removeSelected.value) {
      result = result.filter((item) => !isItemSelected(item))
    }

    return result
  })

  // Grouped items
  const groupedItems = computed<GroupedItems[]>(() => {
    const cfg = choicesConfig.value
    if (!cfg || !cfg.groupBy.value) {
      return [{ label: undefined, items: filteredItems.value }]
    }

    const groupBy = cfg.groupBy.value
    const map = new Map<string | undefined, any[]>()
    const order: (string | undefined)[] = []

    for (const item of filteredItems.value) {
      const groupLabel = typeof groupBy === 'function'
        ? groupBy(item)
        : getNestedValue(item, groupBy)
      if (!map.has(groupLabel)) {
        map.set(groupLabel, [])
        order.push(groupLabel)
      }
      map.get(groupLabel)!.push(item)
    }

    let groups = order.map((label) => ({
      label,
      items: map.get(label)!,
    }))

    // Apply group filter. Both forms keep the ungrouped (undefined-label) group,
    // sorted last — the array form used to silently drop items that lacked the
    // groupBy property, while the function form kept them.
    const gf = cfg.groupFilter.value
    if (gf) {
      if (Array.isArray(gf)) {
        groups = groups.filter((g) => g.label === undefined || gf.includes(g.label))
        groups.sort((a, b) => {
          if (a.label === undefined) return 1
          if (b.label === undefined) return -1
          return gf.indexOf(a.label) - gf.indexOf(b.label)
        })
      } else if (typeof gf === 'function') {
        const labels = groups.map((g) => g.label).filter((l): l is string => l !== undefined)
        const filtered = gf(labels)
        groups = groups.filter((g) => g.label === undefined || filtered.includes(g.label))
        groups.sort((a, b) => {
          if (a.label === undefined) return 1
          if (b.label === undefined) return -1
          return filtered.indexOf(a.label) - filtered.indexOf(b.label)
        })
      }
    }

    return groups
  })

  // Flat list of all visible items (for keyboard navigation indexing)
  const flatFilteredItems = computed<any[]>(() => {
    const result: any[] = []
    for (const group of groupedItems.value) {
      result.push(...group.items)
    }
    return result
  })

  return {
    rawItems,
    filteredItems,
    groupedItems,
    flatFilteredItems,
  }
}

function isObjectSourceItem(item: any): item is { key: string; value: any } {
  return item != null && typeof item === 'object' && 'key' in item && 'value' in item && Object.keys(item).length === 2
}

function matchesSearch(item: any, query: string, fields: string[]): boolean {
  // Unwrap object-source items so search-fields target the value, not the wrapper
  const target = isObjectSourceItem(item) ? item.value : item

  if (typeof target === 'string') {
    return target.toLowerCase().includes(query)
  }
  if (typeof target === 'number') {
    return String(target).includes(query)
  }
  if (typeof target !== 'object' || target === null) {
    return false
  }

  if (fields.length > 0) {
    return fields.some((field) => {
      const val = getNestedValue(target, field)
      return val != null && String(val).toLowerCase().includes(query)
    })
  }

  // Object items with no declared search-fields pass through: the component
  // only filters what it was told to filter. The old fallback matched against
  // EVERY field, which silently re-filtered remote results — an API answering
  // a code or fuzzy query had its rows dropped unless the consumer knew to
  // pass filter-fn="() => true". A remote list now works with no config, and
  // a local object list that stops narrowing is a loud dev-time signal to add
  // search-fields. Primitive items keep matching by value (see above).
  return true
}
