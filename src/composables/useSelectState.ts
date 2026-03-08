import { ref, computed, watch, type Ref } from 'vue'
import type { DropdownPosition, ThemeName } from '../types'

let uidCounter = 0

export function useSelectState(props: {
  modelValue: Ref<any>
  multiple: Ref<boolean>
  disabled: Ref<boolean>
  loading: Ref<boolean>
  searchEnabled: Ref<boolean>
  resetSearchInput: Ref<boolean>
  closeOnSelect: Ref<boolean>
  clearable: Ref<boolean>
  appendToBody: Ref<boolean>
  position: Ref<DropdownPosition>
  theme: Ref<ThemeName>
  placeholder: Ref<string>
  tagging: Ref<boolean | ((search: string) => any)>
  taggingLabel: Ref<string | false>
  taggingTokens: Ref<string[]>
  removeSelected: Ref<boolean>
  lockChoice: Ref<((item: any) => boolean) | undefined>
  inputId: Ref<string | undefined>
  autofocus: Ref<boolean>
  limit: Ref<number | undefined>
}) {
  const uid = `ui-select-${++uidCounter}`
  const isOpen = ref(false)
  const search = ref('')
  const activeIndex = ref(-1)

  // Element refs
  const rootRef = ref<HTMLElement | null>(null)
  const inputRef = ref<HTMLInputElement | null>(null)
  const dropdownRef = ref<HTMLElement | null>(null)

  function open() {
    if (props.disabled.value || isOpen.value) return
    isOpen.value = true
  }

  function close() {
    if (!isOpen.value) return
    isOpen.value = false
    activeIndex.value = -1
  }

  function toggle() {
    if (isOpen.value) close()
    else open()
  }

  function focus() {
    inputRef.value?.focus()
  }

  function blur() {
    inputRef.value?.blur()
  }

  // Reset search on close if configured
  watch(isOpen, (val) => {
    if (!val && props.resetSearchInput.value) {
      search.value = ''
    }
  })

  return {
    uid,
    isOpen,
    search,
    activeIndex,
    rootRef,
    inputRef,
    dropdownRef,
    open,
    close,
    toggle,
    focus,
    blur,
  }
}
