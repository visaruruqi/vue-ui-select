<script lang="ts">
import {
  defineComponent,
  provide,
  toRef,
  toRefs,
  computed,
  watch,
  ref,
  shallowRef,
  onMounted,
  onBeforeUnmount,
  nextTick,
  type PropType,
} from 'vue'
import type {
  DropdownPosition,
  ThemeName,
  ChoicesConfig,
  UiSelectContext,
} from '../types'
import { UI_SELECT_CONTEXT } from '../symbols'
import { useSelectState } from '../composables/useSelectState'
import { useModelBinding } from '../composables/useModelBinding'
import { useSelectFiltering } from '../composables/useSelectFiltering'
import { useSelectKeyboard } from '../composables/useSelectKeyboard'
import { useSelectPositioning } from '../composables/useSelectPositioning'
import { useSelectTagging } from '../composables/useSelectTagging'
import { useSelectAccessibility } from '../composables/useSelectAccessibility'
import { useThemeClasses } from '../composables/useThemeClasses'
import { highlightText } from '../utils/highlight'

export default defineComponent({
  name: 'UiSelect',
  inheritAttrs: false,
  props: {
    modelValue: { type: null as unknown as PropType<any>, default: undefined },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    searchEnabled: { type: Boolean, default: true },
    resetSearchInput: { type: Boolean, default: true },
    closeOnSelect: { type: Boolean, default: true },
    appendToBody: { type: Boolean, default: false },
    position: { type: String as PropType<DropdownPosition>, default: 'auto' },
    theme: { type: String as PropType<ThemeName>, default: 'tailwind' },
    placeholder: { type: String, default: '' },
    clearable: { type: Boolean, default: false },
    tagging: { type: [Boolean, Function] as PropType<boolean | ((search: string) => any)>, default: false },
    taggingLabel: { type: [String, Boolean] as PropType<string | false>, default: '(new)' },
    taggingTokens: { type: Array as PropType<string[]>, default: () => [','] },
    limit: { type: Number as PropType<number | undefined>, default: undefined },
    removeSelected: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    autofocus: { type: Boolean, default: false },
    inputId: { type: String as PropType<string | undefined>, default: undefined },
    lockChoice: { type: Function as PropType<((item: any) => boolean) | undefined>, default: undefined },
  },
  emits: ['update:modelValue', 'select', 'remove', 'search', 'highlight', 'open', 'close', 'paste'],
  setup(props, { emit, attrs, expose }) {
    const propRefs = toRefs(props)

    // ---- Choices config (registered by UiSelectChoices child) ----
    const choicesConfig = shallowRef<ChoicesConfig | null>(null)
    function registerChoicesConfig(config: ChoicesConfig) {
      choicesConfig.value = config
    }

    // ---- No-choice content (registered by UiSelectNoChoice child) ----
    const noChoiceContent = shallowRef<(() => any) | null>(null)
    function registerNoChoiceContent(renderFn: () => any) {
      noChoiceContent.value = renderFn
    }

    // ---- Core state ----
    const state = useSelectState({
      modelValue: propRefs.modelValue,
      multiple: propRefs.multiple,
      disabled: propRefs.disabled,
      loading: propRefs.loading,
      searchEnabled: propRefs.searchEnabled,
      resetSearchInput: propRefs.resetSearchInput,
      closeOnSelect: propRefs.closeOnSelect,
      clearable: propRefs.clearable,
      appendToBody: propRefs.appendToBody,
      position: propRefs.position,
      theme: propRefs.theme,
      placeholder: propRefs.placeholder,
      tagging: propRefs.tagging as any,
      taggingLabel: propRefs.taggingLabel as any,
      taggingTokens: propRefs.taggingTokens,
      removeSelected: propRefs.removeSelected,
      lockChoice: propRefs.lockChoice as any,
      inputId: propRefs.inputId,
      autofocus: propRefs.autofocus,
      limit: propRefs.limit as any,
    })

    // ---- Model binding (initial, before filtering can resolve isItemSelected) ----
    const trackBy = computed(() => choicesConfig.value?.trackBy?.value)
    const bindProperty = computed(() => choicesConfig.value?.bindProperty?.value)

    // Placeholder raw items used for initial model binding hydration
    const placeholderRawItems = computed<any[]>(() => {
      const cfg = choicesConfig.value
      if (!cfg) return []
      const items = cfg.items?.value
      if (Array.isArray(items)) return items
      if (items && typeof items === 'object') {
        // object source – flatten
        return Object.entries(items).map(([key, value]) => ({ key, value }))
      }
      return []
    })

    const model = useModelBinding({
      modelValue: propRefs.modelValue,
      multiple: propRefs.multiple,
      trackBy,
      bindProperty,
      rawItems: placeholderRawItems,
      emit: emit as any,
    })

    // ---- Filtering (uses resolved isItemSelected) ----
    const filtering = useSelectFiltering({
      search: state.search,
      choicesConfig,
      isItemSelected: model.isItemSelected,
      removeSelected: propRefs.removeSelected,
    })

    // ---- Tagging ----
    const taggingUtil = useSelectTagging({
      tagging: propRefs.tagging as any,
      taggingLabel: propRefs.taggingLabel as any,
      taggingTokens: propRefs.taggingTokens,
      search: state.search,
      multiple: propRefs.multiple,
      limit: propRefs.limit as any,
      selected: model.selected,
      flatFilteredItems: filtering.flatFilteredItems,
      isItemSelected: model.isItemSelected,
      itemsEqual: model.itemsEqual,
    })

    // ---- Keyboard ----
    const keyboard = useSelectKeyboard({
      isOpen: state.isOpen,
      search: state.search,
      activeIndex: state.activeIndex,
      flatFilteredItems: filtering.flatFilteredItems,
      multiple: propRefs.multiple,
      disabled: propRefs.disabled,
      selected: model.selected,
      tagging: propRefs.tagging as any,
      taggingTokens: propRefs.taggingTokens,
      disableChoice: computed(() => choicesConfig.value?.disableChoice?.value),
      open: state.open,
      close: state.close,
      selectItem: handleSelect,
      removeItem: handleRemove,
      isItemSelected: model.isItemSelected,
      createTag: taggingUtil.createTag,
      focus: state.focus,
      dropdownRef: state.dropdownRef,
      inputRef: state.inputRef,
      emit: emit as any,
    })

    // ---- Positioning ----
    const positioning = useSelectPositioning({
      isOpen: state.isOpen,
      appendToBody: propRefs.appendToBody,
      position: propRefs.position,
      rootRef: state.rootRef,
      dropdownRef: state.dropdownRef,
    })

    // ---- Accessibility ----
    const a11y = useSelectAccessibility({
      uid: state.uid,
      isOpen: state.isOpen,
      activeIndex: state.activeIndex,
      multiple: propRefs.multiple,
      disabled: propRefs.disabled,
      selected: model.selected,
      flatFilteredItems: filtering.flatFilteredItems,
      placeholder: propRefs.placeholder,
      inputId: propRefs.inputId,
    })

    // ---- Theme ----
    const themeClasses = useThemeClasses(propRefs.theme)

    // ---- Event handlers ----
    function handleSelect(item: any) {
      if (props.disabled) return
      // Check limit
      if (props.multiple && props.limit != null) {
        const arr = Array.isArray(model.selected.value) ? model.selected.value : []
        if (arr.length >= props.limit) return
      }

      model.selectItem(item)

      if (props.resetSearchInput) {
        state.search.value = ''
      }

      if (props.multiple) {
        if (props.closeOnSelect) {
          state.close()
        }
        nextTick(() => state.focus())
      } else {
        state.close()
      }
    }

    function handleRemove(item: any) {
      if (props.disabled) return
      if (props.lockChoice && props.lockChoice(item)) return
      model.removeItem(item)
    }

    // ---- Search watcher → emit search event + token check ----
    watch(state.search, (val) => {
      emit('search', val)
      state.activeIndex.value = -1
      // Check for token separators in the updated search text
      keyboard.handleSearchInput()
    })

    // ---- Open/close watchers → emit events ----
    watch(state.isOpen, (val) => {
      if (val) {
        emit('open')
        nextTick(() => {
          if (props.searchEnabled) {
            state.focus()
          }
        })
      } else {
        emit('close')
      }
    })

    // ---- Click outside handler ----
    function handleClickOutside(e: MouseEvent) {
      if (!state.rootRef.value) return
      const target = e.target as Node
      if (state.rootRef.value.contains(target)) return
      // Also check teleported dropdown
      if (state.dropdownRef.value && state.dropdownRef.value.contains(target)) return
      state.close()
    }

    onMounted(() => {
      document.addEventListener('mousedown', handleClickOutside)
      if (props.autofocus) {
        nextTick(() => state.focus())
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', handleClickOutside)
    })

    // ---- Provide context to children ----
    const context: UiSelectContext = {
      isOpen: state.isOpen,
      search: state.search,
      activeIndex: state.activeIndex,
      multiple: toRef(props, 'multiple'),
      disabled: toRef(props, 'disabled'),
      loading: toRef(props, 'loading'),
      theme: toRef(props, 'theme'),
      position: toRef(props, 'position'),
      selected: model.selected,
      isItemSelected: model.isItemSelected,
      selectItem: handleSelect,
      removeItem: handleRemove,
      clearSelection: model.clearSelection,
      rawItems: filtering.rawItems as any,
      filteredItems: filtering.filteredItems,
      groupedItems: filtering.groupedItems,
      flatFilteredItems: filtering.flatFilteredItems,
      searchEnabled: toRef(props, 'searchEnabled'),
      resetSearchInput: toRef(props, 'resetSearchInput'),
      closeOnSelect: toRef(props, 'closeOnSelect'),
      clearable: toRef(props, 'clearable'),
      appendToBody: toRef(props, 'appendToBody'),
      placeholder: toRef(props, 'placeholder'),
      tagging: toRef(props, 'tagging') as any,
      taggingLabel: toRef(props, 'taggingLabel') as any,
      taggingTokens: toRef(props, 'taggingTokens'),
      removeSelected: toRef(props, 'removeSelected'),
      lockChoice: toRef(props, 'lockChoice') as any,
      inputId: toRef(props, 'inputId'),
      registerChoicesConfig,
      noChoiceContent,
      registerNoChoiceContent,
      open: state.open,
      close: state.close,
      toggle: state.toggle,
      focus: state.focus,
      blur: state.blur,
      highlighted: highlightText,
      rootRef: state.rootRef,
      inputRef: state.inputRef,
      dropdownRef: state.dropdownRef,
      uid: state.uid,
      resolvedPosition: positioning.resolvedPosition,
      dropdownMaxHeight: positioning.dropdownMaxHeight,
      handlePaste: keyboard.handlePaste,
    }

    provide(UI_SELECT_CONTEXT, context)

    // ---- Expose for template refs ----
    expose({
      selected: model.selected,
      search: state.search,
      isOpen: state.isOpen,
      activeIndex: state.activeIndex,
      filteredItems: filtering.filteredItems,
      open: state.open,
      close: state.close,
      toggle: state.toggle,
      focus: state.focus,
      blur: state.blur,
      clear: model.clearSelection,
      select: handleSelect,
      remove: handleRemove,
    })

    return {
      uid: state.uid,
      isOpen: state.isOpen,
      search: state.search,
      activeIndex: state.activeIndex,
      rootRef: state.rootRef,
      inputRef: state.inputRef,
      dropdownRef: state.dropdownRef,
      selected: model.selected,
      resolvedPosition: positioning.resolvedPosition,
      teleportStyle: positioning.teleportStyle,
      handleKeyDown: keyboard.handleKeyDown,
      handlePaste: keyboard.handlePaste,
      shouldShowTagRow: taggingUtil.shouldShowTagRow,
      rootAriaAttrs: a11y.rootAriaAttrs,
      inputAriaAttrs: a11y.inputAriaAttrs,
      themeDataAttr: themeClasses.themeDataAttr,
      open: state.open,
      close: state.close,
      toggle: state.toggle,
      focus: state.focus,
      handleSelect,
      handleRemove,
    }
  },
})
</script>

<template>
  <div
    ref="rootRef"
    v-bind="{ ...$attrs, ...rootAriaAttrs, ...themeDataAttr }"
    :class="[
      'ui-select',
      `ui-select--${$props.theme}`,
      {
        'ui-select--open': isOpen,
        'ui-select--closed': !isOpen,
        'ui-select--disabled': $props.disabled,
        'ui-select--multiple': $props.multiple,
        'ui-select--single': !$props.multiple,
        'ui-select--focus': isOpen,
        'ui-select--loading': $props.loading,
      },
    ]"
    data-ui-select=""
    :data-open="isOpen || undefined"
    :data-disabled="$props.disabled || undefined"
    :data-multiple="$props.multiple || undefined"
    :data-position="resolvedPosition"
    data-testid="ui-select"
    tabindex="0"
    @keydown="handleKeyDown"
    @paste="handlePaste"
  >
    <!-- All child components (UiSelectMatch, UiSelectChoices, UiSelectNoChoice) render via default slot -->
    <slot />

    <!-- Loading spinner -->
    <div
      v-if="$props.loading"
      class="ui-select__spinner"
      data-ui-select-spinner=""
      data-testid="ui-select-spinner"
    >
      <slot name="spinner">
        <span class="ui-select__spinner-icon" />
      </slot>
    </div>
  </div>
</template>
