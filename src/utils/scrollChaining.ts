// Teleporting the dropdown to <body> moves it out of the DOM subtree it visually
// belongs to. The browser chains wheel scrolling along DOM ancestors, so once the
// dropdown's own list is exhausted the scroll is handed to <body> — never to the
// container the select actually sits in. App shells commonly scroll on an inner
// element and leave <body> at overflow:hidden, and there the page simply stops
// responding to the wheel for as long as the dropdown is open.
//
// These helpers let the dropdown forward what it cannot consume itself back to
// the container it visually belongs to.

const SCROLLABLE_OVERFLOW = /^(auto|scroll|overlay)$/

// Sub-pixel scroll heights are common, so treat "within a pixel of the end" as
// the end — otherwise the last fraction of a pixel swallows the event forever.
const END_OF_SCROLL_TOLERANCE = 1

export type ScrollAxis = 'x' | 'y'

export function isScrollable(el: HTMLElement, axis: ScrollAxis): boolean {
  const style = getComputedStyle(el)
  const overflow = axis === 'y' ? style.overflowY : style.overflowX
  if (!SCROLLABLE_OVERFLOW.test(overflow)) return false

  return axis === 'y' ? el.scrollHeight > el.clientHeight : el.scrollWidth > el.clientWidth
}

/**
 * Whether `el` can still move in the direction `delta` points, so a scroll that
 * has already bottomed out is passed on instead of being silently absorbed.
 */
export function canScrollFurther(el: HTMLElement, delta: number, axis: ScrollAxis): boolean {
  if (delta === 0) return false

  const offset = axis === 'y' ? el.scrollTop : el.scrollLeft
  const max =
    axis === 'y' ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth

  return delta < 0 ? offset > 0 : offset < max - END_OF_SCROLL_TOLERANCE
}

/**
 * Nearest scrolling ancestor of `start`, stopping at <body>: the document itself
 * is reachable by the browser's own chaining and needs no help from us.
 */
export function findScrollableAncestor(
  start: HTMLElement | null,
  axis: ScrollAxis,
): HTMLElement | null {
  let el = start?.parentElement ?? null

  while (el && el !== document.body && el !== document.documentElement) {
    if (isScrollable(el, axis)) return el
    el = el.parentElement
  }

  return null
}

// Wheel deltas arrive in pixels, lines or pages depending on the input device.
const LINE_HEIGHT = 16
const PAGE_HEIGHT_FALLBACK = 400

export function normalizeWheelDelta(event: WheelEvent, viewportSize: number): number {
  if (event.deltaMode === 1) return event.deltaY * LINE_HEIGHT
  if (event.deltaMode === 2) return event.deltaY * (viewportSize || PAGE_HEIGHT_FALLBACK)

  return event.deltaY
}
