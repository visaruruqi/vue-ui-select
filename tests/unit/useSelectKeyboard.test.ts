// ============================================================
// useSelectKeyboard composable tests
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { useSelectKeyboard } from '../../src/composables/useSelectKeyboard'

function makeOpts(overrides: Record<string, any> = {}) {
  const items = overrides.flatFilteredItems ?? ['Alice', 'Bob', 'Charlie']
  return {
    isOpen: ref(overrides.isOpen ?? false),
    search: ref(overrides.search ?? ''),
    activeIndex: ref(overrides.activeIndex ?? -1),
    flatFilteredItems: computed(() => items),
    multiple: ref(overrides.multiple ?? false),
    disabled: ref(overrides.disabled ?? false),
    selected: ref(overrides.selected ?? null),
    tagging: ref(overrides.tagging ?? false),
    taggingTokens: ref(overrides.taggingTokens ?? [',']),
    disableChoice: ref(overrides.disableChoice ?? undefined),
    open: overrides.open ?? vi.fn(),
    close: overrides.close ?? vi.fn(),
    selectItem: overrides.selectItem ?? vi.fn(),
    removeItem: overrides.removeItem ?? vi.fn(),
    isItemSelected: overrides.isItemSelected ?? (() => false),
    createTag: overrides.createTag ?? ((s: string) => s),
    focus: overrides.focus ?? vi.fn(),
    dropdownRef: ref(overrides.dropdownRef ?? null),
    inputRef: ref(overrides.inputRef ?? null),
    emit: overrides.emit ?? vi.fn(),
  }
}

function keyEvent(key: string, extra: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...extra,
  } as unknown as KeyboardEvent
}

describe('useSelectKeyboard', () => {
  describe('ArrowDown', () => {
    it('opens dropdown when closed', () => {
      const open = vi.fn()
      const opts = makeOpts({ open, isOpen: false })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowDown'))

      expect(open).toHaveBeenCalled()
    })

    it('moves activeIndex forward when open', () => {
      const opts = makeOpts({ isOpen: true, activeIndex: 0 })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowDown'))

      expect(opts.activeIndex.value).toBe(1)
    })

    it('wraps around from last to first', () => {
      const opts = makeOpts({ isOpen: true, activeIndex: 2 })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowDown'))

      expect(opts.activeIndex.value).toBe(0)
    })

    it('skips disabled items', () => {
      const disableChoice = (item: any) => item === 'Bob'
      const opts = makeOpts({
        isOpen: true,
        activeIndex: 0,
        disableChoice,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowDown'))

      expect(opts.activeIndex.value).toBe(2) // skips Bob (index 1)
    })

    it('prevents default on the event', () => {
      const opts = makeOpts({ isOpen: true })
      const { handleKeyDown } = useSelectKeyboard(opts)
      const e = keyEvent('ArrowDown')

      handleKeyDown(e)

      expect(e.preventDefault).toHaveBeenCalled()
    })

    it('emits highlight event', () => {
      const emit = vi.fn()
      const opts = makeOpts({ isOpen: true, activeIndex: -1, emit })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowDown'))

      expect(emit).toHaveBeenCalledWith('highlight', 'Alice')
    })
  })

  describe('ArrowUp', () => {
    it('opens dropdown when closed', () => {
      const open = vi.fn()
      const opts = makeOpts({ open, isOpen: false })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowUp'))

      expect(open).toHaveBeenCalled()
    })

    it('moves activeIndex backward when open', () => {
      const opts = makeOpts({ isOpen: true, activeIndex: 2 })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowUp'))

      expect(opts.activeIndex.value).toBe(1)
    })

    it('wraps around from first to last', () => {
      const opts = makeOpts({ isOpen: true, activeIndex: 0 })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowUp'))

      expect(opts.activeIndex.value).toBe(2)
    })

    it('prevents default on the event', () => {
      const opts = makeOpts({ isOpen: true })
      const { handleKeyDown } = useSelectKeyboard(opts)
      const e = keyEvent('ArrowUp')

      handleKeyDown(e)

      expect(e.preventDefault).toHaveBeenCalled()
    })
  })

  describe('Enter', () => {
    it('selects the active item when dropdown is open', () => {
      const selectItem = vi.fn()
      const opts = makeOpts({ isOpen: true, activeIndex: 1, selectItem })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Enter'))

      expect(selectItem).toHaveBeenCalledWith('Bob')
    })

    it('does not select a disabled active item', () => {
      const selectItem = vi.fn()
      const opts = makeOpts({
        isOpen: true,
        activeIndex: 1,
        selectItem,
        disableChoice: (item: any) => item === 'Bob',
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Enter'))

      expect(selectItem).not.toHaveBeenCalled()
    })

    it('creates a tag when tagging is enabled and no item is active', () => {
      const selectItem = vi.fn()
      const createTag = vi.fn((s: string) => s)
      const opts = makeOpts({
        isOpen: true,
        activeIndex: -1,
        search: 'newtag',
        tagging: true,
        selectItem,
        createTag,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Enter'))

      expect(createTag).toHaveBeenCalledWith('newtag')
      expect(selectItem).toHaveBeenCalledWith('newtag')
    })

    it('does not create tag when search is empty', () => {
      const selectItem = vi.fn()
      const createTag = vi.fn()
      const opts = makeOpts({
        isOpen: true,
        activeIndex: -1,
        search: '',
        tagging: true,
        selectItem,
        createTag,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Enter'))

      expect(createTag).not.toHaveBeenCalled()
      expect(selectItem).not.toHaveBeenCalled()
    })

    it('opens dropdown when closed', () => {
      const open = vi.fn()
      const opts = makeOpts({ isOpen: false, open })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Enter'))

      expect(open).toHaveBeenCalled()
    })

    it('prevents default on the event', () => {
      const opts = makeOpts({ isOpen: true, activeIndex: 0 })
      const { handleKeyDown } = useSelectKeyboard(opts)
      const e = keyEvent('Enter')

      handleKeyDown(e)

      expect(e.preventDefault).toHaveBeenCalled()
    })
  })

  describe('Escape', () => {
    it('closes dropdown and refocuses', () => {
      const close = vi.fn()
      const focus = vi.fn()
      const opts = makeOpts({ isOpen: true, close, focus })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Escape'))

      expect(close).toHaveBeenCalled()
      expect(focus).toHaveBeenCalled()
    })

    it('does nothing when dropdown is already closed', () => {
      const close = vi.fn()
      const focus = vi.fn()
      const opts = makeOpts({ isOpen: false, close, focus })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Escape'))

      expect(close).not.toHaveBeenCalled()
      expect(focus).not.toHaveBeenCalled()
    })
  })

  describe('Tab', () => {
    it('closes dropdown without preventing default', () => {
      const close = vi.fn()
      const opts = makeOpts({ isOpen: true, close })
      const { handleKeyDown } = useSelectKeyboard(opts)
      const e = keyEvent('Tab')

      handleKeyDown(e)

      expect(close).toHaveBeenCalled()
      expect(e.preventDefault).not.toHaveBeenCalled()
    })

    it('does nothing when already closed', () => {
      const close = vi.fn()
      const opts = makeOpts({ isOpen: false, close })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Tab'))

      expect(close).not.toHaveBeenCalled()
    })
  })

  describe('Backspace', () => {
    it('removes last selected item in multi mode when search is empty', () => {
      const removeItem = vi.fn()
      const opts = makeOpts({
        multiple: true,
        search: '',
        selected: ['tag1', 'tag2'],
        removeItem,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Backspace'))

      expect(removeItem).toHaveBeenCalledWith('tag2')
    })

    it('does nothing in multi mode when search has text', () => {
      const removeItem = vi.fn()
      const opts = makeOpts({
        multiple: true,
        search: 'abc',
        selected: ['tag1'],
        removeItem,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Backspace'))

      expect(removeItem).not.toHaveBeenCalled()
    })

    it('does nothing in single mode', () => {
      const removeItem = vi.fn()
      const opts = makeOpts({
        multiple: false,
        search: '',
        selected: 'item',
        removeItem,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Backspace'))

      expect(removeItem).not.toHaveBeenCalled()
    })

    it('does nothing when selected array is empty', () => {
      const removeItem = vi.fn()
      const opts = makeOpts({
        multiple: true,
        search: '',
        selected: [],
        removeItem,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Backspace'))

      expect(removeItem).not.toHaveBeenCalled()
    })
  })

  describe('Home / End', () => {
    it('Home moves to first item', () => {
      const opts = makeOpts({ isOpen: true, activeIndex: 2 })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('Home'))

      expect(opts.activeIndex.value).toBe(0)
    })

    it('End moves to last item', () => {
      const opts = makeOpts({ isOpen: true, activeIndex: 0 })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('End'))

      expect(opts.activeIndex.value).toBe(2)
    })

    it('Home does nothing when closed', () => {
      const opts = makeOpts({ isOpen: false, activeIndex: 2 })
      const { handleKeyDown } = useSelectKeyboard(opts)
      const e = keyEvent('Home')

      handleKeyDown(e)

      expect(e.preventDefault).not.toHaveBeenCalled()
    })

    it('End does nothing when closed', () => {
      const opts = makeOpts({ isOpen: false, activeIndex: 0 })
      const { handleKeyDown } = useSelectKeyboard(opts)
      const e = keyEvent('End')

      handleKeyDown(e)

      expect(e.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('tagging token keypress', () => {
    it('creates tag when pressing a token character with search text', () => {
      const selectItem = vi.fn()
      const createTag = vi.fn((s: string) => s)
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [',', ';'],
        search: 'newtag',
        selectItem,
        createTag,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)
      const e = keyEvent(',')

      handleKeyDown(e)

      expect(e.preventDefault).toHaveBeenCalled()
      expect(createTag).toHaveBeenCalledWith('newtag')
      expect(selectItem).toHaveBeenCalledWith('newtag')
    })

    it('does not create tag for token press when search is empty', () => {
      const selectItem = vi.fn()
      const createTag = vi.fn()
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [','],
        search: '',
        selectItem,
        createTag,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent(','))

      expect(createTag).not.toHaveBeenCalled()
      expect(selectItem).not.toHaveBeenCalled()
    })

    it('ignores unrecognized keys in tag mode', () => {
      const selectItem = vi.fn()
      const createTag = vi.fn()
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [','],
        search: 'hello',
        selectItem,
        createTag,
      })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('a'))

      expect(createTag).not.toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('ignores all key events when disabled', () => {
      const open = vi.fn()
      const close = vi.fn()
      const selectItem = vi.fn()
      const opts = makeOpts({ disabled: true, open, close, selectItem })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowDown'))
      handleKeyDown(keyEvent('Enter'))
      handleKeyDown(keyEvent('Escape'))

      expect(open).not.toHaveBeenCalled()
      expect(close).not.toHaveBeenCalled()
      expect(selectItem).not.toHaveBeenCalled()
    })
  })

  describe('empty items', () => {
    it('ArrowDown with no items returns -1 activeIndex', () => {
      const opts = makeOpts({ isOpen: true, flatFilteredItems: [] })
      const { handleKeyDown } = useSelectKeyboard(opts)

      handleKeyDown(keyEvent('ArrowDown'))

      expect(opts.activeIndex.value).toBe(-1)
    })
  })

  describe('handlePaste', () => {
    it('splits pasted text by token characters and creates tags', () => {
      const selectItem = vi.fn()
      const createTag = vi.fn((s: string) => s)
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [','],
        search: '',
        selectItem,
        createTag,
      })
      const { handlePaste } = useSelectKeyboard(opts)

      const e = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => 'tag1,tag2,tag3' },
      } as unknown as ClipboardEvent

      handlePaste(e)

      expect(e.preventDefault).toHaveBeenCalled()
      expect(createTag).toHaveBeenCalledWith('tag1')
      expect(createTag).toHaveBeenCalledWith('tag2')
      expect(createTag).toHaveBeenCalledWith('tag3')
      expect(selectItem).toHaveBeenCalledTimes(3)
    })

    it('does nothing when tagging is disabled', () => {
      const selectItem = vi.fn()
      const opts = makeOpts({ tagging: false, selectItem })
      const { handlePaste } = useSelectKeyboard(opts)

      const e = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => 'a,b' },
      } as unknown as ClipboardEvent

      handlePaste(e)

      expect(e.preventDefault).not.toHaveBeenCalled()
      expect(selectItem).not.toHaveBeenCalled()
    })

    it('does nothing when no token characters in pasted text', () => {
      const selectItem = vi.fn()
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [','],
        selectItem,
      })
      const { handlePaste } = useSelectKeyboard(opts)

      const e = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => 'single-item' },
      } as unknown as ClipboardEvent

      handlePaste(e)

      expect(e.preventDefault).not.toHaveBeenCalled()
    })

    it('also tags existing search text before pasting', () => {
      const selectItem = vi.fn()
      const createTag = vi.fn((s: string) => s)
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [','],
        search: 'existing',
        selectItem,
        createTag,
      })
      const { handlePaste } = useSelectKeyboard(opts)

      const e = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => 'new1,new2' },
      } as unknown as ClipboardEvent

      handlePaste(e)

      // existing + new1 + new2 = 3 tags
      expect(createTag).toHaveBeenCalledWith('existing')
      expect(createTag).toHaveBeenCalledWith('new1')
      expect(createTag).toHaveBeenCalledWith('new2')
    })

    it('trims whitespace from pasted segments', () => {
      const selectItem = vi.fn()
      const createTag = vi.fn((s: string) => s)
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [','],
        search: '',
        selectItem,
        createTag,
      })
      const { handlePaste } = useSelectKeyboard(opts)

      const e = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => ' a , b , ' },
      } as unknown as ClipboardEvent

      handlePaste(e)

      expect(createTag).toHaveBeenCalledWith('a')
      expect(createTag).toHaveBeenCalledWith('b')
      expect(createTag).toHaveBeenCalledTimes(2) // empty segments ignored
    })
  })

  describe('handleSearchInput', () => {
    it('splits search text by tokens and creates tags', () => {
      const selectItem = vi.fn()
      const createTag = vi.fn((s: string) => s)
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [','],
        search: 'tag1,tag2',
        selectItem,
        createTag,
      })
      const { handleSearchInput } = useSelectKeyboard(opts)

      handleSearchInput()

      expect(opts.search.value).toBe('')
      expect(createTag).toHaveBeenCalledWith('tag1')
      expect(createTag).toHaveBeenCalledWith('tag2')
      expect(selectItem).toHaveBeenCalledTimes(2)
    })

    it('does nothing when tagging is disabled', () => {
      const selectItem = vi.fn()
      const opts = makeOpts({
        tagging: false,
        search: 'a,b',
        selectItem,
      })
      const { handleSearchInput } = useSelectKeyboard(opts)

      handleSearchInput()

      expect(selectItem).not.toHaveBeenCalled()
    })

    it('does nothing when no tokens are in search text', () => {
      const selectItem = vi.fn()
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [','],
        search: 'notokens',
        selectItem,
      })
      const { handleSearchInput } = useSelectKeyboard(opts)

      handleSearchInput()

      expect(selectItem).not.toHaveBeenCalled()
    })

    it('does nothing when search is empty', () => {
      const selectItem = vi.fn()
      const opts = makeOpts({
        tagging: true,
        taggingTokens: [','],
        search: '',
        selectItem,
      })
      const { handleSearchInput } = useSelectKeyboard(opts)

      handleSearchInput()

      expect(selectItem).not.toHaveBeenCalled()
    })
  })
})
