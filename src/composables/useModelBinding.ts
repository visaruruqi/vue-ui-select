import { ref, watch, computed, type Ref } from 'vue'
import { resolveTrackBy, resolveBindValue } from '../utils/objectSource'

export function useModelBinding(opts: {
  modelValue: Ref<any>
  multiple: Ref<boolean>
  trackBy: Ref<string | ((item: any) => any) | undefined>
  bindProperty: Ref<string | undefined>
  rawItems: Ref<any[]>
  emit: (event: string, ...args: any[]) => void
}) {
  const { modelValue, multiple, trackBy, bindProperty, rawItems, emit } = opts

  // Internal "selected" always stores full item(s)
  const selected = ref<any>(multiple.value ? [] : null)

  // --- Hydrate: convert modelValue into internal selected ---
  function hydrateSelected(mv: any) {
    if (mv == null || mv === undefined) {
      selected.value = multiple.value ? [] : null
      return
    }

    if (multiple.value) {
      if (!Array.isArray(mv)) {
        selected.value = []
        return
      }
      if (bindProperty.value) {
        // mv is an array of primitive keys; resolve to full items
        selected.value = mv
          .map((v: any) => findItemByBoundValue(v))
          .filter(Boolean)
        // Keep unresolved values as-is (for async hydration later)
        const resolved = selected.value.map((it: any) =>
          resolveBindValue(it, bindProperty.value)
        )
        const unresolved = mv.filter((v: any) => !resolved.includes(v))
        if (unresolved.length) {
          // Store unresolved primitives directly so they can be hydrated later
          selected.value = [...selected.value, ...unresolved]
        }
      } else {
        selected.value = [...mv]
      }
    } else {
      if (bindProperty.value) {
        const found = findItemByBoundValue(mv)
        if (found) {
          selected.value = found
        } else if (
          // Keep current resolved object if its bound value still matches mv,
          // so clearing async results or setting an ID before items load
          // doesn't downgrade a full object to a raw primitive.
          selected.value != null &&
          typeof selected.value === 'object' &&
          resolveBindValue(selected.value, bindProperty.value) === mv
        ) {
          // no-op: keep existing resolved object
        } else {
          selected.value = mv
        }
      } else {
        selected.value = mv
      }
    }
  }

  function findItemByBoundValue(val: any): any {
    return rawItems.value.find((item: any) => {
      const bv = resolveBindValue(item, bindProperty.value)
      return bv === val || JSON.stringify(bv) === JSON.stringify(val)
    })
  }

  // Hydrate on mount and when modelValue changes externally
  watch(modelValue, hydrateSelected, { immediate: true })

  // Re-hydrate when items change (async hydration support).
  // Only re-hydrate when rawItems is non-empty so that clearing
  // async search results doesn't downgrade a resolved object back
  // to a primitive key (which would blank the display).
  watch(rawItems, () => {
    if (bindProperty.value && modelValue.value != null && rawItems.value.length > 0) {
      hydrateSelected(modelValue.value)
    }
  })

  function isObjectSourceItem(item: any): item is { key: string; value: any } {
    return item != null && typeof item === 'object' && 'key' in item && 'value' in item && Object.keys(item).length === 2
  }

  function unwrapForEmit(item: any): any {
    return isObjectSourceItem(item) ? item.value : item
  }

  // --- Emit: convert selected back to modelValue ---
  function emitModelValue() {
    if (multiple.value) {
      const arr = Array.isArray(selected.value) ? selected.value : []
      const val = bindProperty.value
        ? arr.map((it: any) =>
            typeof it === 'object' ? resolveBindValue(it, bindProperty.value) : it
          )
        : arr.map(unwrapForEmit)
      emit('update:modelValue', val)
    } else {
      const val = bindProperty.value
        ? selected.value != null && typeof selected.value === 'object'
          ? resolveBindValue(selected.value, bindProperty.value)
          : selected.value
        : unwrapForEmit(selected.value)
      emit('update:modelValue', val)
    }
  }

  // --- Selection methods ---
  function isItemSelected(item: any): boolean {
    if (multiple.value) {
      const arr = Array.isArray(selected.value) ? selected.value : []
      return arr.some((sel: any) => itemsEqual(sel, item))
    }
    return itemsEqual(selected.value, item)
  }

  function itemsEqual(a: any, b: any): boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    const tby = trackBy.value
    if (tby) {
      return resolveTrackBy(a, tby) === resolveTrackBy(b, tby)
    }
    if (typeof a === 'object' && typeof b === 'object') {
      return JSON.stringify(a) === JSON.stringify(b)
    }
    return false
  }

  function selectItem(item: any) {
    if (multiple.value) {
      const arr = Array.isArray(selected.value) ? [...selected.value] : []
      if (!isItemSelected(item)) {
        arr.push(item)
        selected.value = arr
      }
    } else {
      selected.value = item
    }
    emitModelValue()
    emit('select', { item, model: multiple.value ? [...selected.value] : selected.value })
  }

  function removeItem(item: any) {
    if (multiple.value) {
      const arr = Array.isArray(selected.value) ? [...selected.value] : []
      const idx = arr.findIndex((sel: any) => itemsEqual(sel, item))
      if (idx !== -1) {
        arr.splice(idx, 1)
        selected.value = arr
        emitModelValue()
        emit('remove', { item, model: [...selected.value] })
      }
    } else {
      const prev = selected.value
      selected.value = null
      emitModelValue()
      emit('remove', { item: prev, model: null })
    }
  }

  function clearSelection() {
    if (multiple.value) {
      selected.value = []
    } else {
      selected.value = null
    }
    emitModelValue()
  }

  return {
    selected,
    isItemSelected,
    selectItem,
    removeItem,
    clearSelection,
    itemsEqual,
  }
}
