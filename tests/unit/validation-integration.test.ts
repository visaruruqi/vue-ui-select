// ============================================================
// Validation-library integration tests
//
// Verifies that <ui-select> dispatches native DOM `input` and `blur`
// events on its root element so external validators (oop-validator,
// VeeValidate, hand-rolled, etc.) can listen without any coupling.
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import UiSelect from '../../src/components/UiSelect.vue'
import UiSelectMatch from '../../src/components/UiSelectMatch.vue'
import UiSelectChoices from '../../src/components/UiSelectChoices.vue'

const people = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

function makeSelect(props: Record<string, any> = {}) {
  return mount(
    defineComponent({
      setup() {
        const model = ref<any>(props.modelValue ?? null)
        return { model }
      },
      render() {
        return h(
          UiSelect,
          {
            modelValue: this.model,
            'onUpdate:modelValue': (v: any) => { this.model = v },
            ...props,
          },
          {
            default: () => [
              h(UiSelectMatch, { placeholder: 'pick' }),
              h(UiSelectChoices, { items: people, trackBy: 'id' }, {
                choice: ({ item }: any) => h('span', { class: 'choice-item' }, item.name),
              }),
            ],
          }
        )
      },
    }),
    { attachTo: document.body }
  )
}

describe('validation-library integration', () => {
  it('dispatches native `input` event on root after a single-mode selection', async () => {
    const wrapper = makeSelect()
    const root = wrapper.find<HTMLElement>('[data-ui-select]')
    const onInput = vi.fn()
    root.element.addEventListener('input', onInput)

    // open + click first option
    await wrapper.find('[data-ui-select-match]').trigger('click')
    await nextTick()
    await nextTick()
    const firstChoice = wrapper.find('[data-ui-select-choice]')
    await firstChoice.trigger('click')
    await nextTick()
    await nextTick()

    expect(onInput).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('does not dispatch `input` on initial mount / hydration', async () => {
    const onInput = vi.fn()
    // Pre-attach listener via global before mount — only way to catch it
    document.addEventListener('input', onInput)
    const wrapper = makeSelect({ modelValue: people[0] })
    await nextTick()
    await nextTick()
    expect(onInput).not.toHaveBeenCalled()
    document.removeEventListener('input', onInput)
    wrapper.unmount()
  })

  it('dispatches `input` event in multi-mode when a tag is added', async () => {
    const wrapper = makeSelect({ multiple: true, modelValue: [] })
    const root = wrapper.find<HTMLElement>('[data-ui-select]')
    const onInput = vi.fn()
    root.element.addEventListener('input', onInput)

    await wrapper.find('[data-ui-select-match]').trigger('click')
    await nextTick()
    await nextTick()
    await wrapper.find('[data-ui-select-choice]').trigger('click')
    await nextTick()
    await nextTick()

    expect(onInput).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('dispatches `blur` event on root when focus truly leaves the widget', async () => {
    const wrapper = makeSelect()
    const root = wrapper.find<HTMLElement>('[data-ui-select]')
    const onBlur = vi.fn()
    root.element.addEventListener('blur', onBlur)

    // Simulate focus leaving the widget — relatedTarget is outside the root
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    root.element.dispatchEvent(new FocusEvent('focusout', { relatedTarget: outside, bubbles: true }))

    expect(onBlur).toHaveBeenCalled()
    document.body.removeChild(outside)
    wrapper.unmount()
  })

  it('does NOT dispatch `blur` for internal focus moves within the widget subtree', async () => {
    const wrapper = makeSelect()
    const root = wrapper.find<HTMLElement>('[data-ui-select]')
    const onBlur = vi.fn()
    root.element.addEventListener('blur', onBlur)

    // Add a child element inside the root, then simulate focus moving to it
    const child = document.createElement('span')
    root.element.appendChild(child)
    root.element.dispatchEvent(new FocusEvent('focusout', { relatedTarget: child, bubbles: true }))

    expect(onBlur).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('exposes a `name` attribute on the root when set as a wrapper prop', () => {
    const wrapper = makeSelect({ name: 'mySelect' })
    const root = wrapper.find('[data-ui-select]')
    expect(root.attributes('name')).toBe('mySelect')
    wrapper.unmount()
  })
})
