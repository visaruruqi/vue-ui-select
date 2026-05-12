import type { Ref, ComputedRef } from 'vue'

export function useSelectTagging(opts: {
  tagging: Ref<boolean | ((search: string) => any)>
  taggingLabel: Ref<string | false>
  taggingTokens: Ref<string[]>
  search: Ref<string>
  multiple: Ref<boolean>
  limit: Ref<number | undefined>
  selected: Ref<any>
  flatFilteredItems: ComputedRef<any[]>
  isItemSelected: (item: any) => boolean
  itemsEqual: (a: any, b: any) => boolean
}) {
  const {
    tagging, taggingLabel, search,
    multiple, limit, selected,
    flatFilteredItems, isItemSelected, itemsEqual,
  } = opts

  /** Returns true if tagging is enabled */
  function isTaggingEnabled(): boolean {
    return !!tagging.value
  }

  /**
   * Create a tag object from the current search string.
   * If tagging is a function, calls it; otherwise returns the raw string.
   */
  function createTag(searchText: string): any {
    if (!searchText.trim()) return null

    // Check limit
    if (multiple.value && limit.value != null) {
      const arr = Array.isArray(selected.value) ? selected.value : []
      if (arr.length >= limit.value) return null
    }

    const tagFn = tagging.value
    if (typeof tagFn === 'function') {
      const result = tagFn(searchText)
      // Reject null/undefined or strings that are empty after trimming.
      // Object results are accepted as-is; consumers are responsible for shape.
      if (result == null) return null
      if (typeof result === 'string' && !result.trim()) return null
      return result
    }
    return searchText
  }

  /**
   * Whether the "create tag" row should be shown in the dropdown.
   * Only show when:
   * 1. Tagging is enabled
   * 2. There's search text
   * 3. The exact search text does not already exist in the items
   * 4. The search text is not already selected
   */
  function shouldShowTagRow(): boolean {
    if (!isTaggingEnabled()) return false
    const q = search.value.trim()
    if (!q) return false

    // Check limit
    if (multiple.value && limit.value != null) {
      const arr = Array.isArray(selected.value) ? selected.value : []
      if (arr.length >= limit.value) return false
    }

    // Check if exact match exists in filtered items
    const potentialTag = createTag(q)
    if (potentialTag == null) return false

    // Check if already in filtered items
    const existsInItems = flatFilteredItems.value.some((item) =>
      itemsEqual(item, potentialTag) ||
      (typeof item === 'string' && item.toLowerCase() === q.toLowerCase()) ||
      (typeof potentialTag === 'string' && typeof item === 'string' && item.toLowerCase() === potentialTag.toLowerCase())
    )
    if (existsInItems) return false

    // Check if already selected
    if (isItemSelected(potentialTag)) return false

    return true
  }

  /**
   * Get the display label for the tag row.
   */
  function getTagRowLabel(): string {
    const label = taggingLabel.value
    if (label === false) return search.value.trim()
    return `${search.value.trim()} ${label}`
  }

  return {
    isTaggingEnabled,
    createTag,
    shouldShowTagRow,
    getTagRowLabel,
  }
}
