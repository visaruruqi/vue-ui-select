# vue-ui-select

A production-grade Vue 3 select component — drop-in replacement for AngularJS `ui-select`.

Search, multi-select, tagging, grouping, keyboard navigation, ARIA accessibility, teleport, and four built-in themes.

## Features

- **Single & multi-select** — strings, objects, or dictionaries
- **Type-ahead search** — client-side filtering with configurable search fields
- **Grouping** — `group-by` string property or function, with `group-filter`
- **Tagging** — create new items on the fly, with token separators
- **Keyboard navigation** — Arrow keys, Enter, Escape, Tab, Backspace
- **ARIA accessible** — combobox role, `aria-expanded`, `aria-activedescendant`, listbox/option roles
- **Teleport** — `append-to-body` to escape overflow containers
- **Dropdown positioning** — auto, up, or down
- **4 built-in themes** — Tailwind CSS, Bootstrap, Select2, Selectize
- **Dark mode** — Tailwind theme supports `.dark` / `[data-theme="dark"]`
- **TypeScript** — full type definitions included
- **Composable architecture** — every feature is a standalone composable

## Installation

```bash
npm install vue-ui-select
```

## Quick Start

### Plugin (recommended)

```ts
import { createApp } from 'vue'
import UiSelectPlugin from 'vue-ui-select'
import 'vue-ui-select/themes/tailwind.css'

const app = createApp(App)
app.use(UiSelectPlugin)
app.mount('#app')
```

### Individual imports

```ts
import { UiSelect, UiSelectMatch, UiSelectChoices } from 'vue-ui-select'
```

## Usage

### Single select

```vue
<template>
  <ui-select v-model="selected" :clearable="true">
    <ui-select-match placeholder="Pick a person...">
      <template #default="{ selected }">{{ selected?.name }}</template>
    </ui-select-match>
    <ui-select-choices
      :items="people"
      :track-by="'id'"
      :search-fields="['name', 'email']"
    >
      <template #choice="{ item, search, highlighted }">
        <span v-html="highlighted(item.name, search)"></span>
      </template>
    </ui-select-choices>
  </ui-select>
</template>
```

### Multi-select

```vue
<template>
  <ui-select v-model="selected" :multiple="true" :clearable="true">
    <ui-select-match placeholder="Add people...">
      <template #tag="{ item, removeItem }">
        <span class="chip">
          {{ item.name }}
          <button @click="removeItem(item)">&times;</button>
        </span>
      </template>
    </ui-select-match>
    <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
      <template #choice="{ item }">{{ item.name }}</template>
    </ui-select-choices>
  </ui-select>
</template>
```

### Tagging

```vue
<ui-select v-model="tags" :multiple="true" :tagging="true" :tagging-tokens="[',']">
  <ui-select-match placeholder="Type to add tags...">
    <template #tag="{ item, removeItem }">
      {{ item }} <button @click="removeItem(item)">&times;</button>
    </template>
  </ui-select-match>
  <ui-select-choices :items="suggestions">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>
```

### Grouping

```vue
<ui-select-choices
  :items="people"
  :track-by="'id'"
  :group-by="'country'"
  :group-filter="['US', 'UK']"
  :search-fields="['name']"
>
  <template #group-header="{ groupName }">{{ groupName }}</template>
  <template #choice="{ item }">{{ item.name }}</template>
</ui-select-choices>
```

### Object source (dictionary)

```vue
<ui-select-choices :items="{ r: 'Red', g: 'Green', b: 'Blue' }">
  <template #choice="{ item, key }">{{ key }}: {{ item }}</template>
</ui-select-choices>
```

### Append to body (teleport)

```vue
<ui-select v-model="val" :append-to-body="true">
  <!-- dropdown renders to document.body, escaping overflow containers -->
</ui-select>
```

### No choice (empty state)

```vue
<ui-select v-model="val">
  <ui-select-match placeholder="Select...">...</ui-select-match>
  <ui-select-choices :items="items">...</ui-select-choices>
  <ui-select-no-choice>
    <template #default>No results found</template>
  </ui-select-no-choice>
</ui-select>
```

## API Reference

### `<ui-select>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `v-model` | `any` | — | Selected value (object, primitive, or array for multi) |
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `disabled` | `boolean` | `false` | Disable the component |
| `clearable` | `boolean` | `false` | Show clear button |
| `search-enabled` | `boolean` | `true` | Enable search/filter |
| `reset-search-input` | `boolean` | `true` | Clear search on close |
| `close-on-select` | `boolean` | `true` | Close dropdown after selection |
| `append-to-body` | `boolean` | `false` | Teleport dropdown to `<body>` |
| `position` | `'auto' \| 'up' \| 'down'` | `'auto'` | Dropdown position |
| `theme` | `string` | `'tailwind'` | Theme name |
| `placeholder` | `string` | `''` | Placeholder text |
| `tagging` | `boolean \| Function` | `false` | Enable tagging, or provide a factory function |
| `tagging-label` | `string \| false` | `false` | Label for new tag row |
| `tagging-tokens` | `string[]` | `[]` | Characters that trigger tag creation |
| `limit` | `number` | — | Max selections in multi mode |
| `remove-selected` | `boolean` | `false` | Hide selected items from dropdown |
| `loading` | `boolean` | `false` | Show loading spinner |
| `autofocus` | `boolean` | `false` | Focus on mount |
| `input-id` | `string` | — | Custom ID for the search input |
| `lock-choice` | `Function` | — | Predicate: locked items cannot be removed |
| `bind-property` | `string` | — | Emit a nested property instead of full object |

### `<ui-select>` Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | v-model update |
| `select` | `{ item, model }` | Item selected |
| `remove` | `{ item, model }` | Item removed |
| `search` | `string` | Search text changed |
| `open` | — | Dropdown opened |
| `close` | — | Dropdown closed |

### `<ui-select-match>` Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | `{ selected, search, isOpen }` | Single-mode selected display |
| `tag` | `{ item, index, removeItem, isLocked }` | Multi-mode tag/chip |

### `<ui-select-choices>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `any[] \| Record<string, any>` | `[]` | Items source |
| `track-by` | `string \| Function` | — | Identity key/function |
| `search-fields` | `string[]` | `[]` | Fields to search |
| `filter-fn` | `Function` | — | Custom filter function |
| `group-by` | `string \| Function` | — | Group by property or function |
| `group-filter` | `string[] \| Function` | — | Filter/reorder groups |
| `disable-choice` | `Function` | — | Predicate: disable specific items |
| `sort-fn` | `Function` | — | Custom sort function |
| `minimum-input-length` | `number` | `0` | Min chars before showing results |
| `refresh-delay` | `number` | `0` | Debounce delay for search |

### `<ui-select-choices>` Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `choice` | `{ item, index, search, highlighted, isActive, isSelected, isDisabled }` | Item row |
| `group-header` | `{ groupName }` | Group header |

### `<ui-select-no-choice>` Slots

| Slot | Description |
|------|-------------|
| `default` | Content shown when dropdown is open and no items match |

## Themes

Import one CSS file:

```ts
// Tailwind (default)
import 'vue-ui-select/themes/tailwind.css'

// Bootstrap
import 'vue-ui-select/themes/bootstrap.css'

// Select2
import 'vue-ui-select/themes/select2.css'

// Selectize
import 'vue-ui-select/themes/selectize.css'
```

Set theme per-instance:

```vue
<ui-select theme="bootstrap" ...>
```

Or globally via plugin:

```ts
app.use(UiSelectPlugin, { theme: 'select2' })
```

### Dark mode (Tailwind)

Add `.dark` to `<html>` or use `[data-theme="dark"]`:

```html
<html class="dark">
```

## Migration from AngularJS ui-select

| AngularJS | Vue 3 |
|-----------|-------|
| `<ui-select>` | `<ui-select>` |
| `<ui-select-match>` | `<ui-select-match>` |
| `<ui-select-choices>` | `<ui-select-choices>` |
| `<ui-select-no-choice>` | `<ui-select-no-choice>` |
| `ng-model` | `v-model` |
| `repeat="item in items"` | `:items="items"` |
| `group-by="'prop'"` | `:group-by="'prop'"` |
| `group-filter` | `:group-filter` |
| `track by item.id` | `:track-by="'id'"` |
| `$select.search` | `search` slot prop |
| `highlight` filter | `highlighted()` slot function |
| `tagging` | `:tagging="true"` or `:tagging="factory"` |
| `tagging-tokens` | `:tagging-tokens="[',']"` |
| `close-on-select` | `:close-on-select="false"` |
| `append-to-body` | `:append-to-body="true"` |
| `theme` attribute | `theme` prop |

## Development

```bash
# Install dependencies
npm install

# Start playground
npm run dev

# Type check
npm run typecheck

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Build library
npm run build
```

## License

MIT
