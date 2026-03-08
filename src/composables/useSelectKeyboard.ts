import { type Ref, type ComputedRef } from 'vue'

export function useSelectKeyboard(opts: {
  isOpen: Ref<boolean>
  search: Ref<string>
  activeIndex: Ref<number>
  flatFilteredItems: ComputedRef<any[]>
  multiple: Ref<boolean>
  disabled: Ref<boolean>
  selected: Ref<any>
  tagging: Ref<boolean | ((search: string) => any)>
  taggingTokens: Ref<string[]>
  disableChoice: Ref<((item: any) => boolean) | undefined>

  open: () => void
  close: () => void
  selectItem: (item: any) => void
  removeItem: (item: any) => void
  isItemSelected: (item: any) => boolean
  createTag: (search: string) => any
  focus: () => void

  dropdownRef: Ref<HTMLElement | null>
  inputRef: Ref<HTMLInputElement | null>

  emit: (event: string, ...args: any[]) => void
}) {
  const {
    isOpen, search, activeIndex, flatFilteredItems,
    multiple, disabled, selected, tagging, taggingTokens,
    disableChoice,
    open, close, selectItem, removeItem, isItemSelected,
    createTag, focus,
    dropdownRef, emit,
  } = opts

  function isChoiceDisabled(item: any): boolean {
    if (disableChoice.value) return disableChoice.value(item)
    return false
  }

  function findNextEnabled(startIdx: number, direction: 1 | -1): number {
    const items = flatFilteredItems.value
    if (items.length === 0) return -1
    let idx = startIdx
    const max = items.length
    for (let i = 0; i < max; i++) {
      idx += direction
      if (idx < 0) idx = max - 1
      if (idx >= max) idx = 0
      const item = items[idx]
      if (!isChoiceDisabled(item) && !isItemSelected(item)) return idx
      // If removeSelected is false, items may be in list but disabled-looking
      if (!isChoiceDisabled(item)) return idx
    }
    return -1
  }

  function scrollActiveIntoView() {
    if (!dropdownRef.value || activeIndex.value < 0) return
    const el = dropdownRef.value.querySelector(
      `[data-ui-select-choice-index="${activeIndex.value}"]`
    ) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled.value) return

    const items = flatFilteredItems.value

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        if (!isOpen.value) {
          open()
          activeIndex.value = findNextEnabled(-1, 1)
        } else {
          activeIndex.value = findNextEnabled(activeIndex.value, 1)
        }
        scrollActiveIntoView()
        emitHighlight()
        break
      }

      case 'ArrowUp': {
        e.preventDefault()
        if (!isOpen.value) {
          open()
          activeIndex.value = findNextEnabled(items.length, -1)
        } else {
          activeIndex.value = findNextEnabled(activeIndex.value, -1)
        }
        scrollActiveIntoView()
        emitHighlight()
        break
      }

      case 'Enter': {
        e.preventDefault()
        if (isOpen.value && activeIndex.value >= 0 && activeIndex.value < items.length) {
          const item = items[activeIndex.value]
          if (!isChoiceDisabled(item)) {
            selectItem(item)
          }
        } else if (isOpen.value && tagging.value && search.value.trim()) {
          const tag = createTag(search.value.trim())
          if (tag != null) {
            selectItem(tag)
          }
        } else if (!isOpen.value) {
          open()
        }
        break
      }

      case 'Escape': {
        e.preventDefault()
        if (isOpen.value) {
          close()
          focus()
        }
        break
      }

      case 'Tab': {
        // Close without preventing default (to allow natural tab flow)
        if (isOpen.value) {
          close()
        }
        break
      }

      case 'Backspace': {
        if (multiple.value && search.value === '') {
          const arr = Array.isArray(selected.value) ? selected.value : []
          if (arr.length > 0) {
            removeItem(arr[arr.length - 1])
          }
        }
        break
      }

      case 'Home': {
        if (isOpen.value && items.length > 0) {
          e.preventDefault()
          activeIndex.value = findNextEnabled(-1, 1)
          scrollActiveIntoView()
          emitHighlight()
        }
        break
      }

      case 'End': {
        if (isOpen.value && items.length > 0) {
          e.preventDefault()
          activeIndex.value = findNextEnabled(items.length, -1)
          scrollActiveIntoView()
          emitHighlight()
        }
        break
      }

      default: {
        // Tagging token check
        if (tagging.value && taggingTokens.value.includes(e.key)) {
          e.preventDefault()
          if (search.value.trim()) {
            const tag = createTag(search.value.trim())
            if (tag != null) {
              selectItem(tag)
            }
          }
        }
        break
      }
    }
  }

  function emitHighlight() {
    const items = flatFilteredItems.value
    if (activeIndex.value >= 0 && activeIndex.value < items.length) {
      emit('highlight', items[activeIndex.value])
    }
  }

  /**
   * Handle paste events — split pasted text by tagging tokens and create
   * individual tags for each non-empty segment.
   */
  function handlePaste(e: ClipboardEvent) {
    if (!tagging.value || taggingTokens.value.length === 0) return

    const text = e.clipboardData?.getData('text')
    if (!text) return

    // Build a regex from token characters to split pasted text
    const escaped = taggingTokens.value.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const re = new RegExp(`[${escaped.join('')}]`)
    const parts = text.split(re).map((s) => s.trim()).filter(Boolean)

    if (parts.length <= 1 && !re.test(text)) {
      // No tokens found in pasted text — let the browser handle normally
      return
    }

    e.preventDefault()

    // Also tag whatever was already typed in the search box
    const existing = search.value.trim()
    if (existing) {
      const tag = createTag(existing)
      if (tag != null) selectItem(tag)
    }

    for (const part of parts) {
      const tag = createTag(part)
      if (tag != null) selectItem(tag)
    }
  }

  /**
   * Called after `search` changes (via `@input` or v-model watcher).
   * Handles token characters that slip past the keydown handler — e.g. from
   * mobile soft-keyboards, IME, or browser auto-fill.
   */
  function handleSearchInput() {
    if (!tagging.value || taggingTokens.value.length === 0) return

    const val = search.value
    if (!val) return

    // Check if the current search text contains any token character
    const hasToken = taggingTokens.value.some((t) => val.includes(t))
    if (!hasToken) return

    // Split by any token
    const escaped = taggingTokens.value.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const re = new RegExp(`[${escaped.join('')}]`)
    const parts = val.split(re).map((s) => s.trim()).filter(Boolean)

    // Clear search first to avoid re-triggering
    search.value = ''

    for (const part of parts) {
      const tag = createTag(part)
      if (tag != null) selectItem(tag)
    }
  }

  return {
    handleKeyDown,
    handlePaste,
    handleSearchInput,
    scrollActiveIntoView,
  }
}
