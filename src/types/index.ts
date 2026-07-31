// ============================================================
// vue-ui-select — Core Types
// ============================================================

import type { Component, InjectionKey, Ref, ComputedRef } from 'vue'

// ---- General item types ----

/** Represents a key/value pair when using object/dictionary sources */
export interface ObjectSourceItem<V = any> {
  key: string
  value: V
}

// ---- Grouped structure ----

export interface GroupedItems<T = any> {
  label: string | undefined
  items: T[]
}

// ---- Dropdown position ----

export type DropdownPosition = 'auto' | 'up' | 'down'

// ---- Theme ----

export type ThemeName = 'bootstrap' | 'select2' | 'selectize' | 'tailwind' | (string & {})

// ---- UiSelect props (TypeScript interface for defineProps) ----

export interface UiSelectProps {
  modelValue?: any
  multiple?: boolean
  disabled?: boolean
  searchEnabled?: boolean
  resetSearchInput?: boolean
  closeOnSelect?: boolean
  appendToBody?: boolean
  position?: DropdownPosition
  theme?: ThemeName
  placeholder?: string
  clearable?: boolean
  tagging?: boolean | ((search: string) => any)
  taggingLabel?: string | false
  taggingTokens?: string[]
  limit?: number
  removeSelected?: boolean
  loading?: boolean
  autofocus?: boolean
  inputId?: string
  lockChoice?: (item: any) => boolean
}

// ---- UiSelectChoices props ----

export interface UiSelectChoicesProps {
  items?: any[] | Record<string, any>
  trackBy?: string | ((item: any) => any)
  bindProperty?: string
  searchFields?: string[]
  filterFn?: (item: any, search: string) => boolean
  groupBy?: string | ((item: any) => string | undefined)
  groupFilter?: string[] | ((groups: string[]) => string[])
  disableChoice?: (item: any) => boolean
  sortFn?: (a: any, b: any) => number
  minimumInputLength?: number
  showCheckboxes?: boolean
}

// ---- UiSelectMatch props ----

export interface UiSelectMatchProps {
  placeholder?: string
}

// ---- Emit payloads ----

export interface SelectEventPayload {
  item: any
  model: any
}

export interface RemoveEventPayload {
  item: any
  model: any
}

// ---- Emits ----

export interface UiSelectEmits {
  (e: 'update:modelValue', value: any): void
  (e: 'select', payload: SelectEventPayload): void
  (e: 'remove', payload: RemoveEventPayload): void
  (e: 'search', searchText: string): void
  (e: 'highlight', item: any): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'paste', text: string): void
}

// ---- Choice slot scope ----

export interface ChoiceSlotScope {
  item: any
  key?: string
  index: number
  search: string
  highlighted: (text: string, search: string) => string
  isActive: boolean
  isSelected: boolean
  isDisabled: boolean
}

// ---- Match slot scope (single mode) ----

export interface MatchSingleSlotScope {
  selected: any
  search: string
  isOpen: boolean
}

// ---- Match slot scope (multi mode) ----

export interface MatchMultiSlotScope {
  item: any
  index: number
  remove: (item: any) => void
  removeItem: (item: any) => void
  isLocked: boolean
}

// ---- Provide/Inject context ----

export interface UiSelectContext {
  // State
  isOpen: Ref<boolean>
  search: Ref<string>
  activeIndex: Ref<number>
  multiple: Ref<boolean>
  disabled: Ref<boolean>
  loading: Ref<boolean>
  theme: Ref<ThemeName>
  position: Ref<DropdownPosition>

  // Selection
  selected: Ref<any>
  isItemSelected: (item: any) => boolean
  selectItem: (item: any) => void
  removeItem: (item: any) => void
  clearSelection: () => void

  // Items / filtering
  rawItems: Ref<any[]>
  filteredItems: ComputedRef<any[]>
  groupedItems: ComputedRef<GroupedItems[]>
  flatFilteredItems: ComputedRef<any[]>

  // Config
  searchEnabled: Ref<boolean>
  resetSearchInput: Ref<boolean>
  closeOnSelect: Ref<boolean>
  clearable: Ref<boolean>
  appendToBody: Ref<boolean>
  placeholder: Ref<string>
  tagging: Ref<boolean | ((search: string) => any)>
  taggingLabel: Ref<string | false>
  taggingTokens: Ref<string[]>
  removeSelected: Ref<boolean>
  lockChoice: Ref<((item: any) => boolean) | undefined>
  inputId: Ref<string | undefined>

  // Choices config (set by UiSelectChoices)
  registerChoicesConfig: (config: ChoicesConfig) => void

  // No-choice content registration (set by UiSelectNoChoice)
  noChoiceContent: Ref<(() => any) | null>
  registerNoChoiceContent: (renderFn: () => any) => void

  // Methods
  open: () => void
  close: () => void
  toggle: () => void
  focus: () => void
  blur: () => void

  // Highlight helper
  highlighted: (text: string, search: string) => string

  // Element refs
  rootRef: Ref<HTMLElement | null>
  inputRef: Ref<HTMLInputElement | null>
  dropdownRef: Ref<HTMLElement | null>

  // Unique IDs for a11y
  uid: string
  inputAriaAttrs: ComputedRef<Record<string, any>>

  // Positioning
  resolvedPosition: Ref<'up' | 'down'>
  dropdownMaxHeight: Ref<string | undefined>
  teleportStyle: Ref<Record<string, string>>

  // Paste handling (for token separators)
  handlePaste: (e: ClipboardEvent) => void

  // Keyboard handling
  handleKeyDown: (e: KeyboardEvent) => void

  // Tagging — the "(new)" row UiSelectChoices renders for a novel search term
  shouldShowTagRow: () => boolean
  getTagRowLabel: () => string
  selectSearchAsTag: () => void
}

export interface ChoicesConfig {
  items: Ref<any[] | Record<string, any>>
  trackBy: Ref<string | ((item: any) => any) | undefined>
  bindProperty: Ref<string | undefined>
  searchFields: Ref<string[]>
  filterFn: Ref<((item: any, search: string) => boolean) | undefined>
  groupBy: Ref<string | ((item: any) => string | undefined) | undefined>
  groupFilter: Ref<string[] | ((groups: string[]) => string[]) | undefined>
  disableChoice: Ref<((item: any) => boolean) | undefined>
  sortFn: Ref<((a: any, b: any) => number) | undefined>
  minimumInputLength: Ref<number>
}

// ---- Plugin options ----

export interface UiSelectPluginDefaults {
  searchEnabled?: boolean
  clearable?: boolean
  appendToBody?: boolean
  closeOnSelect?: boolean
}

export interface UiSelectPluginOptions {
  theme?: ThemeName
  prefix?: string
  defaults?: UiSelectPluginDefaults
}
