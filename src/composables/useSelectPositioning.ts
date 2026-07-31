import { ref, onBeforeUnmount, watch, type Ref, nextTick } from 'vue'
import type { DropdownPosition } from '../types'
import {
  canScrollFurther,
  findScrollableAncestor,
  isScrollable,
  normalizeWheelDelta,
} from '../utils/scrollChaining'

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

  /**
   * Teleporting to <body> takes the dropdown out of the scroll container it
   * visually belongs to, and the browser chains wheel scrolling along DOM
   * ancestors. So a wheel over an open dropdown reaches <body> — which app
   * shells routinely leave at overflow:hidden — and the page stops scrolling
   * entirely until the dropdown closes.
   *
   * Bridge that gap: anything scrollable inside the dropdown gets the scroll
   * first, and only what is left over is handed to the select's own container.
   */
  function handleDropdownWheel(event: WheelEvent) {
    const dropdownEl = dropdownRef.value
    if (!appendToBody.value || !dropdownEl) return

    // First refusal to the dropdown's own scrollers (the choices list).
    let node = event.target as HTMLElement | null
    while (node && dropdownEl.contains(node)) {
      if (isScrollable(node, 'y') && canScrollFurther(node, event.deltaY, 'y')) return
      node = node.parentElement
    }

    const container = findScrollableAncestor(rootRef.value, 'y')
    if (!container || !canScrollFurther(container, event.deltaY, 'y')) return

    // preventDefault only once there is something of ours to scroll, so the
    // browser's own chaining still applies in every other case.
    event.preventDefault()
    container.scrollTop += normalizeWheelDelta(event, container.clientHeight)
  }

  let scrollListener: (() => void) | null = null
  let resizeListener: (() => void) | null = null
  let dropdownObserver: ResizeObserver | null = null
  let wheelTarget: HTMLElement | null = null

  function addListeners() {
    scrollListener = () => calculatePosition()
    resizeListener = () => calculatePosition()
    window.addEventListener('scroll', scrollListener, true)
    window.addEventListener('resize', resizeListener)
    if (typeof ResizeObserver !== 'undefined' && dropdownRef.value) {
      dropdownObserver = new ResizeObserver(() => calculatePosition())
      dropdownObserver.observe(dropdownRef.value)
    }
    // Only teleported dropdowns need the bridge; in place, chaining already works.
    if (appendToBody.value && dropdownRef.value) {
      wheelTarget = dropdownRef.value
      wheelTarget.addEventListener('wheel', handleDropdownWheel, { passive: false })
    }
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
    if (dropdownObserver) {
      dropdownObserver.disconnect()
      dropdownObserver = null
    }
    if (wheelTarget) {
      wheelTarget.removeEventListener('wheel', handleDropdownWheel)
      wheelTarget = null
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

  // Recalculate when position-influencing props change while open.
  watch([position, appendToBody], () => {
    if (!isOpen.value) return
    calculatePosition()
    // appendToBody decides whether the wheel bridge is needed, so rebind it.
    removeListeners()
    addListeners()
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
