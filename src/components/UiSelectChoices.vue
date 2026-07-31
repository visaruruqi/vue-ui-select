<script lang="ts">
import { defineComponent, inject, toRef, computed, type PropType } from 'vue'
import { UI_SELECT_CONTEXT } from '../symbols'
import type { UiSelectContext, ChoicesConfig, ChoiceSlotScope } from '../types'
import { highlightText } from '../utils/highlight'

export default defineComponent({
  name: 'UiSelectChoices',
  props: {
    items: { type: [Array, Object] as PropType<any[] | Record<string, any>>, default: () => [] },
    trackBy: { type: [String, Function] as PropType<string | ((item: any) => any) | undefined>, default: undefined },
    bindProperty: { type: String as PropType<string | undefined>, default: undefined },
    searchFields: { type: Array as PropType<string[]>, default: () => [] },
    filterFn: { type: Function as PropType<((item: any, search: string) => boolean) | undefined>, default: undefined },
    groupBy: { type: [String, Function] as PropType<string | ((item: any) => string | undefined) | undefined>, default: undefined },
    groupFilter: { type: [Array, Function] as PropType<string[] | ((groups: string[]) => string[]) | undefined>, default: undefined },
    disableChoice: { type: Function as PropType<((item: any) => boolean) | undefined>, default: undefined },
    sortFn: { type: Function as PropType<((a: any, b: any) => number) | undefined>, default: undefined },
    minimumInputLength: { type: Number, default: 0 },
    showCheckboxes: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(UI_SELECT_CONTEXT) as UiSelectContext

    // Register choices config with parent UiSelect
    const choicesConfig: ChoicesConfig = {
      items: toRef(props, 'items') as any,
      trackBy: toRef(props, 'trackBy') as any,
      bindProperty: toRef(props, 'bindProperty') as any,
      searchFields: toRef(props, 'searchFields'),
      filterFn: toRef(props, 'filterFn') as any,
      groupBy: toRef(props, 'groupBy') as any,
      groupFilter: toRef(props, 'groupFilter') as any,
      disableChoice: toRef(props, 'disableChoice') as any,
      sortFn: toRef(props, 'sortFn') as any,
      minimumInputLength: toRef(props, 'minimumInputLength'),
    }

    // Register immediately for fast reactivity
    ctx.registerChoicesConfig(choicesConfig)

    // Pre-compute groups annotated with a positional flatIndex per item.
    // Indexing by position (not by item identity) handles duplicate primitives
    // and objects that share trackBy keys without collisions.
    const indexedGroups = computed(() => {
      const groups: { label: string | undefined; items: { item: any; flatIndex: number }[] }[] = []
      let flatIndex = 0
      for (const group of ctx.groupedItems.value) {
        groups.push({
          label: group.label,
          items: group.items.map((item: any) => ({ item, flatIndex: flatIndex++ })),
        })
      }
      return groups
    })

    function isChoiceDisabled(item: any): boolean {
      if (props.disableChoice) return props.disableChoice(item)
      return false
    }

    function isObjectSourceItem(item: any): item is { key: string; value: any } {
      return item != null && typeof item === 'object' && 'key' in item && 'value' in item && Object.keys(item).length === 2
    }

    function getChoiceSlotScope(item: any, index: number): ChoiceSlotScope {
      const unwrapped = isObjectSourceItem(item)
      return {
        item: unwrapped ? item.value : item,
        ...(unwrapped ? { key: item.key } : {}),
        index,
        search: ctx.search.value,
        highlighted: highlightText,
        isActive: ctx.activeIndex.value === index,
        isSelected: ctx.isItemSelected(item),
        isDisabled: isChoiceDisabled(item),
      }
    }

    function handleItemClick(item: any, e: Event) {
      e.stopPropagation()
      if (isChoiceDisabled(item)) return
      // When checkboxes are shown, toggle selection on/off
      if (props.showCheckboxes && ctx.isItemSelected(item)) {
        ctx.removeItem(item)
        return
      }
      if (!ctx.removeSelected.value && ctx.isItemSelected(item)) return
      ctx.selectItem(item)
    }

    function handleItemMouseEnter(item: any, flatIdx: number) {
      ctx.activeIndex.value = flatIdx
    }

    // Show "minimum input length" message
    const showMinimumLengthMessage = computed(() => {
      if (props.minimumInputLength <= 0) return false
      return ctx.search.value.length < props.minimumInputLength && ctx.search.value.length > 0
    })

    const remainingChars = computed(() => props.minimumInputLength - ctx.search.value.length)

    // Default English copy; localize via the `minimum-length` slot.
    const minimumLengthMessage = computed(() => {
      const remaining = remainingChars.value
      return `Please enter ${remaining} more character${remaining !== 1 ? 's' : ''}`
    })

    /**
     * The dropdown swallows mousedown so clicking options never steals focus
     * from the search input — but two regions need the default action back:
     * the search box itself (caret placement, drag-selection, double-click
     * word select are all mousedown defaults), and the scrollbar of the
     * choices list, which some engines refuse to drag when the event is
     * cancelled. offsetX/Y beyond the client box means the scrollbar (LTR).
     */
    function handleDropdownMousedown(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.closest('[data-ui-select-search]')) return
      if (e.offsetX > target.clientWidth || e.offsetY > target.clientHeight) return
      e.preventDefault()
    }

    const isEmpty = computed(() => ctx.flatFilteredItems.value.length === 0)

    const hasNoChoiceContent = computed(() => ctx.noChoiceContent.value !== null)

    const dropdownStyle = computed<Record<string, string>>(() => {
      const style: Record<string, string> = {}
      if (ctx.appendToBody.value && ctx.teleportStyle?.value) {
        Object.assign(style, ctx.teleportStyle.value)
      }
      if (ctx.dropdownMaxHeight?.value) {
        style.maxHeight = ctx.dropdownMaxHeight.value
        style.overflowY = 'auto'
      }
      return style
    })

    return {
      ctx,
      indexedGroups,
      isChoiceDisabled,
      getChoiceSlotScope,
      handleItemClick,
      handleItemMouseEnter,
      handleDropdownMousedown,
      showMinimumLengthMessage,
      minimumLengthMessage,
      remainingChars,
      isEmpty,
      hasNoChoiceContent,
      dropdownStyle,
    }
  },
})
</script>

<template>
  <Teleport to="body" :disabled="!ctx.appendToBody.value">
    <Transition name="ui-select-dropdown">
      <div
        v-if="ctx.isOpen.value"
        :ref="(el: any) => { ctx.dropdownRef.value = el }"
        class="ui-select__dropdown"
        :class="[
          'ui-select__dropdown--' + ctx.theme.value,
          { 'ui-select__dropdown--up': ctx.resolvedPosition?.value === 'up' },
        ]"
        :data-position="ctx.resolvedPosition?.value"
        :style="dropdownStyle"
        data-ui-select-dropdown=""
        data-testid="ui-select-dropdown"
        @mousedown="handleDropdownMousedown"
      >
        <!-- Search input for single mode -->
        <div
          v-if="ctx.searchEnabled.value && !ctx.multiple.value"
          class="ui-select__search"
          data-ui-select-search=""
          data-testid="ui-select-search"
        >
          <input
            :ref="(el: any) => { ctx.inputRef.value = el }"
            v-model="ctx.search.value"
            type="text"
            class="ui-select__input"
            data-ui-select-input=""
            data-testid="ui-select-input"
            autocomplete="off"
            :placeholder="ctx.placeholder.value"
            v-bind="ctx.inputAriaAttrs.value"
            @click.stop
            @keydown.stop="ctx.handleKeyDown"
            @paste="ctx.handlePaste"
          />
        </div>

        <!-- Minimum length message -->
        <div
          v-if="showMinimumLengthMessage"
          class="ui-select-choices__minimum-length"
          data-ui-select-minimum-length=""
          data-testid="ui-select-minimum-length"
        >
          <!-- Localizable: the default is English-only copy. -->
          <slot
            name="minimum-length"
            :remaining="remainingChars"
            :minimum="minimumInputLength"
          >{{ minimumLengthMessage }}</slot>
        </div>

        <!-- Choices list -->
        <div
          v-else
          class="ui-select-choices"
          data-ui-select-choices=""
          data-testid="ui-select-choices"
          :data-show-checkboxes="showCheckboxes || undefined"
          role="listbox"
          :id="ctx.uid + '-listbox'"
        >
          <template v-for="(group, groupIdx) in indexedGroups" :key="groupIdx">
            <!-- Group header -->
            <div
              v-if="group.label !== undefined"
              class="ui-select-choices__group-header"
              data-ui-select-group-header=""
              data-testid="ui-select-group-header"
              role="presentation"
            >
              <slot name="group-header" :groupName="group.label">{{ group.label }}</slot>
            </div>

            <!-- Group items -->
            <div
              v-for="({ item, flatIndex }) in group.items"
              :key="flatIndex"
              class="ui-select-choices__row"
              :class="{
                'ui-select-choices__row--active': ctx.activeIndex.value === flatIndex,
                'ui-select-choices__row--selected': ctx.isItemSelected(item),
                'ui-select-choices__row--disabled': isChoiceDisabled(item),
              }"
              :data-ui-select-choice-index="flatIndex"
              data-ui-select-choice=""
              data-testid="ui-select-choice"
              :data-active="ctx.activeIndex.value === flatIndex || undefined"
              :data-selected="ctx.isItemSelected(item) || undefined"
              :data-disabled="isChoiceDisabled(item) || undefined"
              role="option"
              :id="ctx.uid + '-option-' + flatIndex"
              :aria-selected="ctx.isItemSelected(item)"
              :aria-disabled="isChoiceDisabled(item) || undefined"
              @click="handleItemClick(item, $event)"
              @mouseenter="handleItemMouseEnter(item, flatIndex)"
            >
              <input
                v-if="showCheckboxes"
                type="checkbox"
                :checked="ctx.isItemSelected(item)"
                class="ui-select-choices__checkbox"
                data-ui-select-checkbox=""
                tabindex="-1"
                aria-hidden="true"
                @click.prevent
              />
              <slot name="choice" v-bind="getChoiceSlotScope(item, flatIndex)">
                {{ typeof item === 'object' ? JSON.stringify(item) : item }}
              </slot>
            </div>
          </template>

          <!-- "(new)" tag row — create the current search term as a tag.
               Hover clears the active item so Enter also creates the tag. -->
          <div
            v-if="ctx.shouldShowTagRow()"
            class="ui-select-choices__row ui-select-choices__tag-row"
            data-ui-select-tag-row=""
            data-testid="ui-select-tag-row"
            role="option"
            :aria-selected="false"
            @click.stop="ctx.selectSearchAsTag()"
            @mouseenter="ctx.activeIndex.value = -1"
          >
            <slot name="tag-row" :search="ctx.search.value" :label="ctx.getTagRowLabel()">
              {{ ctx.getTagRowLabel() }}
            </slot>
          </div>

          <!-- No results / empty state. The tag row supersedes it: "no results,
               but you can create this" reads as the row alone. -->
          <div
            v-if="isEmpty && !showMinimumLengthMessage && hasNoChoiceContent && !ctx.shouldShowTagRow()"
            class="ui-select-no-choice"
            data-ui-select-no-choice=""
            data-testid="ui-select-no-choice"
          >
            <component :is="{ render: ctx.noChoiceContent.value }" v-if="ctx.noChoiceContent.value" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
