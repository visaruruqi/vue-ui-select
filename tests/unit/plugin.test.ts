// ============================================================
// UiSelectPlugin installation tests
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
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
