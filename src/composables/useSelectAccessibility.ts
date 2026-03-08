import { computed, type Ref, type ComputedRef } from 'vue'

export function useSelectAccessibility(opts: {
  uid: string
  isOpen: Ref<boolean>
  activeIndex: Ref<number>
  multiple: Ref<boolean>
  disabled: Ref<boolean>
  selected: Ref<any>
  flatFilteredItems: ComputedRef<any[]>
  placeholder: Ref<string>
  inputId: Ref<string | undefined>
}) {
  const { uid, isOpen, activeIndex, multiple, disabled, flatFilteredItems, placeholder, inputId } = opts

  const listboxId = `${uid}-listbox`
  const inputElId = computed(() => inputId.value || `${uid}-input`)

  const activeDescendantId = computed(() => {
    if (activeIndex.value >= 0 && activeIndex.value < flatFilteredItems.value.length) {
      return `${uid}-option-${activeIndex.value}`
    }
    return undefined
  })

  /** ARIA attributes for the root combobox container */
  const rootAriaAttrs = computed(() => ({
    role: 'combobox',
    'aria-expanded': isOpen.value,
    'aria-haspopup': 'listbox' as const,
    'aria-owns': isOpen.value ? listboxId : undefined,
    'aria-disabled': disabled.value || undefined,
    'aria-multiselectable': multiple.value || undefined,
  }))

  /** ARIA attributes for the search input */
  const inputAriaAttrs = computed(() => ({
    role: 'searchbox',
    'aria-autocomplete': 'list' as const,
    'aria-controls': isOpen.value ? listboxId : undefined,
    'aria-activedescendant': activeDescendantId.value,
    'aria-label': placeholder.value || 'Search',
    id: inputElId.value,
  }))

  /** ARIA attributes for the dropdown listbox */
  const listboxAriaAttrs = computed(() => ({
    role: 'listbox',
    id: listboxId,
    'aria-multiselectable': multiple.value || undefined,
    'aria-label': 'Options',
  }))

  /** Generate ARIA attributes for an individual option */
  function optionAriaAttrs(index: number, isSelected: boolean, isDisabled: boolean) {
    return {
      role: 'option',
      id: `${uid}-option-${index}`,
      'aria-selected': isSelected,
      'aria-disabled': isDisabled || undefined,
    }
  }

  /** ARIA attributes for group headers */
  function groupHeaderAriaAttrs(label: string) {
    return {
      role: 'presentation',
      'aria-label': label,
    }
  }

  return {
    listboxId,
    inputElId,
    activeDescendantId,
    rootAriaAttrs,
    inputAriaAttrs,
    listboxAriaAttrs,
    optionAriaAttrs,
    groupHeaderAriaAttrs,
  }
}
