// ============================================================
// Listener / timer / observer hygiene.
//
// Spies on EventTarget.prototype.addEventListener/removeEventListener and
// asserts symmetric add/remove for every listener the library manages by hand
// across the full lifecycle — including unmounting while the dropdown is open,
// the path most likely to strand listeners.
//
// Only manually-managed event names are counted. Template listeners (@click,
// @keydown, …) are attached by Vue and dropped with the element on unmount;
// Vue never calls removeEventListener for them, so counting those would fail
// for reasons that are not leaks.
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import UiSelect from '../../src/components/UiSelect.vue'
import UiSelectMatch from '../../src/components/UiSelectMatch.vue'
import UiSelectChoices from '../../src/components/UiSelectChoices.vue'

const people = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

// The listeners the library adds by hand (grep for addEventListener in src/),
// keyed by the exact target class they are registered on. Template listeners
// (e.g. the dropdown's own @mousedown) also hit the prototype spy but are
// Vue-managed — attached per element and discarded with it — so counting them
// per target class keeps them out of the ledger:
//   window:   'scroll' (capture), 'resize'          — useSelectPositioning
//   element:  'wheel' on the teleported dropdown    — useSelectPositioning
//   document: 'mousedown', 'touchstart'             — UiSelect click-outside
//   element:  'focusout' on the root                — UiSelect validator events
function managedKey(target: unknown, type: string): string | null {
  if (target === window && (type === 'scroll' || type === 'resize')) return `window:${type}`
  if (target === document && (type === 'mousedown' || type === 'touchstart')) return `document:${type}`
  if (target !== window && target !== document && (type === 'wheel' || type === 'focusout')) {
    return `element:${type}`
  }
  return null
}

type Ledger = Map<string, number>

let added: Ledger
let removed: Ledger

// jsdom gives window and document their OWN addEventListener, so a prototype
// patch alone never sees window:scroll — all three surfaces must be wrapped.
const surfaces: Array<{ obj: any; add: any; remove: any }> = []

function bump(ledger: Ledger, target: unknown, type: string) {
  const key = managedKey(target, type)
  if (!key) return
  ledger.set(key, (ledger.get(key) ?? 0) + 1)
}

function patch(obj: any) {
  const add = obj.addEventListener
  const remove = obj.removeEventListener
  surfaces.push({ obj, add, remove })
  obj.addEventListener = function (type: string, ...rest: any[]) {
    bump(added, this, type)
    return add.call(this, type, ...rest)
  }
  obj.removeEventListener = function (type: string, ...rest: any[]) {
    bump(removed, this, type)
    return remove.call(this, type, ...rest)
  }
}

beforeEach(() => {
  added = new Map()
  removed = new Map()
  patch(window)
  patch(document)
  patch(EventTarget.prototype)
})

afterEach(() => {
  while (surfaces.length) {
    const { obj, add, remove } = surfaces.pop()!
    obj.addEventListener = add
    obj.removeEventListener = remove
  }
  document.body.innerHTML = ''
})

function mountSelect(selectProps: Record<string, any> = {}) {
  return mount(
    defineComponent({
      setup() {
        const model = ref(null)
        return { model }
      },
      render() {
        return h(
          UiSelect,
          {
            modelValue: this.model,
            'onUpdate:modelValue': (v: any) => { this.model = v },
            searchEnabled: true,
            appendToBody: true,
            ...selectProps,
          },
          {
            default: () => [
              h(UiSelectMatch, { placeholder: 'Pick...' }),
              h(UiSelectChoices, { items: people, trackBy: 'id', searchFields: ['name'] },
                { choice: ({ item }: any) => item?.name }),
            ],
          },
        )
      },
    }),
    { attachTo: document.body },
  )
}

function assertBalanced() {
  for (const [key, addCount] of added) {
    expect(removed.get(key) ?? 0, `listener imbalance for ${key}`).toBe(addCount)
  }
}

describe('listener hygiene', () => {
  it('open -> close -> unmount leaves no managed listener behind', async () => {
    const wrapper = mountSelect()
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    expect(document.querySelector('[data-ui-select-dropdown]')).toBeTruthy()

    // Interact enough to arm everything: search, wheel bridge, repositioning.
    const input = document.querySelector('.ui-select__input') as HTMLInputElement
    input.value = 'al'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    await wrapper.find('.ui-select-match').trigger('click') // toggle closed
    await nextTick()
    wrapper.unmount()
    await nextTick()

    assertBalanced()
  })

  it('unmounting while the dropdown is OPEN still removes everything', async () => {
    const wrapper = mountSelect()
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    expect(document.querySelector('[data-ui-select-dropdown]')).toBeTruthy()

    wrapper.unmount()
    await nextTick()

    assertBalanced()
  })

  it('repeated open/close cycles do not accumulate listeners', async () => {
    const wrapper = mountSelect()
    for (let cycle = 0; cycle < 4; cycle++) {
      await wrapper.find('.ui-select-match').trigger('click')
      await nextTick()
      await wrapper.find('.ui-select-match').trigger('click')
      await nextTick()
    }
    wrapper.unmount()
    await nextTick()

    assertBalanced()
    // Sanity: the cycles really did register (4 opens = 4 scroll listeners).
    expect(added.get('window:scroll') ?? 0).toBeGreaterThanOrEqual(4)
  })

  it('a pending debounced search emit dies with the component', async () => {
    vi.useFakeTimers()
    const searchEvents: string[] = []
    const wrapper = mount(
      defineComponent({
        render() {
          return h(UiSelect, {
            modelValue: null,
            searchEnabled: true,
            debounce: 300,
            onSearch: (t: string) => searchEvents.push(t),
          }, {
            default: () => [
              h(UiSelectMatch, { placeholder: 'Pick...' }),
              h(UiSelectChoices, { items: people, trackBy: 'id' },
                { choice: ({ item }: any) => item?.name }),
            ],
          })
        },
      }),
      { attachTo: document.body },
    )

    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    const input = document.querySelector('.ui-select__input') as HTMLInputElement
    input.value = 'alb'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    wrapper.unmount()
    // Vue's <Transition> leave fallback may still hold a timer of its own, so
    // don't assert a raw timer count — assert OUR timer is dead: however far
    // the clock advances, the pending term never fires.
    vi.advanceTimersByTime(60_000)
    expect(searchEvents).toEqual([])
    vi.useRealTimers()
  })

  it('a queued reposition frame is cancelled on close', async () => {
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame')
    const wrapper = mountSelect()
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()

    // Queue a reposition (capture-phase window scroll), then close before rAF fires.
    window.dispatchEvent(new Event('scroll'))
    wrapper.unmount()
    await nextTick()

    expect(cancelSpy).toHaveBeenCalled()
    cancelSpy.mockRestore()
  })

  it('the ResizeObserver watching the dropdown is disconnected', async () => {
    const disconnect = vi.fn()
    const RealRO = globalThis.ResizeObserver
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect = disconnect
    } as any

    const wrapper = mountSelect()
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    wrapper.unmount()
    await nextTick()

    expect(disconnect).toHaveBeenCalled()
    globalThis.ResizeObserver = RealRO
  })
})
