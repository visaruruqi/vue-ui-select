// ============================================================
// UiSelectPlugin installation tests
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { UiSelectPlugin, UiSelect, UiSelectMatch, UiSelectChoices, UiSelectNoChoice } from '../../src/index'
import { UI_SELECT_OPTIONS } from '../../src/symbols'

// Minimal root component
const Root = defineComponent({
  render: () => h('div'),
})

describe('UiSelectPlugin', () => {
  it('registers PascalCase component names', () => {
    const app = createApp(Root)
    app.use(UiSelectPlugin)

    // Vue 3: app.component(name) returns the component definition if registered
    expect(app.component('UiSelect')).toBeDefined()
    expect(app.component('UiSelectMatch')).toBeDefined()
    expect(app.component('UiSelectChoices')).toBeDefined()
    expect(app.component('UiSelectNoChoice')).toBeDefined()
  })

  it('registers kebab-case component aliases', () => {
    const app = createApp(Root)
    app.use(UiSelectPlugin)

    expect(app.component('ui-select')).toBeDefined()
    expect(app.component('ui-select-match')).toBeDefined()
    expect(app.component('ui-select-choices')).toBeDefined()
    expect(app.component('ui-select-no-choice')).toBeDefined()
  })

  it('defaults to tailwind theme', () => {
    const app = createApp(Root)

    // Spy on provide
    const provideSpy = vi.spyOn(app, 'provide')
    app.use(UiSelectPlugin)

    const providedOpts = provideSpy.mock.calls.find(
      ([key]) => key === UI_SELECT_OPTIONS
    )
    expect(providedOpts).toBeDefined()
    expect(providedOpts![1]).toEqual({ theme: 'tailwind' })
  })

  it('accepts custom theme option', () => {
    const app = createApp(Root)
    const provideSpy = vi.spyOn(app, 'provide')
    app.use(UiSelectPlugin, { theme: 'bootstrap' })

    const providedOpts = provideSpy.mock.calls.find(
      ([key]) => key === UI_SELECT_OPTIONS
    )
    expect(providedOpts![1]).toEqual({ theme: 'bootstrap' })
  })

  it('supports prefix option for component names', () => {
    const app = createApp(Root)
    app.use(UiSelectPlugin, { prefix: 'My' })

    expect(app.component('MyUiSelect')).toBeDefined()
    expect(app.component('MyUiSelectMatch')).toBeDefined()
    expect(app.component('MyUiSelectChoices')).toBeDefined()
    expect(app.component('MyUiSelectNoChoice')).toBeDefined()

    // Kebab-case with prefix
    expect(app.component('Myui-select')).toBeDefined()
    expect(app.component('Myui-select-match')).toBeDefined()
  })

  it('applies plugin theme to UiSelect when no theme prop is set', () => {
    const wrapper = mount(UiSelect, {
      global: { plugins: [[UiSelectPlugin, { theme: 'select2' }]] },
    })
    expect(wrapper.find('.ui-select').classes()).toContain('ui-select--select2')
    wrapper.unmount()
  })

  it('prop theme overrides plugin theme', () => {
    const wrapper = mount(UiSelect, {
      props: { theme: 'bootstrap' },
      global: { plugins: [[UiSelectPlugin, { theme: 'select2' }]] },
    })
    expect(wrapper.find('.ui-select').classes()).toContain('ui-select--bootstrap')
    wrapper.unmount()
  })

  it('falls back to tailwind when neither prop nor plugin specify a theme', () => {
    const wrapper = mount(UiSelect)
    expect(wrapper.find('.ui-select').classes()).toContain('ui-select--tailwind')
    wrapper.unmount()
  })

  it('applies plugin defaults for searchEnabled when prop is omitted', () => {
    const wrapper = mount(UiSelect, {
      global: { plugins: [[UiSelectPlugin, { defaults: { searchEnabled: false } }]] },
    })
    expect(wrapper.find('.ui-select').attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  // tabindex is the observable for searchEnabled resolution, but only in
  // MULTIPLE mode: there the match-row input is the tab stop, so the root drops
  // to -1 when search is on. A single-mode select keeps tabindex 0 regardless —
  // its input lives inside the dropdown and doesn't exist while closed.
  it('per-instance searchEnabled prop overrides plugin default', () => {
    const wrapper = mount(UiSelect, {
      props: { searchEnabled: true, multiple: true },
      global: { plugins: [[UiSelectPlugin, { defaults: { searchEnabled: false } }]] },
    })
    expect(wrapper.find('.ui-select').attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('preserves built-in default when neither prop nor plugin default is set', () => {
    const wrapper = mount(UiSelect, { props: { multiple: true } })
    // searchEnabled defaults to true → tabindex="-1" (match input is the tab stop)
    expect(wrapper.find('.ui-select').attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('single mode stays tabbable even with search enabled', () => {
    const wrapper = mount(UiSelect, { props: { searchEnabled: true } })
    // The single-mode search input only exists while the dropdown is open, so
    // the root must remain the tab stop or the widget is keyboard-unreachable.
    expect(wrapper.find('.ui-select').attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('registers nothing when accessing unregistered names', () => {
    const app = createApp(Root)
    app.use(UiSelectPlugin)

    // Should not register unrelated names
    expect(app.component('FooBar')).toBeUndefined()
  })
})

describe('Named exports', () => {
  it('exports all components', () => {
    expect(UiSelect).toBeDefined()
    expect(UiSelectMatch).toBeDefined()
    expect(UiSelectChoices).toBeDefined()
    expect(UiSelectNoChoice).toBeDefined()
  })

  it('exports the plugin', () => {
    expect(UiSelectPlugin).toBeDefined()
    expect(typeof UiSelectPlugin.install).toBe('function')
  })
})
