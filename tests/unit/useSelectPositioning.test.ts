// ============================================================
// useSelectPositioning composable tests
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick, effectScope } from 'vue'

// Mock lifecycle hooks that require a component instance
vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  return { ...actual, onBeforeUnmount: vi.fn(), onMounted: vi.fn() }
})

import { useSelectPositioning } from '../../src/composables/useSelectPositioning'

function makeOpts(overrides: Record<string, any> = {}) {
  return {
    isOpen: ref(overrides.isOpen ?? false),
    appendToBody: ref(overrides.appendToBody ?? false),
    position: ref(overrides.position ?? 'auto'),
    rootRef: ref(overrides.rootRef ?? null),
    dropdownRef: ref(overrides.dropdownRef ?? null),
  }
}

describe('useSelectPositioning', () => {
  function runInScope<T>(fn: () => T): T {
    const scope = effectScope()
    const result = scope.run(fn)!
    scope.stop()
    return result
  }

  it('returns reactive resolvedPosition, teleportStyle, dropdownMaxHeight', () => {
    runInScope(() => {
      const { resolvedPosition, teleportStyle, dropdownMaxHeight } = useSelectPositioning(makeOpts())
      expect(resolvedPosition.value).toBe('down')
      expect(teleportStyle.value).toEqual({})
      expect(dropdownMaxHeight.value).toBeUndefined()
    })
  })

  it('resolves to "down" when position is "down"', () => {
    runInScope(() => {
      const opts = makeOpts({ position: 'down' })
      const rootEl = document.createElement('div')
      rootEl.getBoundingClientRect = vi.fn(() => ({
        top: 100, bottom: 150, left: 50, right: 250, width: 200, height: 50,
        x: 50, y: 100, toJSON: () => {},
      }))
      opts.rootRef.value = rootEl

      const { resolvedPosition, calculatePosition } = useSelectPositioning(opts)
      calculatePosition()
      expect(resolvedPosition.value).toBe('down')
    })
  })

  it('resolves to "up" when position is "up"', () => {
    runInScope(() => {
      const opts = makeOpts({ position: 'up' })
      const rootEl = document.createElement('div')
      rootEl.getBoundingClientRect = vi.fn(() => ({
        top: 100, bottom: 150, left: 50, right: 250, width: 200, height: 50,
        x: 50, y: 100, toJSON: () => {},
      }))
      opts.rootRef.value = rootEl

      const { resolvedPosition, calculatePosition } = useSelectPositioning(opts)
      calculatePosition()
      expect(resolvedPosition.value).toBe('up')
    })
  })

  it('sets dropdownMaxHeight when opening upward', () => {
    runInScope(() => {
      const opts = makeOpts({ position: 'up' })
      const rootEl = document.createElement('div')
      rootEl.getBoundingClientRect = vi.fn(() => ({
        top: 300, bottom: 350, left: 50, right: 250, width: 200, height: 50,
        x: 50, y: 300, toJSON: () => {},
      }))
      opts.rootRef.value = rootEl

      const { dropdownMaxHeight, calculatePosition } = useSelectPositioning(opts)
      calculatePosition()
      expect(dropdownMaxHeight.value).toBe('292px')
    })
  })

  it('does not set dropdownMaxHeight when opening downward', () => {
    runInScope(() => {
      const opts = makeOpts({ position: 'down' })
      const rootEl = document.createElement('div')
      rootEl.getBoundingClientRect = vi.fn(() => ({
        top: 100, bottom: 150, left: 50, right: 250, width: 200, height: 50,
        x: 50, y: 100, toJSON: () => {},
      }))
      opts.rootRef.value = rootEl

      const { dropdownMaxHeight, calculatePosition } = useSelectPositioning(opts)
      calculatePosition()
      expect(dropdownMaxHeight.value).toBeUndefined()
    })
  })

  it('calculates teleportStyle when appendToBody is true', () => {
    runInScope(() => {
      const opts = makeOpts({ position: 'down', appendToBody: true })
      const rootEl = document.createElement('div')
      rootEl.getBoundingClientRect = vi.fn(() => ({
        top: 100, bottom: 150, left: 50, right: 250, width: 200, height: 50,
        x: 50, y: 100, toJSON: () => {},
      }))
      opts.rootRef.value = rootEl

      const { teleportStyle, calculatePosition } = useSelectPositioning(opts)
      calculatePosition()
      expect(teleportStyle.value.position).toBe('absolute')
      expect(teleportStyle.value.width).toBe('200px')
      expect(teleportStyle.value.zIndex).toBe('9999')
    })
  })

  it('does not set teleportStyle when appendToBody is false', () => {
    runInScope(() => {
      const opts = makeOpts({ position: 'down', appendToBody: false })
      const rootEl = document.createElement('div')
      rootEl.getBoundingClientRect = vi.fn(() => ({
        top: 100, bottom: 150, left: 50, right: 250, width: 200, height: 50,
        x: 50, y: 100, toJSON: () => {},
      }))
      opts.rootRef.value = rootEl

      const { teleportStyle, calculatePosition } = useSelectPositioning(opts)
      calculatePosition()
      expect(teleportStyle.value).toEqual({})
    })
  })

  it('does nothing when rootRef is null', () => {
    runInScope(() => {
      const opts = makeOpts({ position: 'down' })
      const { resolvedPosition, calculatePosition } = useSelectPositioning(opts)
      const before = resolvedPosition.value
      calculatePosition()
      expect(resolvedPosition.value).toBe(before)
    })
  })
})
