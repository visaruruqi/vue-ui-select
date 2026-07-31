// ============================================================
// Regression tests for the pre-0.5.0 audit fixes. Each block names the defect
// it pins; every one failed against the unfixed code.
// ============================================================

import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, shallowRef, effectScope } from 'vue'
import UiSelect from '../../src/components/UiSelect.vue'
import UiSelectMatch from '../../src/components/UiSelectMatch.vue'
import UiSelectChoices from '../../src/components/UiSelectChoices.vue'
import { highlightText } from '../../src/utils/highlight'
import { useModelBinding } from '../../src/composables/useModelBinding'
import { useSelectFiltering } from '../../src/composables/useSelectFiltering'

const people = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

function mountSelect(
  selectProps: Record<string, any> = {},
  choicesProps: Record<string, any> = {},
  choicesSlots: Record<string, any> = {},
) {
  return mount(
    defineComponent({
      setup() {
        const model = ref(selectProps.modelValue ?? null)
        return { model }
      },
      render() {
        return h(
          UiSelect,
          {
            modelValue: this.model,
            'onUpdate:modelValue': (v: any) => { this.model = v },
            ...selectProps,
          },
          {
            default: () => [
              h(UiSelectMatch, { placeholder: 'Pick...' }),
              h(UiSelectChoices, {
                items: choicesProps.items ?? people,
                trackBy: choicesProps.trackBy ?? 'id',
                searchFields: ['name'],
                ...choicesProps,
              }, {
                choice: ({ item }: any) => item?.name ?? String(item),
                ...choicesSlots,
              }),
            ],
          },
        )
      },
    }),
    { attachTo: document.body },
  )
}

afterEach(() => {
  document.body.innerHTML = ''
})

// ------------------------------------------------------------
// Fix: highlightText matched on escaped text, corrupting entities
// ------------------------------------------------------------
describe('highlightText escapes after matching, not before', () => {
  it('does not match search terms inside HTML entities', () => {
    expect(highlightText('AT&T', 'amp')).toBe('AT&amp;T')
    expect(highlightText('a<b', 'lt')).toBe('a&lt;b')
  })

  it('matches search terms that contain escapable characters', () => {
    expect(highlightText('AT&T', 'AT&T')).toBe('<mark>AT&amp;T</mark>')
    expect(highlightText('say "hi"', '"hi"')).toBe('say <mark>&quot;hi&quot;</mark>')
  })

  it('still escapes markup in the text itself', () => {
    expect(highlightText('<script>', 'scr')).toBe('&lt;<mark>scr</mark>ipt&gt;')
  })

  it('keeps plain matching and case preservation intact', () => {
    expect(highlightText('Alice', 'li')).toBe('A<mark>li</mark>ce')
    expect(highlightText('ALICE', 'li')).toBe('A<mark>LI</mark>CE')
  })
})

// ------------------------------------------------------------
// Fix: single+searchEnabled was keyboard-unreachable (tabindex -1,
// input only exists while open)
// ------------------------------------------------------------
describe('keyboard reachability', () => {
  it('single searchable select is tabbable at the root', async () => {
    const wrapper = mountSelect({ searchEnabled: true })
    await nextTick()
    expect(wrapper.find('[data-ui-select]').attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('multiple searchable select delegates the tab stop to its match input', async () => {
    const wrapper = mountSelect({ searchEnabled: true, multiple: true })
    await nextTick()
    expect(wrapper.find('[data-ui-select]').attributes('tabindex')).toBe('-1')
    expect(wrapper.find('.ui-select-match__search-input').exists()).toBe(true)
    wrapper.unmount()
  })

  it('ArrowDown on the focused root opens the dropdown', async () => {
    const wrapper = mountSelect({ searchEnabled: true })
    const root = wrapper.find('[data-ui-select]')
    await root.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.querySelector('[data-ui-select-dropdown]')).toBeTruthy()
    wrapper.unmount()
  })
})

// ------------------------------------------------------------
// Fix: Escape / selection dropped focus to <body> in single mode
// ------------------------------------------------------------
describe('focus returns to the root when the dropdown closes', () => {
  async function openSingle(wrapper: any) {
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    const input = document.querySelector('.ui-select__input') as HTMLInputElement
    input?.focus()
    return input
  }

  it('after Escape', async () => {
    const wrapper = mountSelect({ searchEnabled: true })
    const input = await openSingle(wrapper)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(wrapper.find('[data-ui-select]').element)
    wrapper.unmount()
  })

  it('after selecting an option by click', async () => {
    const wrapper = mountSelect({ searchEnabled: true })
    await openSingle(wrapper)
    const row = document.querySelector('[data-ui-select-choice]') as HTMLElement
    row.click()
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(wrapper.find('[data-ui-select]').element)
    wrapper.unmount()
  })
})

// ------------------------------------------------------------
// Fix: dropdown-wide mousedown.prevent killed caret placement in
// the single-mode search box
// ------------------------------------------------------------
describe('dropdown mousedown handling', () => {
  it('keeps the default action inside the search box', async () => {
    const wrapper = mountSelect({ searchEnabled: true })
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()

    const input = document.querySelector('.ui-select__input') as HTMLInputElement
    const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    input.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('still prevents it on option rows so the input keeps focus', async () => {
    const wrapper = mountSelect({ searchEnabled: true })
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()

    const row = document.querySelector('[data-ui-select-choice]') as HTMLElement
    const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    row.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
    wrapper.unmount()
  })
})

// ------------------------------------------------------------
// Fix: the "(new)" tag row was implemented but never rendered
// ------------------------------------------------------------
describe('tagging "(new)" row', () => {
  it('renders for a novel search term and creates the tag on click', async () => {
    const wrapper = mountSelect(
      { searchEnabled: true, multiple: true, tagging: true },
      { items: ['red', 'green'], trackBy: undefined, searchFields: [] },
    )
    const input = wrapper.find('.ui-select-match__search-input')
    await input.trigger('click')
    await input.setValue('blue')
    await nextTick()

    const row = document.querySelector('[data-ui-select-tag-row]') as HTMLElement
    expect(row).toBeTruthy()
    expect(row.textContent).toContain('blue (new)')

    row.click()
    await nextTick()
    expect(wrapper.findComponent(UiSelect).props('modelValue')).toEqual(['blue'])
    wrapper.unmount()
  })

  it('does not render when the term already exists', async () => {
    const wrapper = mountSelect(
      { searchEnabled: true, multiple: true, tagging: true },
      { items: ['red', 'green'], trackBy: undefined, searchFields: [] },
    )
    const input = wrapper.find('.ui-select-match__search-input')
    await input.trigger('click')
    await input.setValue('red')
    await nextTick()

    expect(document.querySelector('[data-ui-select-tag-row]')).toBeNull()
    wrapper.unmount()
  })

  it('honours taggingLabel=false by showing the bare term', async () => {
    const wrapper = mountSelect(
      { searchEnabled: true, multiple: true, tagging: true, taggingLabel: false },
      { items: ['red'], trackBy: undefined, searchFields: [] },
    )
    const input = wrapper.find('.ui-select-match__search-input')
    await input.trigger('click')
    await input.setValue('blue')
    await nextTick()

    expect(document.querySelector('[data-ui-select-tag-row]')?.textContent?.trim()).toBe('blue')
    wrapper.unmount()
  })
})

// ------------------------------------------------------------
// Fix: minimum-length message was hardcoded English
// ------------------------------------------------------------
describe('minimum-length message localization', () => {
  it('exposes a slot with the remaining count', async () => {
    const wrapper = mountSelect(
      { searchEnabled: true },
      { minimumInputLength: 3 },
      { 'minimum-length': ({ remaining }: any) => `Още ${remaining} знака` },
    )
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    const input = document.querySelector('.ui-select__input') as HTMLInputElement
    input.value = 'a'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    expect(document.querySelector('[data-ui-select-minimum-length]')?.textContent)
      .toContain('Още 2 знака')
    wrapper.unmount()
  })
})

// ------------------------------------------------------------
// Fix: groupFilter array form silently dropped ungrouped items
// ------------------------------------------------------------
describe('groupFilter keeps ungrouped items in both forms', () => {
  const mixed = [
    { id: 1, name: 'A', country: 'US' },
    { id: 2, name: 'B', country: 'UK' },
    { id: 3, name: 'C' },
  ]

  function run(groupFilter: any) {
    let labels: any[] = []
    let names: string[] = []
    const scope = effectScope()
    scope.run(() => {
      // shallowRef: a deep ref would unwrap the nested config refs.
      const { groupedItems } = useSelectFiltering({
        search: ref(''),
        choicesConfig: shallowRef({
          items: ref(mixed),
          trackBy: ref('id'),
          bindProperty: ref(undefined),
          searchFields: ref(['name']),
          filterFn: ref(undefined),
          groupBy: ref('country'),
          groupFilter: ref(groupFilter),
          disableChoice: ref(undefined),
          sortFn: ref(undefined),
          minimumInputLength: ref(0),
        } as any),
        isItemSelected: () => false,
        removeSelected: ref(false),
      })
      labels = groupedItems.value.map((g) => g.label)
      names = groupedItems.value.flatMap((g) => g.items.map((i: any) => i.name))
    })
    scope.stop()
    return { labels, names }
  }

  it('array form keeps them, sorted last', () => {
    const { labels, names } = run(['UK', 'US'])
    expect(labels).toEqual(['UK', 'US', undefined])
    expect(names).toContain('C')
  })

  it('function form keeps them too', () => {
    const { names } = run((groups: string[]) => groups)
    expect(names).toContain('C')
  })
})

// ------------------------------------------------------------
// Fix: multiple+bindProperty duplicated object-valued keys
// ------------------------------------------------------------
describe('useModelBinding with object-valued bindProperty', () => {
  it('hydrates each model value exactly once', () => {
    const scope = effectScope()
    scope.run(() => {
      const model = useModelBinding({
        modelValue: ref([{ region: 'us', n: 1 }]),
        multiple: ref(true),
        trackBy: ref(undefined),
        bindProperty: ref('code'),
        rawItems: ref([{ code: { region: 'us', n: 1 }, name: 'One' }]),
        emit: vi.fn(),
      })
      expect(model.selected.value).toHaveLength(1)
      expect(model.selected.value[0].name).toBe('One')
    })
    scope.stop()
  })
})

// ------------------------------------------------------------
// Fix: object items with no search-fields matched against EVERY field,
// silently re-filtering remote results. They now pass through.
// ------------------------------------------------------------
describe('no search-fields on object items means no client filtering', () => {
  it('objects pass through untouched (remote shape)', async () => {
    const wrapper = mountSelect(
      { searchEnabled: true },
      { items: [{ id: 9, name: 'Marriott' }], trackBy: 'id', searchFields: undefined },
    )
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    const input = document.querySelector('.ui-select__input') as HTMLInputElement
    // A term the row does NOT contain — as a code/fuzzy backend would answer.
    input.value = 'hil'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    expect(document.querySelector('[data-ui-select-choice]')?.textContent).toContain('Marriott')
    wrapper.unmount()
  })

  it('declared search-fields still filter', async () => {
    const wrapper = mountSelect({ searchEnabled: true })
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    const input = document.querySelector('.ui-select__input') as HTMLInputElement
    input.value = 'ali'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    const rows = [...document.querySelectorAll('[data-ui-select-choice]')]
    expect(rows).toHaveLength(1)
    expect(rows[0].textContent).toContain('Alice')
    wrapper.unmount()
  })

  it('primitive items still filter by value with no config', async () => {
    const wrapper = mountSelect(
      { searchEnabled: true },
      { items: ['red', 'green', 'grey'], trackBy: undefined, searchFields: undefined },
    )
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    const input = document.querySelector('.ui-select__input') as HTMLInputElement
    input.value = 'gr'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    const texts = [...document.querySelectorAll('[data-ui-select-choice]')].map(n => n.textContent?.trim())
    expect(texts).toEqual(['green', 'grey'])
    wrapper.unmount()
  })

  it('an explicit filter-fn still wins over everything', async () => {
    const wrapper = mountSelect(
      { searchEnabled: true },
      { filterFn: (item: any) => item.id === 2 },
    )
    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    const input = document.querySelector('.ui-select__input') as HTMLInputElement
    input.value = 'anything'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    const texts = [...document.querySelectorAll('[data-ui-select-choice]')].map(n => n.textContent?.trim())
    expect(texts).toEqual(['Bob'])
    wrapper.unmount()
  })
})

// ------------------------------------------------------------
// Fix: dead props removed (refresh-delay class)
// ------------------------------------------------------------
describe('dead props are gone', () => {
  it('UiSelectChoices no longer declares sourceType or groupSelectable', () => {
    const declared = Object.keys((UiSelectChoices as any).props)
    expect(declared).not.toContain('sourceType')
    expect(declared).not.toContain('groupSelectable')
  })
})
