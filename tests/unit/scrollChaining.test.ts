// ============================================================
// scrollChaining utils tests
// ============================================================

import { describe, it, expect, afterEach } from 'vitest'
import {
  isScrollable,
  canScrollFurther,
  findScrollableAncestor,
  normalizeWheelDelta,
} from '../../src/utils/scrollChaining'

// jsdom reports 0 for every layout metric, so the sizes have to be defined.
function sized(el: HTMLElement, metrics: Partial<Record<string, number>>) {
  Object.entries(metrics).forEach(([key, value]) => {
    Object.defineProperty(el, key, { value, configurable: true })
  })
  return el
}

function makeElement(overflowY: string, metrics: Record<string, number>) {
  const el = document.createElement('div')
  el.style.overflowY = overflowY
  document.body.appendChild(el)
  return sized(el, metrics)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('isScrollable', () => {
  it('is true for auto/scroll/overlay with overflowing content', () => {
    ;['auto', 'scroll', 'overlay'].forEach((overflow) => {
      const el = makeElement(overflow, { scrollHeight: 500, clientHeight: 200 })
      expect(isScrollable(el, 'y')).toBe(true)
    })
  })

  it('is false when the content fits', () => {
    const el = makeElement('auto', { scrollHeight: 200, clientHeight: 200 })
    expect(isScrollable(el, 'y')).toBe(false)
  })

  it('is false for hidden and visible, however tall the content', () => {
    ;['hidden', 'visible'].forEach((overflow) => {
      const el = makeElement(overflow, { scrollHeight: 500, clientHeight: 200 })
      expect(isScrollable(el, 'y')).toBe(false)
    })
  })
})

describe('canScrollFurther', () => {
  it('is false at the top when scrolling up', () => {
    const el = makeElement('auto', { scrollHeight: 500, clientHeight: 200, scrollTop: 0 })
    expect(canScrollFurther(el, -50, 'y')).toBe(false)
  })

  it('is true at the top when scrolling down', () => {
    const el = makeElement('auto', { scrollHeight: 500, clientHeight: 200, scrollTop: 0 })
    expect(canScrollFurther(el, 50, 'y')).toBe(true)
  })

  it('is false at the bottom when scrolling down', () => {
    const el = makeElement('auto', { scrollHeight: 500, clientHeight: 200, scrollTop: 300 })
    expect(canScrollFurther(el, 50, 'y')).toBe(false)
  })

  it('treats being within a pixel of the end as the end', () => {
    const el = makeElement('auto', { scrollHeight: 500, clientHeight: 200, scrollTop: 299.5 })
    expect(canScrollFurther(el, 50, 'y')).toBe(false)
  })

  it('is false for a zero delta', () => {
    const el = makeElement('auto', { scrollHeight: 500, clientHeight: 200, scrollTop: 100 })
    expect(canScrollFurther(el, 0, 'y')).toBe(false)
  })
})

describe('findScrollableAncestor', () => {
  it('finds the nearest scrolling ancestor', () => {
    const outer = makeElement('auto', { scrollHeight: 900, clientHeight: 300 })
    const middle = document.createElement('div')
    const inner = document.createElement('div')
    outer.appendChild(middle)
    middle.appendChild(inner)

    expect(findScrollableAncestor(inner, 'y')).toBe(outer)
  })

  it('skips ancestors whose content fits', () => {
    const scroller = makeElement('auto', { scrollHeight: 900, clientHeight: 300 })
    const fits = document.createElement('div')
    fits.style.overflowY = 'auto'
    sized(fits, { scrollHeight: 100, clientHeight: 100 })
    const inner = document.createElement('div')
    scroller.appendChild(fits)
    fits.appendChild(inner)

    expect(findScrollableAncestor(inner, 'y')).toBe(scroller)
  })

  it('returns null when only the document scrolls — the browser handles that', () => {
    const plain = document.createElement('div')
    document.body.appendChild(plain)
    const inner = document.createElement('div')
    plain.appendChild(inner)

    expect(findScrollableAncestor(inner, 'y')).toBeNull()
  })

  it('returns null for a null start', () => {
    expect(findScrollableAncestor(null, 'y')).toBeNull()
  })
})

describe('normalizeWheelDelta', () => {
  it('passes pixel deltas through unchanged', () => {
    expect(normalizeWheelDelta({ deltaMode: 0, deltaY: 120 } as WheelEvent, 500)).toBe(120)
  })

  it('converts line deltas', () => {
    expect(normalizeWheelDelta({ deltaMode: 1, deltaY: 3 } as WheelEvent, 500)).toBe(48)
  })

  it('converts page deltas using the viewport size', () => {
    expect(normalizeWheelDelta({ deltaMode: 2, deltaY: 1 } as WheelEvent, 500)).toBe(500)
  })

  it('falls back to a fixed page height when the viewport size is unknown', () => {
    expect(normalizeWheelDelta({ deltaMode: 2, deltaY: 1 } as WheelEvent, 0)).toBe(400)
  })
})
