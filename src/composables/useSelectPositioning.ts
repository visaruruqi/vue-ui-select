import { ref, computed, onMounted, onBeforeUnmount, watch, type Ref, nextTick } from 'vue'
import type { DropdownPosition } from '../types'

export function useSelectPositioning(opts: {
  isOpen: Ref<boolean>
  appendToBody: Ref<boolean>
  position: Ref<DropdownPosition>
  rootRef: Ref<HTMLElement | null>
  dropdownRef: Ref<HTMLElement | null>
}) {
  const { isOpen, appendToBody, position, rootRef, dropdownRef } = opts

  const resolvedPosition = ref<'up' | 'down'>('down')
  const teleportStyle = ref<Record<string, string>>({})
  const dropdownMaxHeight = ref<string | undefined>(undefined)

  // Small breathing room (px) between the dropdown and the top edge of the viewport
  const VIEWPORT_PADDING = 8

  function calculatePosition() {
    if (!rootRef.value) return

    const rootEl = rootRef.value
    const rect = rootEl.getBoundingClientRect()

    if (position.value === 'up') {
      resolvedPosition.value = 'up'
    } else if (position.value === 'down') {
      resolvedPosition.value = 'down'
    } else {
      // Auto: check available space
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const dropdownHeight = dropdownRef.value?.offsetHeight || 300
      resolvedPosition.value = spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'up' : 'down'
    }

    // Cap dropdown height when opening upward so it never touches viewport top
    if (resolvedPosition.value === 'up') {
      const availableAbove = rect.top - VIEWPORT_PADDING
      dropdownMaxHeight.value = `${Math.max(availableAbove, 100)}px`
    } else {
      dropdownMaxHeight.value = undefined
    }

    // Calculate teleport positioning
    if (appendToBody.value) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

      if (resolvedPosition.value === 'up') {
        teleportStyle.value = {
          position: 'absolute',
          left: `${rect.left + scrollLeft}px`,
          bottom: `${window.innerHeight - rect.top + scrollTop}px`,
          width: `${rect.width}px`,
          zIndex: '9999',
        }
      } else {
        teleportStyle.value = {
          position: 'absolute',
          left: `${rect.left + scrollLeft}px`,
          top: `${rect.bottom + scrollTop}px`,
          width: `${rect.width}px`,
          zIndex: '9999',
        }
      }
    }
  }

  let scrollListener: (() => void) | null = null
  let resizeListener: (() => void) | null = null

  function addListeners() {
    scrollListener = () => calculatePosition()
    resizeListener = () => calculatePosition()
    window.addEventListener('scroll', scrollListener, true)
    window.addEventListener('resize', resizeListener)
  }

  function removeListeners() {
    if (scrollListener) {
      window.removeEventListener('scroll', scrollListener, true)
      scrollListener = null
    }
    if (resizeListener) {
      window.removeEventListener('resize', resizeListener)
      resizeListener = null
    }
  }

  watch(isOpen, async (val) => {
    if (val) {
      await nextTick()
      calculatePosition()
      addListeners()
    } else {
      removeListeners()
    }
  })

  onBeforeUnmount(() => {
    removeListeners()
  })

  return {
    resolvedPosition,
    teleportStyle,
    dropdownMaxHeight,
    calculatePosition,
  }
}
