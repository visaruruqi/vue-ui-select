// ============================================================
// Component integration tests — user-facing behavior contract
// ============================================================

import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import UiSelect from '../../src/components/UiSelect.vue'
import UiSelectMatch from '../../src/components/UiSelectMatch.vue'
import UiSelectChoices from '../../src/components/UiSelectChoices.vue'
import UiSelectNoChoice from '../../src/components/UiSelectNoChoice.vue'

// ---- Shared test data ----

const people = [
  { id: 1, name: 'Alice', email: 'alice@test.com', country: 'US', age: 25 },
  { id: 2, name: 'Bob', email: 'bob@test.com', country: 'UK', age: 30 },
  { id: 3, name: 'Charlie', email: 'charlie@test.com', country: 'US', age: 35 },
  { id: 4, name: 'Diana', email: 'diana@test.com', country: 'UK', age: 28 },
]

const colors = ['Red', 'Green', 'Blue', 'Yellow']

// ---- Mount helpers ----

function mountSelect(
  props: Record<string, any> = {},
  choicesProps: Record<string, any> = {},
  extra: { noChoice?: boolean; matchSlot?: any; choiceSlot?: any } = {},
) {
  return mount(
    defineComponent({
      setup() {
        const model = ref(props.modelValue ?? null)
        return { model }
      },
      render() {
        const children: any[] = [
          h(
            UiSelectMatch,
            { placeholder: props.placeholder ?? 'Select...' },
            {
              default: extra.matchSlot ?? (({ selected }: any) => selected?.name ?? (typeof selected === 'string' ? selected : '')),
              tag: ({ item, remove }: any) =>
                h('span', { class: 'tag', onClick: () => remove(item) }, item?.name ?? String(item)),
            },
          ),
          h(
            UiSelectChoices,
            {
              items: choicesProps.items ?? people,
              trackBy: choicesProps.trackBy ?? 'id',
              searchFields: choicesProps.searchFields ?? ['name'],
              ...choicesProps,
            },
            {
              choice: extra.choiceSlot ?? (({ item }: any) =>
                h('span', { class: 'choice-item' }, item?.name ?? String(item))),
            },
          ),
        ]

        if (extra.noChoice) {
          children.push(
            h(UiSelectNoChoice, {}, {
              default: () => h('div', { class: 'no-results' }, 'No results found'),
            })
          )
        }

        return h(
          UiSelect,
          {
            modelValue: this.model,
            'onUpdate:modelValue': (v: any) => { this.model = v },
            multiple: props.multiple ?? false,
            clearable: props.clearable ?? false,
            disabled: props.disabled ?? false,
            searchEnabled: props.searchEnabled ?? true,
            tagging: props.tagging ?? false,
            taggingTokens: props.taggingTokens ?? [','],
            removeSelected: props.removeSelected ?? true,
            loading: props.loading ?? false,
            placeholder: props.placeholder ?? '',
            limit: props.limit,
            closeOnSelect: props.closeOnSelect ?? true,
            lockChoice: props.lockChoice,
            ...props,
          },
          { default: () => children },
        )
      },
    }),
    { attachTo: document.body },
  )
}

function getRoot(wrapper: VueWrapper) {
  return wrapper.find('[data-ui-select]')
}

async function openDropdown(wrapper: VueWrapper) {
  const match = wrapper.find('[data-ui-select-match]')
  await match.trigger('click')
  await nextTick()
  await nextTick()
}

function getChoices(wrapper: VueWrapper) {
  return wrapper.findAll('[data-testid="ui-select-choice"]')
}

// ---- Tests ----

describe('Single select — selection contract', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('clicking a choice selects it and closes dropdown', async () => {
    const wrapper = mountSelect()
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    expect(choices.length).toBeGreaterThan(0)
    await choices[0].trigger('click')
    await nextTick()
    await nextTick()

    // Model should be updated
    expect((wrapper.vm as any).model).toEqual(people[0])
    // Dropdown should be closed (single mode, closeOnSelect = true)
    expect(wrapper.find('[data-testid="ui-select-dropdown"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('displays selected item text after selection', async () => {
    const wrapper = mountSelect({ modelValue: people[1] })
    expect(wrapper.text()).toContain('Bob')
    wrapper.unmount()
  })

  it('selecting a new item replaces the previous selection', async () => {
    // Use removeSelected: false so all items remain visible after first selection
    const wrapper = mountSelect({ removeSelected: false })
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    await choices[0].trigger('click')
    await nextTick()
    await nextTick()

    expect((wrapper.vm as any).model).toEqual(people[0])

    // Re-open and select another (Bob at index 1)
    await openDropdown(wrapper)
    const choices2 = getChoices(wrapper)
    await choices2[1].trigger('click')
    await nextTick()
    await nextTick()

    expect((wrapper.vm as any).model).toEqual(people[1])
    wrapper.unmount()
  })
})

describe('Single select — clear button', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('shows clear button when clearable and item selected', async () => {
    const wrapper = mountSelect({
      modelValue: people[0],
      clearable: true,
    })

    const clearBtn = wrapper.find('[data-testid="ui-select-clear"]')
    expect(clearBtn.exists()).toBe(true)
    wrapper.unmount()
  })

  it('does not show clear button when nothing is selected', () => {
    const wrapper = mountSelect({ clearable: true })
    expect(wrapper.find('[data-testid="ui-select-clear"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('clears selection on click', async () => {
    const wrapper = mountSelect({
      modelValue: people[0],
      clearable: true,
    })

    await wrapper.find('[data-testid="ui-select-clear"]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).model).toBeNull()
    wrapper.unmount()
  })

  it('emits remove and clear when the clear button is clicked', async () => {
    const onRemove = vi.fn()
    const onClear = vi.fn()
    const wrapper = mountSelect({
      modelValue: people[0],
      clearable: true,
      onRemove,
      onClear,
    })

    await wrapper.find('[data-testid="ui-select-clear"]').trigger('click')
    await nextTick()

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith({ item: people[0], model: null })
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onClear).toHaveBeenCalledWith({ items: [people[0]], model: null })
    wrapper.unmount()
  })

  it('emits remove and clear via the exposed clear() method', async () => {
    const onRemove = vi.fn()
    const onClear = vi.fn()
    const wrapper = mountSelect({
      modelValue: people[0],
      clearable: true,
      onRemove,
      onClear,
    })

    const select = wrapper.findComponent({ name: 'UiSelect' })
    // clear() is on the exposed API (template-ref surface), not the render context.
    ;(select.vm as any).$.exposed.clear()
    await nextTick()

    expect((wrapper.vm as any).model).toBeNull()
    expect(onRemove).toHaveBeenCalledWith({ item: people[0], model: null })
    expect(onClear).toHaveBeenCalledWith({ items: [people[0]], model: null })
    wrapper.unmount()
  })

  it('clear() on an empty selection emits nothing', async () => {
    const onRemove = vi.fn()
    const onClear = vi.fn()
    const wrapper = mountSelect({ clearable: true, onRemove, onClear })

    const select = wrapper.findComponent({ name: 'UiSelect' })
    ;(select.vm as any).$.exposed.clear()
    await nextTick()

    expect(onRemove).not.toHaveBeenCalled()
    expect(onClear).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('clearing by Backspace (empty search, clearable) emits remove and clear', async () => {
    const onRemove = vi.fn()
    const onClear = vi.fn()
    const wrapper = mountSelect({
      modelValue: people[0],
      clearable: true,
      onRemove,
      onClear,
    })

    await openDropdown(wrapper)
    const search = wrapper.find('[data-testid="ui-select-search"]')
    await search.trigger('keydown', { key: 'Backspace' })
    await nextTick()

    expect((wrapper.vm as any).model).toBeNull()
    expect(onRemove).toHaveBeenCalledWith({ item: people[0], model: null })
    expect(onClear).toHaveBeenCalledWith({ items: [people[0]], model: null })
    wrapper.unmount()
  })
})

describe('Disabled state', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('adds disabled class and data attribute', () => {
    const wrapper = mountSelect({ disabled: true })
    const root = getRoot(wrapper)
    expect(root.attributes('data-disabled')).toBeDefined()
    expect(root.classes()).toContain('ui-select--disabled')
    wrapper.unmount()
  })

  it('does not open dropdown when disabled', async () => {
    const wrapper = mountSelect({ disabled: true })
    await openDropdown(wrapper)
    expect(wrapper.find('[data-testid="ui-select-dropdown"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('Multiple select', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('renders tags for selected items', () => {
    const wrapper = mountSelect({
      modelValue: [people[0], people[1]],
      multiple: true,
    })
    const tags = wrapper.findAll('[data-testid="ui-select-tag"]')
    expect(tags.length).toBe(2)
    wrapper.unmount()
  })

  it('adds items to selection array on click', async () => {
    const wrapper = mountSelect({ modelValue: [], multiple: true })
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    await choices[0].trigger('click')
    await nextTick()
    await nextTick()

    const model = (wrapper.vm as any).model
    expect(model).toHaveLength(1)
    expect(model[0]).toEqual(people[0])
    wrapper.unmount()
  })

  it('shows built-in remove button on tags when no #tag slot is provided', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref([people[0]])
          return { model }
        },
        render() {
          return h(
            UiSelect,
            { modelValue: this.model, 'onUpdate:modelValue': (v: any) => { this.model = v }, multiple: true },
            {
              default: () => [
                h(UiSelectMatch, { placeholder: 'pick' }),
                h(UiSelectChoices, { items: people, trackBy: 'id' }, {
                  choice: ({ item }: any) => h('span', String(item.name)),
                }),
              ],
            }
          )
        },
      }),
      { attachTo: document.body }
    )
    const removeBtn = wrapper.find('[data-testid="ui-select-tag-remove"]')
    expect(removeBtn.exists()).toBe(true)
    wrapper.unmount()
  })

  it('omits built-in remove button when a #tag slot is provided (consumer owns remove UI)', () => {
    const wrapper = mountSelect({
      modelValue: [people[0]],
      multiple: true,
    })
    expect(wrapper.find('[data-testid="ui-select-tag-remove"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('does not show remove button when disabled', () => {
    const wrapper = mountSelect({
      modelValue: [people[0]],
      multiple: true,
      disabled: true,
    })
    expect(wrapper.find('[data-testid="ui-select-tag-remove"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('Search filtering', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('filters choices when typing in search input', async () => {
    const wrapper = mountSelect()
    await openDropdown(wrapper)

    const input = wrapper.find('[data-testid="ui-select-input"]')
    expect(input.exists()).toBe(true)

    // Type "ali" to filter
    await input.setValue('ali')
    await nextTick()

    const choices = getChoices(wrapper)
    expect(choices.length).toBe(1)
    expect(choices[0].text()).toContain('Alice')
    wrapper.unmount()
  })

  it('shows all items when search is cleared', async () => {
    const wrapper = mountSelect()
    await openDropdown(wrapper)

    const input = wrapper.find('[data-testid="ui-select-input"]')
    await input.setValue('ali')
    await nextTick()
    expect(getChoices(wrapper).length).toBe(1)

    await input.setValue('')
    await nextTick()
    expect(getChoices(wrapper).length).toBe(4) // all people
    wrapper.unmount()
  })

  it('returns no results for non-matching search', async () => {
    const wrapper = mountSelect({}, {}, { noChoice: true })
    await openDropdown(wrapper)

    const input = wrapper.find('[data-testid="ui-select-input"]')
    await input.setValue('zzzzz')
    await nextTick()

    expect(getChoices(wrapper).length).toBe(0)
    // No-choice message should render
    expect(wrapper.find('[data-testid="ui-select-no-choice"]').exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('Keyboard navigation', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('ArrowDown opens dropdown and highlights first item', async () => {
    const wrapper = mountSelect()
    const root = getRoot(wrapper)

    await root.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await nextTick()

    expect(wrapper.find('[data-testid="ui-select-dropdown"]').exists()).toBe(true)
    // First item should be active
    const active = wrapper.find('[data-active="true"]')
    expect(active.exists()).toBe(true)
    wrapper.unmount()
  })

  it('Enter on active item selects it', async () => {
    const wrapper = mountSelect()
    const root = getRoot(wrapper)

    // Open and highlight first
    await root.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await nextTick()

    // Select
    await root.trigger('keydown', { key: 'Enter' })
    await nextTick()
    await nextTick()

    expect((wrapper.vm as any).model).toEqual(people[0])
    wrapper.unmount()
  })

  it('Escape closes dropdown', async () => {
    const wrapper = mountSelect()
    await openDropdown(wrapper)
    expect(wrapper.find('[data-testid="ui-select-dropdown"]').exists()).toBe(true)

    await getRoot(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()
    await nextTick()

    expect(wrapper.find('[data-testid="ui-select-dropdown"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('String array items', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('renders string items correctly', async () => {
    const wrapper = mountSelect(
      {},
      { items: colors, trackBy: undefined, searchFields: [] },
    )
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    expect(choices.length).toBe(4)
    wrapper.unmount()
  })

  it('filters string items by substring', async () => {
    const wrapper = mountSelect(
      {},
      { items: colors, trackBy: undefined, searchFields: [] },
    )
    await openDropdown(wrapper)

    const input = wrapper.find('[data-testid="ui-select-input"]')
    await input.setValue('re')
    await nextTick()

    const choices = getChoices(wrapper)
    // "Red" and "Green" both contain "re"
    expect(choices.length).toBe(2)
    wrapper.unmount()
  })
})

describe('Loading state', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('shows spinner when loading', () => {
    const wrapper = mountSelect({ loading: true })
    expect(wrapper.find('[data-testid="ui-select-spinner"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('hides spinner when not loading', () => {
    const wrapper = mountSelect({ loading: false })
    expect(wrapper.find('[data-testid="ui-select-spinner"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('Placeholder', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('shows placeholder when no selection', () => {
    const wrapper = mountSelect({ placeholder: 'Choose a person' })
    const placeholder = wrapper.find('[data-testid="ui-select-placeholder"]')
    expect(placeholder.exists()).toBe(true)
    expect(placeholder.text()).toBe('Choose a person')
    wrapper.unmount()
  })

  it('hides placeholder when item is selected', () => {
    const wrapper = mountSelect({
      modelValue: people[0],
      placeholder: 'Choose a person',
    })
    expect(wrapper.find('[data-testid="ui-select-placeholder"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('CSS classes contract', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('applies theme class', () => {
    const wrapper = mountSelect({ theme: 'bootstrap' })
    expect(getRoot(wrapper).classes()).toContain('ui-select--bootstrap')
    wrapper.unmount()
  })

  it('applies open/closed classes', async () => {
    const wrapper = mountSelect()
    expect(getRoot(wrapper).classes()).toContain('ui-select--closed')
    expect(getRoot(wrapper).classes()).not.toContain('ui-select--open')

    await openDropdown(wrapper)
    expect(getRoot(wrapper).classes()).toContain('ui-select--open')
    expect(getRoot(wrapper).classes()).not.toContain('ui-select--closed')
    wrapper.unmount()
  })

  it('applies single/multiple classes', () => {
    const single = mountSelect({ multiple: false })
    expect(getRoot(single).classes()).toContain('ui-select--single')
    expect(getRoot(single).classes()).not.toContain('ui-select--multiple')
    single.unmount()

    const multi = mountSelect({ multiple: true, modelValue: [] })
    expect(getRoot(multi).classes()).toContain('ui-select--multiple')
    expect(getRoot(multi).classes()).not.toContain('ui-select--single')
    multi.unmount()
  })

  it('applies loading class', () => {
    const wrapper = mountSelect({ loading: true })
    expect(getRoot(wrapper).classes()).toContain('ui-select--loading')
    wrapper.unmount()
  })
})

describe('Data attributes contract', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('root has data-ui-select', () => {
    const wrapper = mountSelect()
    const root = getRoot(wrapper)
    expect(root.attributes('data-ui-select')).toBeDefined()
    wrapper.unmount()
  })

  it('match section has data-ui-select-match', () => {
    const wrapper = mountSelect()
    expect(wrapper.find('[data-ui-select-match]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('dropdown has data-ui-select-dropdown when open', async () => {
    const wrapper = mountSelect()
    await openDropdown(wrapper)
    expect(wrapper.find('[data-ui-select-dropdown]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('choices have data-ui-select-choice attributes', async () => {
    const wrapper = mountSelect()
    await openDropdown(wrapper)
    const choices = wrapper.findAll('[data-ui-select-choice]')
    expect(choices.length).toBe(4)
    wrapper.unmount()
  })
})

describe('ARIA contract', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('root has combobox role', () => {
    const wrapper = mountSelect()
    expect(getRoot(wrapper).attributes('role')).toBe('combobox')
    wrapper.unmount()
  })

  it('root has aria-expanded false when closed', () => {
    const wrapper = mountSelect()
    expect(getRoot(wrapper).attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('root has aria-expanded true when open', async () => {
    const wrapper = mountSelect()
    await openDropdown(wrapper)
    expect(getRoot(wrapper).attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('listbox has role attribute', async () => {
    const wrapper = mountSelect()
    await openDropdown(wrapper)
    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.exists()).toBe(true)
    wrapper.unmount()
  })

  it('options have role="option"', async () => {
    const wrapper = mountSelect()
    await openDropdown(wrapper)
    const options = wrapper.findAll('[role="option"]')
    expect(options.length).toBe(4)
    wrapper.unmount()
  })

  it('options have aria-selected attribute', async () => {
    // Use removeSelected: false so selected item stays in the dropdown
    const wrapper = mountSelect({ modelValue: people[0], removeSelected: false })
    await openDropdown(wrapper)
    const options = wrapper.findAll('[role="option"]')
    const selectedOption = options.find(o => o.attributes('aria-selected') === 'true')
    expect(selectedOption).toBeDefined()
    wrapper.unmount()
  })
})

describe('Group-by rendering', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('renders group headers when groupBy is set', async () => {
    const wrapper = mountSelect(
      {},
      { items: people, groupBy: 'country', searchFields: ['name'] },
    )
    await openDropdown(wrapper)

    const headers = wrapper.findAll('[data-testid="ui-select-group-header"]')
    expect(headers.length).toBeGreaterThanOrEqual(2)
    const texts = headers.map(h => h.text())
    expect(texts).toContain('US')
    expect(texts).toContain('UK')
    wrapper.unmount()
  })

  it('renders all items across groups', async () => {
    const wrapper = mountSelect(
      {},
      { items: people, groupBy: 'country', searchFields: ['name'] },
    )
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    expect(choices.length).toBe(4)
    wrapper.unmount()
  })
})

describe('Expose API', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('exposes open/close/toggle/focus/blur/clear methods', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref(null)
          const selectRef = ref<any>(null)
          return { model, selectRef }
        },
        render() {
          return h(
            UiSelect,
            {
              ref: 'selectRef',
              modelValue: this.model,
              'onUpdate:modelValue': (v: any) => { this.model = v },
            },
            {
              default: () => [
                h(UiSelectMatch, {}),
                h(UiSelectChoices, { items: people, trackBy: 'id', searchFields: ['name'] }, {
                  choice: ({ item }: any) => h('span', item.name),
                }),
              ],
            },
          )
        },
      }),
      { attachTo: document.body },
    )

    const selectCompVm = (wrapper.vm.$refs as any).selectRef
    expect(typeof selectCompVm.open).toBe('function')
    expect(typeof selectCompVm.close).toBe('function')
    expect(typeof selectCompVm.toggle).toBe('function')
    expect(typeof selectCompVm.focus).toBe('function')
    expect(typeof selectCompVm.blur).toBe('function')
    expect(typeof selectCompVm.clear).toBe('function')
    expect(typeof selectCompVm.select).toBe('function')
    expect(typeof selectCompVm.remove).toBe('function')
    wrapper.unmount()
  })
})

describe('Bind property', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('emits bound property value instead of full object', async () => {
    const wrapper = mountSelect(
      {},
      { items: people, trackBy: 'id', bindProperty: 'id', searchFields: ['name'] },
    )
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    await choices[0].trigger('click')
    await nextTick()
    await nextTick()

    // Model should be the bound id, not the full object
    expect((wrapper.vm as any).model).toBe(1)
    wrapper.unmount()
  })

  it('hydrates display from primitive modelValue', async () => {
    const wrapper = mountSelect(
      { modelValue: 2 },
      { items: people, trackBy: 'id', bindProperty: 'id', searchFields: ['name'] },
    )
    // Hydration happens asynchronously after choicesConfig registers
    await nextTick()
    await nextTick()
    await nextTick()
    // Should display Bob's name
    expect(wrapper.text()).toContain('Bob')
    wrapper.unmount()
  })
})

describe('Remove selected from dropdown', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('hides selected items from choices when removeSelected is true', async () => {
    const wrapper = mountSelect(
      { modelValue: [people[0]], multiple: true, removeSelected: true },
      { items: people, trackBy: 'id', searchFields: ['name'] },
    )
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    // Alice should be excluded
    expect(choices.length).toBe(3)
    const texts = choices.map(c => c.text())
    expect(texts).not.toContain('Alice')
    wrapper.unmount()
  })
})

describe('Events contract', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('emits open event when dropdown opens', async () => {
    const onOpen = vi.fn()
    const wrapper = mountSelect({ onOpen })
    await openDropdown(wrapper)
    expect(onOpen).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('emits close event when dropdown closes', async () => {
    const onClose = vi.fn()
    const wrapper = mountSelect({ onClose })
    await openDropdown(wrapper)

    await getRoot(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()
    await nextTick()

    expect(onClose).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('emits select event when item is chosen', async () => {
    const onSelect = vi.fn()
    const wrapper = mountSelect({ onSelect })
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    await choices[0].trigger('click')
    await nextTick()

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ item: people[0] })
    )
    wrapper.unmount()
  })

  it('emits search event when typing', async () => {
    const onSearch = vi.fn()
    const wrapper = mountSelect({ onSearch })
    await openDropdown(wrapper)

    const input = wrapper.find('[data-testid="ui-select-input"]')
    await input.setValue('Bo')
    await nextTick()

    expect(onSearch).toHaveBeenCalledWith('Bo')
    wrapper.unmount()
  })
})

describe('Disable choice', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('marks disabled choices with data-disabled', async () => {
    const wrapper = mountSelect(
      {},
      {
        items: people,
        trackBy: 'id',
        searchFields: ['name'],
        disableChoice: (item: any) => item.id === 2,
      },
    )
    await openDropdown(wrapper)

    const disabled = wrapper.findAll('[data-disabled="true"]')
    expect(disabled.length).toBe(1)
    wrapper.unmount()
  })

  it('does not select disabled choices on click', async () => {
    const wrapper = mountSelect(
      {},
      {
        items: people,
        trackBy: 'id',
        searchFields: ['name'],
        disableChoice: (item: any) => item.id === 1,
      },
    )
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    await choices[0].trigger('click') // Alice is disabled
    await nextTick()
    await nextTick()

    expect((wrapper.vm as any).model).toBeNull()
    wrapper.unmount()
  })
})

describe('Minimum input length', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('shows minimum length message when search is below threshold', async () => {
    const wrapper = mountSelect(
      {},
      { items: people, searchFields: ['name'], minimumInputLength: 3 },
    )
    await openDropdown(wrapper)

    const input = wrapper.find('[data-testid="ui-select-input"]')
    await input.setValue('Al')
    await nextTick()

    expect(wrapper.find('[data-testid="ui-select-minimum-length"]').exists()).toBe(true)
    expect(getChoices(wrapper).length).toBe(0)
    wrapper.unmount()
  })

  it('shows choices when search meets minimum length', async () => {
    const wrapper = mountSelect(
      {},
      { items: people, searchFields: ['name'], minimumInputLength: 3 },
    )
    await openDropdown(wrapper)

    const input = wrapper.find('[data-testid="ui-select-input"]')
    await input.setValue('Ali')
    await nextTick()

    expect(wrapper.find('[data-testid="ui-select-minimum-length"]').exists()).toBe(false)
    expect(getChoices(wrapper).length).toBe(1)
    wrapper.unmount()
  })
})

// ================================================================
// Checkbox multi-select (showCheckboxes prop)
// ================================================================

describe('Checkbox multi-select', () => {
  function mountCheckboxSelect(
    overrides: Record<string, any> = {},
    choicesOverrides: Record<string, any> = {},
  ) {
    return mountSelect(
      { multiple: true, removeSelected: false, closeOnSelect: false, ...overrides },
      { items: colors, trackBy: undefined, searchFields: [], showCheckboxes: true, ...choicesOverrides },
      { choiceSlot: ({ item }: any) => h('span', { class: 'choice-item' }, String(item)) },
    )
  }

  it('renders checkbox inputs inside each choice row', async () => {
    const wrapper = mountCheckboxSelect()
    await openDropdown(wrapper)

    const checkboxes = wrapper.findAll('[data-ui-select-checkbox]')
    expect(checkboxes.length).toBe(colors.length)
    checkboxes.forEach(cb => {
      expect(cb.element.tagName).toBe('INPUT')
      expect((cb.element as HTMLInputElement).type).toBe('checkbox')
    })
    wrapper.unmount()
  })

  it('does NOT render checkboxes when showCheckboxes is false', async () => {
    const wrapper = mountSelect(
      { multiple: true },
      { items: colors, trackBy: undefined, searchFields: [], showCheckboxes: false },
    )
    await openDropdown(wrapper)

    expect(wrapper.findAll('[data-ui-select-checkbox]').length).toBe(0)
    wrapper.unmount()
  })

  it('sets data-show-checkboxes attribute on the choices container', async () => {
    const wrapper = mountCheckboxSelect()
    await openDropdown(wrapper)

    expect(wrapper.find('[data-show-checkboxes]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('does NOT set data-show-checkboxes when showCheckboxes is false', async () => {
    const wrapper = mountSelect(
      { multiple: true },
      { items: colors, trackBy: undefined, searchFields: [] },
    )
    await openDropdown(wrapper)

    expect(wrapper.find('[data-show-checkboxes]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('checks a checkbox when an item is selected', async () => {
    const wrapper = mountCheckboxSelect()
    await openDropdown(wrapper)

    const firstChoice = getChoices(wrapper)[0]
    await firstChoice.trigger('click')
    await nextTick()

    const checkbox = firstChoice.find('[data-ui-select-checkbox]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
    wrapper.unmount()
  })

  it('unchecks a checkbox when clicking a selected item again', async () => {
    const wrapper = mountCheckboxSelect()
    await openDropdown(wrapper)

    const firstChoice = getChoices(wrapper)[0]
    // Select
    await firstChoice.trigger('click')
    await nextTick()
    expect((firstChoice.find('[data-ui-select-checkbox]').element as HTMLInputElement).checked).toBe(true)

    // Deselect
    await firstChoice.trigger('click')
    await nextTick()
    expect((firstChoice.find('[data-ui-select-checkbox]').element as HTMLInputElement).checked).toBe(false)
    wrapper.unmount()
  })

  it('keeps dropdown open after selecting (closeOnSelect=false)', async () => {
    const wrapper = mountCheckboxSelect()
    await openDropdown(wrapper)

    const firstChoice = getChoices(wrapper)[0]
    await firstChoice.trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="ui-select-dropdown"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('keeps selected items visible in dropdown (removeSelected=false)', async () => {
    const wrapper = mountCheckboxSelect()
    await openDropdown(wrapper)

    const beforeCount = getChoices(wrapper).length
    await getChoices(wrapper)[0].trigger('click')
    await nextTick()

    expect(getChoices(wrapper).length).toBe(beforeCount)
    wrapper.unmount()
  })

  it('can select multiple items with checkboxes', async () => {
    const wrapper = mountCheckboxSelect()
    await openDropdown(wrapper)

    await getChoices(wrapper)[0].trigger('click')
    await nextTick()
    await getChoices(wrapper)[1].trigger('click')
    await nextTick()

    const checkboxes = wrapper.findAll('[data-ui-select-checkbox]')
    expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[2].element as HTMLInputElement).checked).toBe(false)
    wrapper.unmount()
  })

  it('checkbox has aria-hidden and tabindex=-1', async () => {
    const wrapper = mountCheckboxSelect()
    await openDropdown(wrapper)

    const checkbox = wrapper.find('[data-ui-select-checkbox]')
    expect(checkbox.attributes('aria-hidden')).toBe('true')
    expect(checkbox.attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('works with object items and trackBy', async () => {
    const wrapper = mountSelect(
      { multiple: true, removeSelected: false, closeOnSelect: false },
      { items: people, trackBy: 'id', searchFields: ['name'], showCheckboxes: true },
    )
    await openDropdown(wrapper)

    const choices = getChoices(wrapper)
    await choices[0].trigger('click')
    await nextTick()

    expect((choices[0].find('[data-ui-select-checkbox]').element as HTMLInputElement).checked).toBe(true)
    expect((choices[1].find('[data-ui-select-checkbox]').element as HTMLInputElement).checked).toBe(false)
    wrapper.unmount()
  })

  it('disabled choices cannot be toggled via checkbox', async () => {
    const wrapper = mountSelect(
      { multiple: true, removeSelected: false, closeOnSelect: false },
      { items: colors, trackBy: undefined, searchFields: [], showCheckboxes: true, disableChoice: (item: string) => item === 'Red' },
      { choiceSlot: ({ item }: any) => h('span', {}, String(item)) },
    )
    await openDropdown(wrapper)

    const redChoice = getChoices(wrapper)[0]
    await redChoice.trigger('click')
    await nextTick()

    expect((redChoice.find('[data-ui-select-checkbox]').element as HTMLInputElement).checked).toBe(false)
    wrapper.unmount()
  })
})
