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

  // The sync variant stops the scope before an async body has run, which would
  // dispose the isOpen watcher before it ever fires.
  async function runInScopeAsync(fn: () => Promise<void>): Promise<void> {
    const scope = effectScope()
    await scope.run(fn)
    scope.stop()
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

  // Regression: teleporting the dropdown to <body> severs it from the scroll
  // container the select lives in, so a wheel over the dropdown used to chain to
  // <body> — overflow:hidden in most app shells — and freeze the page.
  describe('wheel scroll chaining for teleported dropdowns', () => {
    function sized(el: HTMLElement, metrics: Record<string, number>) {
      Object.entries(metrics).forEach(([key, value]) => {
        Object.defineProperty(el, key, { value, writable: true, configurable: true })
      })
      return el
    }

    /**
     * Mirrors the real DOM: an app scroll container holding the select, and a
     * dropdown teleported out to <body>.
     */
    function buildScene({ choicesScrollTop = 0 } = {}) {
      const container = document.createElement('div')
      container.style.overflowY = 'auto'
      sized(container, { scrollHeight: 1000, clientHeight: 400, scrollTop: 0 })
      document.body.appendChild(container)

      const root = document.createElement('div')
      root.getBoundingClientRect = vi.fn(() => ({
        top: 100, bottom: 150, left: 50, right: 250, width: 200, height: 50,
        x: 50, y: 100, toJSON: () => {},
      })) as any
      container.appendChild(root)

      const dropdown = document.createElement('div')
      const choices = document.createElement('div')
      choices.style.overflowY = 'auto'
      sized(choices, { scrollHeight: 2000, clientHeight: 240, scrollTop: choicesScrollTop })
      dropdown.appendChild(choices)
      document.body.appendChild(dropdown) // teleported, NOT inside container

      return { container, root, dropdown, choices }
    }

    function wheelOn(target: HTMLElement, deltaY: number) {
      const event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true })
      target.dispatchEvent(event)
      return event
    }

    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('forwards to the select\'s container once the choices list is exhausted', async () => {
      // Choices already scrolled to the bottom: 2000 - 240 = 1760.
      const { container, root, dropdown, choices } = buildScene({ choicesScrollTop: 1760 })
      const opts = makeOpts({ position: 'down', appendToBody: true })
      opts.rootRef.value = root
      opts.dropdownRef.value = dropdown

      await runInScopeAsync(async () => {
        useSelectPositioning(opts)
        opts.isOpen.value = true
        await nextTick()
        await nextTick()

        const event = wheelOn(choices, 100)

        expect(event.defaultPrevented).toBe(true)
        expect(container.scrollTop).toBe(100)
      })
    })

    it('leaves the scroll to the choices list while it can still move', async () => {
      const { container, root, dropdown, choices } = buildScene({ choicesScrollTop: 0 })
      const opts = makeOpts({ position: 'down', appendToBody: true })
      opts.rootRef.value = root
      opts.dropdownRef.value = dropdown

      await runInScopeAsync(async () => {
        useSelectPositioning(opts)
        opts.isOpen.value = true
        await nextTick()
        await nextTick()

        const event = wheelOn(choices, 100)

        expect(event.defaultPrevented).toBe(false)
        expect(container.scrollTop).toBe(0)
      })
    })

    it('does not bridge when the dropdown is rendered in place', async () => {
      const { container, root, dropdown, choices } = buildScene({ choicesScrollTop: 1760 })
      const opts = makeOpts({ position: 'down', appendToBody: false })
      opts.rootRef.value = root
      opts.dropdownRef.value = dropdown

      await runInScopeAsync(async () => {
        useSelectPositioning(opts)
        opts.isOpen.value = true
        await nextTick()
        await nextTick()

        const event = wheelOn(choices, 100)

        // Native chaining already reaches the container; we must not double-scroll.
        expect(event.defaultPrevented).toBe(false)
        expect(container.scrollTop).toBe(0)
      })
    })

    it('stops bridging once the dropdown closes', async () => {
      const { container, root, dropdown, choices } = buildScene({ choicesScrollTop: 1760 })
      const opts = makeOpts({ position: 'down', appendToBody: true })
      opts.rootRef.value = root
      opts.dropdownRef.value = dropdown

      await runInScopeAsync(async () => {
        useSelectPositioning(opts)
        opts.isOpen.value = true
        await nextTick()
        await nextTick()

        opts.isOpen.value = false
        await nextTick()

        wheelOn(choices, 100)
        expect(container.scrollTop).toBe(0)
      })
    })
  })
})
