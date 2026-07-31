// ============================================================
// `debounce` prop — delays the `search` emit, never the filtering
//
// Replaces the never-implemented `refresh-delay`, whose name came from the
// AngularJS ui-select `refresh` attribute that this library does not port.
// ============================================================

import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import UiSelect from '../../src/components/UiSelect.vue'
import UiSelectMatch from '../../src/components/UiSelectMatch.vue'
import UiSelectChoices from '../../src/components/UiSelectChoices.vue'

const people = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Albert' },
  { id: 3, name: 'Bob' },
]

function mountSelect(selectProps: Record<string, any> = {}) {
  const searchEvents: string[] = []

  const wrapper = mount(
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
            onSearch: (term: string) => searchEvents.push(term),
            ...selectProps,
          },
          {
            default: () => [
              h(UiSelectMatch, { placeholder: 'Select...' }),
              h(UiSelectChoices, { items: people, trackBy: 'id', searchFields: ['name'] }),
            ],
          },
        )
      },
    }),
    { attachTo: document.body },
  )

  return { wrapper, searchEvents }
}

async function openAndType(wrapper: any, terms: string[], gapMs: number) {
  await wrapper.find('.ui-select-match').trigger('click')
  await nextTick()

  const input = wrapper.find('input.ui-select__input')
  for (const term of terms) {
    await input.setValue(term)
    vi.advanceTimersByTime(gapMs)
    await nextTick()
  }
  return input
}

afterEach(() => {
  vi.useRealTimers()
})

describe('debounce prop', () => {
  it('emits on every keystroke when omitted', async () => {
    vi.useFakeTimers()
    const { wrapper, searchEvents } = mountSelect()

    await openAndType(wrapper, ['A', 'Al', 'Alb'], 10)

    expect(searchEvents).toEqual(['A', 'Al', 'Alb'])
    wrapper.unmount()
  })

  it('collapses a burst of keystrokes into a single emit', async () => {
    vi.useFakeTimers()
    const { wrapper, searchEvents } = mountSelect({ debounce: 300 })

    await openAndType(wrapper, ['A', 'Al', 'Alb'], 10)
    expect(searchEvents).toEqual([]) // nothing yet

    vi.advanceTimersByTime(300)
    await nextTick()

    expect(searchEvents).toEqual(['Alb']) // only the final term
    wrapper.unmount()
  })

  it('emits again once the user pauses between bursts', async () => {
    vi.useFakeTimers()
    const { wrapper, searchEvents } = mountSelect({ debounce: 200 })

    await openAndType(wrapper, ['A'], 0)
    vi.advanceTimersByTime(200)
    await nextTick()

    const input = wrapper.find('input.ui-select__input')
    await input.setValue('Bo')
    vi.advanceTimersByTime(200)
    await nextTick()

    expect(searchEvents).toEqual(['A', 'Bo'])
    wrapper.unmount()
  })

  it('leaves filtering instant — the list narrows before the emit fires', async () => {
    vi.useFakeTimers()
    const { wrapper, searchEvents } = mountSelect({ debounce: 300 })

    await openAndType(wrapper, ['Bo'], 10)

    // Debounced emit still pending...
    expect(searchEvents).toEqual([])
    // ...but the list has already filtered to the single match.
    expect(wrapper.findAll('[data-ui-select-choice-index]')).toHaveLength(1)
    expect(wrapper.text()).toContain('Bob')

    wrapper.unmount()
  })

  it('drops the pending term when the dropdown closes, reporting the reset instead', async () => {
    vi.useFakeTimers()
    const { wrapper, searchEvents } = mountSelect({ debounce: 300 })

    await openAndType(wrapper, ['Alb'], 10)
    expect(searchEvents).toEqual([])

    // Closing resets the search text. The stale term must never arrive; the
    // reset itself is reported at once so consumers can clear their results.
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(searchEvents).toEqual([''])

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(searchEvents).toEqual(['']) // 'Alb' never fires
    wrapper.unmount()
  })

  it('emits an emptied search immediately rather than waiting out the delay', async () => {
    vi.useFakeTimers()
    const { wrapper, searchEvents } = mountSelect({ debounce: 300 })

    await openAndType(wrapper, ['Alb'], 10)
    expect(searchEvents).toEqual([])

    const input = wrapper.find('input.ui-select__input')
    await input.setValue('')
    await nextTick()

    expect(searchEvents).toEqual([''])
    wrapper.unmount()
  })

  it('drops a pending emit when the component unmounts', async () => {
    vi.useFakeTimers()
    const { wrapper, searchEvents } = mountSelect({ debounce: 300 })

    await openAndType(wrapper, ['Alb'], 10)
    wrapper.unmount()

    vi.advanceTimersByTime(1000)
    expect(searchEvents).toEqual([])
  })
})
