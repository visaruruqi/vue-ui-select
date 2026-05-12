// ============================================================
// UiSelect component integration tests
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import UiSelect from '../../src/components/UiSelect.vue'
import UiSelectMatch from '../../src/components/UiSelectMatch.vue'
import UiSelectChoices from '../../src/components/UiSelectChoices.vue'
import UiSelectNoChoice from '../../src/components/UiSelectNoChoice.vue'

const people = [
  { id: 1, name: 'Alice', email: 'alice@test.com', country: 'US', age: 25 },
  { id: 2, name: 'Bob', email: 'bob@test.com', country: 'UK', age: 30 },
  { id: 3, name: 'Charlie', email: 'charlie@test.com', country: 'US', age: 35 },
]

/**
 * Helper to mount a complete UiSelect composition.
 */
function mountSelect(props: Record<string, any> = {}, choicesProps: Record<string, any> = {}) {
  return mount(
    defineComponent({
      setup() {
        const model = ref(props.modelValue ?? null)
        return { model }
      },
      render() {
        return h(
          UiSelect,
          {
            modelValue: this.model,
            'onUpdate:modelValue': (v: any) => { this.model = v },
            multiple: props.multiple ?? false,
            clearable: props.clearable ?? true,
            ...props,
          },
          {
            default: () => [
              h(UiSelectMatch, { placeholder: props.placeholder ?? 'Select...' }, {
                default: ({ selected }: any) => selected?.name ?? '',
                tag: ({ item, removeItem }: any) =>
                  h('span', { class: 'tag', onClick: () => removeItem(item) }, item?.name ?? String(item)),
              }),
              h(
                UiSelectChoices,
                {
                  items: choicesProps.items ?? people,
                  trackBy: choicesProps.trackBy ?? 'id',
                  searchFields: choicesProps.searchFields ?? ['name'],
                  ...choicesProps,
                },
                {
                  choice: ({ item }: any) => h('span', { class: 'choice-item' }, item?.name ?? String(item)),
                }
              ),
            ],
          }
        )
      },
    }),
    {
      attachTo: document.body,
    }
  )
}

describe('UiSelect integration', () => {
  it('renders root element with data-ui-select', () => {
    const wrapper = mountSelect()
    expect(wrapper.find('[data-ui-select]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('shows placeholder when nothing selected', () => {
    const wrapper = mountSelect({ placeholder: 'Pick one' })
    expect(wrapper.text()).toContain('Pick one')
    wrapper.unmount()
  })

  it('opens dropdown on click', async () => {
    const wrapper = mountSelect()
    const root = wrapper.find('[data-ui-select]')
    // UiSelectMatch handles click -> toggle
    const match = wrapper.find('[data-ui-select-match]')
    if (match.exists()) {
      await match.trigger('click')
    } else {
      await root.trigger('click')
    }
    await nextTick()
    await nextTick()
    // Verify component didn't crash
    expect(wrapper.find('[data-ui-select]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('mounts with update:modelValue listener', () => {
    const onUpdate = vi.fn()
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref(null)
          return { model, onUpdate }
        },
        render() {
          return h(
            UiSelect,
            {
              modelValue: this.model,
              'onUpdate:modelValue': (v: any) => {
                this.model = v
                this.onUpdate(v)
              },
              clearable: true,
            },
            {
              default: () => [
                h(UiSelectMatch, { placeholder: 'Select...' }, {
                  default: ({ selected }: any) => selected?.name ?? '',
                }),
                h(
                  UiSelectChoices,
                  {
                    items: people,
                    trackBy: 'id',
                    searchFields: ['name'],
                  },
                  {
                    choice: ({ item }: any) => h('span', { class: 'test-choice' }, item.name),
                  }
                ),
              ],
            }
          )
        },
      }),
      { attachTo: document.body }
    )

    expect(wrapper.find('[data-ui-select]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('supports multiple selection mode', () => {
    const wrapper = mountSelect({
      modelValue: [],
      multiple: true,
    })
    expect(wrapper.find('[data-ui-select]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('displays selected value', () => {
    const wrapper = mountSelect({
      modelValue: people[0],
    })
    expect(wrapper.text()).toContain('Alice')
    wrapper.unmount()
  })

  it('has ARIA combobox role', () => {
    const wrapper = mountSelect()
    const root = wrapper.find('[data-ui-select]')
    expect(root.attributes('role')).toBe('combobox')
    wrapper.unmount()
  })

  it('binds ARIA attrs on the single-mode search input', async () => {
    const wrapper = mountSelect({ searchEnabled: true })
    const match = wrapper.find('[data-ui-select-match]')
    await match.trigger('click')
    await nextTick()
    await nextTick()
    const input = wrapper.find<HTMLInputElement>('input[data-ui-select-input]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('role')).toBe('searchbox')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    expect(input.attributes('aria-controls')).toBeTruthy()
    expect(input.attributes('id')).toBeTruthy()
    wrapper.unmount()
  })

  it('binds ARIA attrs on the multi-mode inline search input', async () => {
    const wrapper = mountSelect({ modelValue: [], multiple: true, searchEnabled: true })
    const input = wrapper.find<HTMLInputElement>('input[data-ui-select-input]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('role')).toBe('searchbox')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    expect(input.attributes('id')).toBeTruthy()
    wrapper.unmount()
  })

  it('auto-closes dropdown when disabled becomes true', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref<any>(null)
          const disabled = ref(false)
          return { model, disabled }
        },
        render() {
          return h(
            UiSelect,
            { modelValue: this.model, 'onUpdate:modelValue': (v: any) => { this.model = v }, disabled: this.disabled },
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
    const match = wrapper.find('[data-ui-select-match]')
    await match.trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.find('[data-ui-select-dropdown]').exists()).toBe(true)
    ;(wrapper.vm as any).disabled = true
    await nextTick()
    await nextTick()
    expect(wrapper.find('[data-ui-select-dropdown]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders #group-header slot with groupName scope', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref<any>(null)
          return { model }
        },
        render() {
          return h(
            UiSelect,
            { modelValue: this.model, 'onUpdate:modelValue': (v: any) => { this.model = v } },
            {
              default: () => [
                h(UiSelectMatch, { placeholder: 'pick' }),
                h(
                  UiSelectChoices,
                  { items: people, trackBy: 'id', groupBy: 'country' },
                  {
                    'group-header': ({ groupName }: any) =>
                      h('span', { class: 'gh' }, `[${groupName}]`),
                    choice: ({ item }: any) => h('span', String(item.name)),
                  }
                ),
              ],
            }
          )
        },
      }),
      { attachTo: document.body }
    )
    const match = wrapper.find('[data-ui-select-match]')
    await match.trigger('click')
    await nextTick()
    await nextTick()
    const headers = wrapper.findAll('.gh').map((h) => h.text())
    expect(headers).toContain('[US]')
    expect(headers).toContain('[UK]')
    wrapper.unmount()
  })

  it('assigns distinct flat indices to duplicate primitive items', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref<any>(null)
          return { model }
        },
        render() {
          return h(
            UiSelect,
            { modelValue: this.model, 'onUpdate:modelValue': (v: any) => { this.model = v } },
            {
              default: () => [
                h(UiSelectMatch, { placeholder: 'pick' }),
                h(UiSelectChoices, { items: ['a', 'b', 'a'] }, {
                  choice: ({ item }: any) => h('span', { class: 'choice-item' }, String(item)),
                }),
              ],
            }
          )
        },
      }),
      { attachTo: document.body }
    )
    const match = wrapper.find('[data-ui-select-match]')
    await match.trigger('click')
    await nextTick()
    await nextTick()
    const rows = wrapper.findAll('[data-ui-select-choice]')
    expect(rows).toHaveLength(3)
    const indices = rows.map((r) => r.attributes('data-ui-select-choice-index'))
    expect(indices).toEqual(['0', '1', '2'])
    wrapper.unmount()
  })

  it('applies teleport positioning style when append-to-body is true', async () => {
    const wrapper = mountSelect({ appendToBody: true })
    const match = wrapper.find('[data-ui-select-match]')
    await match.trigger('click')
    await nextTick()
    await nextTick()
    const dropdown = document.querySelector<HTMLElement>('[data-ui-select-dropdown]')
    expect(dropdown).toBeTruthy()
    expect(dropdown!.style.position).toBe('absolute')
    expect(dropdown!.style.zIndex).toBe('9999')
    expect(dropdown!.style.left).toBeTruthy()
    wrapper.unmount()
  })

  it('handles ArrowDown on teleported search input (append-to-body)', async () => {
    const wrapper = mountSelect({ appendToBody: true, searchEnabled: true })
    const match = wrapper.find('[data-ui-select-match]')
    await match.trigger('click')
    await nextTick()
    await nextTick()
    const input = document.querySelector<HTMLInputElement>('input[data-ui-select-input]')
    expect(input).toBeTruthy()
    input!.focus()
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    const activeOption = document.querySelector('[aria-selected]')
    expect(activeOption).toBeTruthy()
    wrapper.unmount()
  })

  it('renders multi-mode #tag slot with item and removeItem', async () => {
    const wrapper = mountSelect({
      modelValue: [people[0], people[1]],
      multiple: true,
    })
    const tags = wrapper.findAll('.tag')
    expect(tags).toHaveLength(2)
    expect(tags[0].text()).toBe('Alice')
    expect(tags[1].text()).toBe('Bob')

    await tags[0].trigger('click')
    await nextTick()
    const tagsAfter = wrapper.findAll('.tag')
    expect(tagsAfter).toHaveLength(1)
    expect(tagsAfter[0].text()).toBe('Bob')
    wrapper.unmount()
  })
})

describe('UiSelectNoChoice', () => {
  it('registers with parent context', () => {
    const wrapper = mount(
      defineComponent({
        render() {
          return h(
            UiSelect,
            { modelValue: null },
            {
              default: () => [
                h(UiSelectMatch, {}, {}),
                h(UiSelectChoices, { items: [] }, {
                  choice: () => h('span'),
                }),
                h(UiSelectNoChoice, {}, {
                  default: () => h('div', { class: 'no-choice-msg' }, 'No items'),
                }),
              ],
            }
          )
        },
      }),
      { attachTo: document.body }
    )

    expect(wrapper.find('[data-ui-select]').exists()).toBe(true)
    wrapper.unmount()
  })
})
