<script lang="ts">
import { defineComponent, inject, computed } from 'vue'
import { UI_SELECT_CONTEXT } from '../symbols'
import type { UiSelectContext, MatchSingleSlotScope, MatchMultiSlotScope } from '../types'

export default defineComponent({
  name: 'UiSelectMatch',
  props: {
    placeholder: { type: String, default: '' },
  },
  setup(props) {
    const ctx = inject(UI_SELECT_CONTEXT) as UiSelectContext

    const resolvedPlaceholder = computed(() => props.placeholder || ctx.placeholder.value || '')

    const hasSelection = computed(() => {
      if (ctx.multiple.value) {
        return Array.isArray(ctx.selected.value) && ctx.selected.value.length > 0
      }
      return ctx.selected.value != null
    })

    const selectedItems = computed<any[]>(() => {
      if (!ctx.multiple.value) return []
      return Array.isArray(ctx.selected.value) ? ctx.selected.value : []
    })

    function unwrapObjectSourceItem(item: any): any {
      if (item != null && typeof item === 'object' && 'key' in item && 'value' in item && Object.keys(item).length === 2) {
        return item.value
      }
      return item
    }

    // Single mode slot scope
    const singleSlotScope = computed<MatchSingleSlotScope>(() => ({
      selected: unwrapObjectSourceItem(ctx.selected.value),
      search: ctx.search.value,
      isOpen: ctx.isOpen.value,
    }))

    function handleClear(e: Event) {
      e.stopPropagation()
      ctx.clearSelection()
    }

    function handleRemoveItem(item: any, e?: Event) {
      e?.stopPropagation()
      ctx.removeItem(item)
    }

    function isItemLocked(item: any): boolean {
      if (ctx.lockChoice.value) return ctx.lockChoice.value(item)
      return false
    }

    function handleControlClick() {
      if (!ctx.disabled.value) {
        ctx.toggle()
      }
    }

    return {
      ctx,
      resolvedPlaceholder,
      hasSelection,
      selectedItems,
      singleSlotScope,
      handleClear,
      handleRemoveItem,
      isItemLocked,
      handleControlClick,
      unwrapObjectSourceItem,
    }
  },
})
</script>

<template>
  <div
    class="ui-select-match"
    data-ui-select-match=""
    data-testid="ui-select-match"
    @click="handleControlClick"
  >
    <!-- Single mode -->
    <template v-if="!ctx.multiple.value">
      <div class="ui-select-match__content" data-ui-select-match-content="">
        <!-- Placeholder -->
        <span
          v-if="!hasSelection"
          class="ui-select-match__placeholder"
          data-ui-select-placeholder=""
          data-testid="ui-select-placeholder"
        >
          {{ resolvedPlaceholder }}
        </span>

        <!-- Selected display -->
        <span
          v-else
          class="ui-select-match__selection"
          data-ui-select-selection=""
          data-testid="ui-select-selection"
        >
          <slot v-bind="singleSlotScope">
            {{ typeof singleSlotScope.selected === 'object' ? JSON.stringify(singleSlotScope.selected) : singleSlotScope.selected }}
          </slot>
        </span>
      </div>

      <!-- Clear button -->
      <button
        v-if="ctx.clearable.value && hasSelection && !ctx.disabled.value"
        class="ui-select-match__clear"
        type="button"
        data-ui-select-clear=""
        data-testid="ui-select-clear"
        aria-label="Clear selection"
        @click="handleClear"
        @mousedown.prevent
      >
        <span aria-hidden="true">&times;</span>
      </button>

      <!-- Caret -->
      <span class="ui-select-match__caret" data-ui-select-caret="" aria-hidden="true" />
    </template>

    <!-- Multiple mode -->
    <template v-else>
      <div class="ui-select-match__tags" data-ui-select-tags="" data-testid="ui-select-tags">
        <span
          v-for="(item, idx) in selectedItems"
          :key="idx"
          class="ui-select-match__tag"
          :class="{
            'ui-select-match__tag--locked': isItemLocked(item),
          }"
          data-ui-select-tag=""
          data-testid="ui-select-tag"
        >
          <slot
            name="tag"
            :item="unwrapObjectSourceItem(item)"
            :index="idx"
            :remove="handleRemoveItem"
            :removeItem="handleRemoveItem"
            :isLocked="isItemLocked(item)"
          >
            {{ typeof unwrapObjectSourceItem(item) === 'object' ? JSON.stringify(unwrapObjectSourceItem(item)) : unwrapObjectSourceItem(item) }}
          </slot>
          <button
            v-if="!$slots.tag && !isItemLocked(item) && !ctx.disabled.value"
            class="ui-select-match__tag-remove"
            type="button"
            data-ui-select-tag-remove=""
            data-testid="ui-select-tag-remove"
            aria-label="Remove"
            @click.stop="handleRemoveItem(item, $event)"
            @mousedown.prevent
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </span>

        <!-- Inline search input for multi mode -->
        <input
          v-if="ctx.searchEnabled.value"
          :ref="(el: any) => { ctx.inputRef.value = el }"
          v-model="ctx.search.value"
          class="ui-select-match__search-input"
          type="text"
          data-ui-select-input=""
          data-testid="ui-select-input"
          autocomplete="off"
          :placeholder="selectedItems.length === 0 ? resolvedPlaceholder : ''"
          :disabled="ctx.disabled.value"
          v-bind="ctx.inputAriaAttrs.value"
          @click.stop="ctx.open()"
          @focus="ctx.open()"
          @paste="ctx.handlePaste"
        />

        <!-- Placeholder when no items and no search -->
        <span
          v-if="selectedItems.length === 0 && !ctx.searchEnabled.value"
          class="ui-select-match__placeholder"
          data-ui-select-placeholder=""
          data-testid="ui-select-placeholder"
        >
          {{ resolvedPlaceholder }}
        </span>
      </div>
    </template>
  </div>
</template>
