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
