# vue-ui-select — AI Context & Implementation Prompt

> **Purpose of this file:** This is the authoritative specification and prompt for an AI coding agent to build this library. It is not a README for consumers. It contains the full design intent, API contract, compatibility mapping, and implementation requirements.

---

## Role

You are a senior Vue 3 library architect, component-system engineer, DX-focused package maintainer, and testing expert.

---

## Mission Statement

Build a **production-grade, npm-publishable Vue 3.x component library** that is a near drop-in conceptual replacement for the AngularJS `ui-select` directive from [`angular-ui/ui-select`](https://github.com/angular-ui/ui-select).

The result must be:

- A **real library** — not a throwaway demo, not a single-app component, not a simplistic `<select>` wrapper.
- **Familiar** to developers who used AngularJS `ui-select` (same tag names, same mental model, same composition pattern).
- **Modernized** into idiomatic Vue 3 (Composition API, TypeScript, Teleport, slots, `v-model`).
- **Publishable** to npm with typed exports, proper `package.json`, ESM build, and separated theme CSS.
- **Tested** with Vitest (unit/integration), Vue Test Utils (component), and Playwright (E2E).
- Shipped with a **runnable Vite-based demo app** for development, manual QA, and Playwright targets.

This component exists to **eliminate repeated custom select/dropdown/tagging/search code** across applications — the same value proposition as the original.

**Do not** build a basic select. **Do not** wrap an existing UI library unless there is a strong, documented reason.

---

## Original Library Context

| | |
|---|---|
| **Name** | AngularJS ui-select |
| **Repository** | <https://github.com/angular-ui/ui-select> (archived Oct 2019) |
| **Demo** | <https://angular-ui.github.io/ui-select/> |
| **Wiki** | <https://github.com/angular-ui/ui-select/wiki> |
| **Description** | AngularJS-native version of Select2 and Selectize — without jQuery |
| **Stars** | ~3.2k |
| **Contributors** | 167 |
| **Key value** | Search, Select, Multi-select, Tagging, 3 themes, keyboard support, 4.57 KB min+gzip |

---

## Original API Reference (Verified from Wiki)

### `<ui-select>` Attributes

| Attribute | Description | Type | Default |
|---|---|---|---|
| `ng-model` | Bound value | string / number / array | — |
| `ng-disabled` | Disable the control | boolean | — |
| `theme` | Visual theme (`bootstrap`, `select2`, `selectize`) | string | `'bootstrap'` |
| `multiple` | Enable multi-select (attribute, no value) | boolean | `false` |
| `close-on-select` | Close dropdown after selection (multi) | boolean | `true` |
| `append-to-body` | Render dropdown in `<body>` to escape clipping | boolean | `false` |
| `search-enabled` | Show search input | boolean | `true` |
| `reset-search-input` | Clear search text after selecting | boolean | `true` |
| `tagging` | Enable tag creation; accepts scope function name for object transform | string (scope fn) | `undefined` |
| `tagging-label` | Label for new-tag row in dropdown; `false` hides it | string / boolean | `'(new)'` |
| `tagging-tokens` | Keys that trigger tag creation (pipe-separated); `SPACE` = literal spacebar | string | `ENTER`, `,` |
| `autofocus` | Auto-focus on load | boolean | `false` |
| `focus-on` | Scope event name to trigger focus (e.g. `focus-on="SetFocus"`) | string | — |
| `skip-focusser` | Skip the focusser element after selecting | boolean | `false` |
| `limit` | Max number of selected items (multi + tagging) | integer | `undefined` |
| `remove-selected` | When `false`, selected items are disabled in dropdown instead of removed | boolean | `true` |
| `paste` | Scope function name receiving pasted text | string (scope fn) | `undefined` |
| `spinner-enabled` | Show spinner during `refresh` loading | boolean | `false` |
| `spinner-class` | CSS class for spinner | string | `'glyphicon-refresh ui-select-spin'` |
| `input-id` | Custom `id` for the `<input>`, enabling `<label for="...">` | string | `undefined` |

### `<ui-select>` Events

| Event | Signature | Description |
|---|---|---|
| `on-select` | `on-select="fn($item, $model)"` | Fires when an item is selected |
| `on-remove` | `on-remove="fn($item, $model)"` | Fires when an item is removed |

### `<ui-select-match>` Attributes

| Attribute | Description | Type |
|---|---|---|
| `placeholder` | Placeholder text when nothing is selected | string |
| `allow-clear` | Show a clear/reset button | boolean |
| `ui-lock-choice` | Lock a choice in multi-select so it can't be removed | expression |

**Template variables:** In single mode use `$select.selected`; in multi mode use `$item` (iterates over selected items).

### `<ui-select-choices>` Attributes

| Attribute | Description | Type |
|---|---|---|
| `repeat` | ngRepeat-like expression: `item in items`, `item.id as item in items`, `(key, val) in obj` | expression |
| `group-by` | Group items by string property name or scope function | string / expression |
| `group-filter` | Filter/sort visible groups by array or scope function | expression |
| `ui-disable-choice` | Disable specific choices via expression | expression |
| `ui-select-header-group-selectable` | Allow selecting a group header | attribute |
| `refresh` | Scope function for async/remote data loading | string (scope fn) |
| `refresh-delay` | Debounce delay for `refresh` in ms (default 1000 when refresh is present) | integer |
| `minimum-input-length` | Min characters before `refresh` triggers | integer |
| `position` | Dropdown position: `'up'`, `'down'`, `'auto'` | string |

### `<ui-select-choices>` Events

| Event | Signature | Description |
|---|---|---|
| `on-highlight` | `on-highlight="fn(item)"` | Fires when an item is hovered/highlighted |

### Original `repeat` Expression Patterns

```
item in items                                    → full object binding
item in items | filter: $select.search           → with filter
item.id as item in items                         → single-property binding (v-model gets item.id)
item.id as item in items track by item.id        → with identity tracking
(key, value) in objectSource                     → object/dictionary iteration
person.value as (key, person) in peopleObj       → object source + single-property binding
person.key as (key, person) in peopleObj         → object source + key binding
```

### Original Global Config

```js
app.config(['uiSelectConfig', function(uiSelectConfig) {
  uiSelectConfig.theme = 'bootstrap';
  uiSelectConfig.resetSearchInput = true;
  uiSelectConfig.appendToBody = true;
}]);
```

### Original Themes

| Theme | Inspired by | External CSS required |
|---|---|---|
| `bootstrap` | Bootstrap 3 | Bootstrap CSS |
| `select2` | Select2 jQuery widget | Select2 CSS |
| `selectize` | Selectize jQuery widget | Selectize CSS |

---

## Original Demo Examples (All Must Be Matched)

These 16 example families exist on the original demo page and must each have a Vue equivalent:

| # | Example | Key behaviors |
|---|---|---|
| 1 | **Basic** | Single select with Bootstrap, Select2, Selectize variants; remote data source |
| 2 | **Append To Body** | Dropdown escapes overflow/clipping containers (Bootstrap, Select2, Selectize) |
| 3 | **Bind To Single Property** | `v-model` binds a single field (e.g. `person.id`) instead of the full object |
| 4 | **Bind To Single Property Async** | Same as above but options load asynchronously; selected value hydrates correctly |
| 5 | **Bootstrap** | Bootstrap-themed select |
| 6 | **Disable Search** | Search disabled in both single and multiple modes |
| 7 | **Dropdown Position** | `position="up"`, `position="down"`, `position="auto"` |
| 8 | **Event On Selection** | `@select` emits both the selected item and the current model value |
| 9 | **Focus** | `autofocus` prop + imperative focus via exposed method or event |
| 10 | **Group By** | Grouping by string property and by function; ungrouped items (return `undefined`) |
| 11 | **Group Filter** | Filter/sort visible groups by array or function |
| 12 | **Multiple Selection** | Arrays of strings, arrays of objects, deselect callback, single-property binding, grouping, disable-selected-instead-of-remove |
| 13 | **Object As Source** | `{ key: value }` dictionary input; bind by value, by key, or by single property |
| 14 | **Select2 With Bootstrap** | Select2-themed variant with Bootstrap CSS |
| 15 | **Selectize With Bootstrap** | Selectize-themed variant with Bootstrap CSS |
| 16 | **Tagging** | String tags, predictive tag creation, object tags with grouping, token separators (`,`, `/`, `SPACE`) |

### Additional Modern Examples to Add

| # | Example | Key behaviors |
|---|---|---|
| 17 | **Tailwind** | Native Tailwind theme, single select |
| 18 | **Tailwind + Multiple** | Multi-select with Tailwind chip styling |
| 19 | **Tailwind + Grouped** | Grouped items with Tailwind theme |
| 20 | **Tailwind + Tagging** | Tag creation with Tailwind theme |
| 21 | **Tailwind + Teleport** | Append-to-body with Tailwind theme |
| 22 | **Tailwind + States** | Disabled, error, validation states with Tailwind |
| 23 | **Tailwind + Dark Mode** | Dark mode toggle with Tailwind |

---

## AngularJS-to-Vue Compatibility Mapping

### Directive / Binding Translation

| AngularJS | Vue 3 | Notes |
|---|---|---|
| `ng-model="person.selected"` | `v-model="person.selected"` | Direct equivalent |
| `ng-disabled="expr"` | `:disabled="expr"` | Direct equivalent |
| `ng-if` / `ng-show` | `v-if` / `v-show` | Direct equivalent |
| `ng-class` | `:class` | Direct equivalent |
| `multiple` (attribute) | `:multiple="true"` | Prop-based for clarity |
| `on-select="fn($item, $model)"` | `@select="fn"` | Emit payload: `{ item, model }` |
| `on-remove="fn($item, $model)"` | `@remove="fn"` | Emit payload: `{ item, model }` |
| `on-highlight="fn(item)"` | `@highlight="fn"` | Emit payload: `item` |
| `theme="bootstrap"` | `theme="bootstrap"` | Same |
| `close-on-select="false"` | `:close-on-select="false"` | Same |
| `append-to-body="true"` | `:append-to-body="true"` | Uses Vue `<Teleport>` internally |
| `search-enabled="false"` | `:search-enabled="false"` | Same |
| `reset-search-input="false"` | `:reset-search-input="false"` | Same |
| `autofocus` | `autofocus` or `:autofocus="true"` | Same |
| `focus-on="EventName"` | `ref` + `$select.focus()` | **Modernized**: imperative via exposed method or template ref |
| `skip-focusser` | — | **Dropped**: Vue doesn't use the same focusser pattern |
| `limit="3"` | `:limit="3"` | Same |
| `remove-selected="false"` | `:remove-selected="false"` | Same |
| `spinner-enabled` / `spinner-class` | `:loading="isLoading"` + slot | **Modernized**: loading state as prop; spinner rendered via slot or default |
| `input-id="myId"` | `input-id="myId"` | Same |
| `paste="fn"` | `@paste="fn"` | Emit-based |

### `<ui-select-match>` Translation

| AngularJS | Vue 3 | Notes |
|---|---|---|
| `placeholder="..."` | `placeholder="..."` | Same |
| `allow-clear` | `:allow-clear="true"` or `clearable` | Same concept |
| `ui-lock-choice="expr"` | `:lock-choice="predicateFn"` | **Modernized**: predicate function instead of template expression |
| `{{$select.selected.name}}` (single) | Slot: `#default="{ selected }"` → `{{ selected.name }}` | Slot-based |
| `{{$item.name}}` (multi) | Slot: `#default="{ item }"` → `{{ item.name }}` | Slot-based |

### `<ui-select-choices>` Translation

| AngularJS | Vue 3 | Notes |
|---|---|---|
| `repeat="item in items"` | `:items="items"` | **Modernized**: prop-based, no expression parsing |
| `repeat="item.id as item in items"` | `:items="items"` + `:bind-property="'id'"` | **Modernized**: explicit prop |
| `repeat="... track by item.id"` | `:track-by="'id'"` or `:track-by="item => item.id"` | Same concept, prop-based |
| `repeat="(key, val) in obj"` | `:items="obj"` + `:source-type="'object'"` | **Modernized**: explicit source type |
| `\| filter: $select.search` | Built-in (automatic when `search-enabled`) | **Modernized**: internal filtering |
| `\| filter: { name: $select.search }` | `:search-fields="['name']"` | **Modernized**: declarative field list |
| `group-by="'country'"` | `:group-by="'country'"` | Same |
| `group-by="groupFn"` | `:group-by="groupFn"` | Same |
| `group-filter="['A','B']"` | `:group-filter="['A','B']"` | Same |
| `group-filter="filterFn"` | `:group-filter="filterFn"` | Same |
| `ui-disable-choice="item.disabled"` | `:disable-choice="item => item.disabled"` | **Modernized**: predicate function |
| `ui-select-header-group-selectable` | `:group-selectable="true"` | **Modernized**: boolean prop |
| `refresh="loadFn($select.search)"` | `@search="loadFn"` or `:refresh="loadFn"` | **Modernized**: emit or prop |
| `refresh-delay="500"` | `:refresh-delay="500"` or `:debounce="500"` | Same concept |
| `minimum-input-length="3"` | `:minimum-input-length="3"` | Same |
| `position="auto"` | `position="auto"` (on `<ui-select>`) | **Moved** to parent for consistency |
| `ng-bind-html="item.name \| highlight: $select.search"` | Slot: `v-html="highlighted(item.name, search)"` | **Modernized**: helper function in slot scope |

### Tagging Translation

| AngularJS | Vue 3 | Notes |
|---|---|---|
| `tagging` (attribute) | `:tagging="true"` | Same concept |
| `tagging="transformFn"` | `:tagging="transformFn"` | Function receives search string, returns object |
| `tagging-label="(new)"` | `:tagging-label="'(new)'"` | Same |
| `tagging-label="false"` | `:tagging-label="false"` | Same |
| `tagging-tokens="SPACE\|,\|/"` | `:tagging-tokens="[' ', ',', '/']"` | **Modernized**: array of strings; `' '` replaces `SPACE` keyword |

### Global Config Translation

| AngularJS | Vue 3 | Notes |
|---|---|---|
| `uiSelectConfig` provider | `createUiSelectConfig()` or plugin options | **Modernized**: provide/inject or plugin install options |

### Intentional Deviations

| Original Feature | Decision | Rationale |
|---|---|---|
| `repeat` expression parsing | **Dropped** | AngularJS repeat expressions are not idiomatic in Vue. Replaced with explicit props (`:items`, `:bind-property`, `:track-by`). Clearer, type-safe, no custom parser needed. |
| `skip-focusser` | **Dropped** | The AngularJS focusser element pattern doesn't apply to Vue's focus model. |
| `$scope.$broadcast('SetFocus')` | **Replaced** with template ref `.focus()` | Vue's ref/expose pattern is more direct and idiomatic. |
| `spinner-class` | **Replaced** with loading slot | Slot-based customization is more flexible than class injection. |
| `paste` as string function name | **Replaced** with `@paste` emit | Standard Vue event pattern. |
| Filter pipe expressions | **Replaced** with `:search-fields` and `:filter-fn` props | No AngularJS filter system in Vue. Declarative props are clearer. |
| Single-select tagging | **Attempt support**; if unstable, document and drop | Original had known bugs with this mode. |

---

## Public API Design

### Component Hierarchy

```
<ui-select>                     ← Root: owns state, v-model, config
  <ui-select-match>             ← Renders selected value(s) / placeholder
    #default slot               ← Custom selected display
  </ui-select-match>
  <ui-select-choices>           ← Renders dropdown items
    #choice slot                ← Custom item rendering
  </ui-select-choices>
  <ui-select-no-choice>         ← Empty state when no results
    #default slot               ← Custom empty message
  </ui-select-no-choice>
</ui-select>
```

### Full Usage Example

```vue
<ui-select
  v-model="person.selected"
  theme="tailwind"
  :multiple="false"
  :disabled="disabled"
  :search-enabled="true"
  :reset-search-input="true"
  :close-on-select="true"
  :append-to-body="false"
  :clearable="true"
  :remove-selected="true"
  :tagging="false"
  :limit="undefined"
  :loading="isLoading"
  :autofocus="false"
  input-id="person-select"
  position="auto"
  placeholder="Select a person..."
  @select="onSelect"
  @remove="onRemove"
  @search="onSearch"
  @open="onOpen"
  @close="onClose"
>
  <ui-select-match placeholder="Pick someone...">
    <template #default="{ selected }">
      {{ selected.name }}
    </template>
  </ui-select-match>

  <ui-select-choices
    :items="people"
    :track-by="'id'"
    :bind-property="undefined"
    :search-fields="['name', 'email', 'age']"
    :filter-fn="undefined"
    :group-by="'country'"
    :group-filter="undefined"
    :group-selectable="false"
    :disable-choice="item => item.disabled"
    :sort-fn="undefined"
  >
    <template #choice="{ item, search, highlighted, isActive, isSelected, isDisabled }">
      <div v-html="highlighted(item.name, search)"></div>
      <small>
        email: {{ item.email }}
        age: <span v-html="highlighted(String(item.age), search)"></span>
      </small>
    </template>
  </ui-select-choices>

  <ui-select-no-choice>
    No results found.
  </ui-select-no-choice>
</ui-select>
```

### Multi-Select Usage

```vue
<ui-select
  v-model="selectedPeople"
  :multiple="true"
  :remove-selected="false"
  :limit="5"
  theme="tailwind"
>
  <ui-select-match placeholder="Select people...">
    <template #default="{ item, remove }">
      <span class="chip">{{ item.name }} <button @click="remove(item)">×</button></span>
    </template>
  </ui-select-match>

  <ui-select-choices :items="people" :track-by="'id'" :search-fields="['name']">
    <template #choice="{ item, isSelected, isDisabled }">
      {{ item.name }}
    </template>
  </ui-select-choices>
</ui-select>
```

### Tagging Usage

```vue
<ui-select
  v-model="tags"
  :multiple="true"
  :tagging="true"
  :tagging-tokens="[',', ' ']"
  :tagging-label="'(new)'"
  theme="tailwind"
>
  <ui-select-match placeholder="Add tags...">
    <template #default="{ item }">{{ item }}</template>
  </ui-select-match>

  <ui-select-choices :items="availableTags" :search-fields="[]">
    <template #choice="{ item }">{{ item }}</template>
  </ui-select-choices>
</ui-select>
```

### Object-as-Source Usage

```vue
<ui-select v-model="selectedKey">
  <ui-select-match>
    <template #default="{ selected }">{{ selected.name }}</template>
  </ui-select-match>

  <ui-select-choices
    :items="peopleObj"
    source-type="object"
    :bind-property="'key'"
    :search-fields="['value.name']"
  >
    <template #choice="{ item }">
      {{ item.key }}: {{ item.value.name }}
    </template>
  </ui-select-choices>
</ui-select>
```

### Async / Remote Usage

```vue
<ui-select
  v-model="address"
  :loading="isSearching"
  @search="debouncedSearch"
>
  <ui-select-match placeholder="Search address...">
    <template #default="{ selected }">{{ selected.formatted }}</template>
  </ui-select-match>

  <ui-select-choices
    :items="addresses"
    :search-fields="[]"
    :minimum-input-length="2"
    :refresh-delay="300"
  >
    <template #choice="{ item, search, highlighted }">
      <span v-html="highlighted(item.formatted, search)"></span>
    </template>
  </ui-select-choices>
</ui-select>
```

### Exposed Slot Scope (`$select`-equivalent)

The root `<ui-select>` exposes these via scoped slots and/or `defineExpose`:

| Property / Method | Type | Description |
|---|---|---|
| `selected` | `T \| T[] \| null` | Currently selected value(s) |
| `search` | `string` | Current search input text |
| `isOpen` | `boolean` | Whether dropdown is open |
| `activeIndex` | `number` | Index of keyboard-active item |
| `items` | `T[]` | Raw items array |
| `filteredItems` | `T[]` | Items after search filtering |
| `highlighted(text, search)` | `(text: string, search: string) => string` | Returns HTML with search match wrapped in `<mark>` |
| `select(item)` | `(item: T) => void` | Programmatically select an item |
| `remove(item)` | `(item: T) => void` | Programmatically remove a selected item |
| `clear()` | `() => void` | Clear selection |
| `focus()` | `() => void` | Focus the control |
| `blur()` | `() => void` | Blur the control |
| `open()` | `() => void` | Open dropdown |
| `close()` | `() => void` | Close dropdown |
| `createTag(search)` | `(search: string) => T` | Create a tag from search text |

---

## Complete Props Reference

### `<UiSelect>` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `any` | `undefined` | `v-model` binding |
| `multiple` | `boolean` | `false` | Multi-select mode |
| `disabled` | `boolean` | `false` | Disable the entire control |
| `searchEnabled` | `boolean` | `true` | Show/hide search input |
| `resetSearchInput` | `boolean` | `true` | Clear search after selection |
| `closeOnSelect` | `boolean` | `true` | Close dropdown after selecting |
| `appendToBody` | `boolean` | `false` | Teleport dropdown to `<body>` |
| `position` | `'auto' \| 'up' \| 'down'` | `'auto'` | Dropdown direction |
| `theme` | `'bootstrap' \| 'select2' \| 'selectize' \| 'tailwind' \| string` | `'tailwind'` | Active theme |
| `placeholder` | `string` | `''` | Placeholder text |
| `clearable` | `boolean` | `false` | Show clear button (equiv. `allow-clear`) |
| `tagging` | `boolean \| (search: string) => any` | `false` | Enable tagging; function transforms input to tag value |
| `taggingLabel` | `string \| false` | `'(new)'` | Label shown on the "create tag" dropdown row |
| `taggingTokens` | `string[]` | `[',']` | Characters that trigger tag creation |
| `limit` | `number \| undefined` | `undefined` | Max selected items (multi mode) |
| `removeSelected` | `boolean` | `true` | `false` = disable selected items in dropdown instead of hiding |
| `loading` | `boolean` | `false` | Show loading indicator |
| `autofocus` | `boolean` | `false` | Focus on mount |
| `inputId` | `string \| undefined` | `undefined` | `id` for the internal `<input>` |
| `lockChoice` | `(item: any) => boolean` | `undefined` | Predicate: locked items can't be removed (multi) |

### `<UiSelect>` Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `value` | `v-model` update |
| `select` | `{ item, model }` | Item selected |
| `remove` | `{ item, model }` | Item removed |
| `search` | `searchText: string` | Search input changed |
| `highlight` | `item` | Item highlighted via keyboard/hover |
| `open` | — | Dropdown opened |
| `close` | — | Dropdown closed |
| `paste` | `text: string` | Text pasted into input |

### `<UiSelectChoices>` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `any[] \| Record<string, any>` | `[]` | Data source |
| `sourceType` | `'array' \| 'object'` | `'array'` | Interpret `items` as array or key-value object |
| `trackBy` | `string \| ((item: any) => any)` | `undefined` | Identity key for items |
| `bindProperty` | `string \| undefined` | `undefined` | Bind `v-model` to a single property instead of full object |
| `searchFields` | `string[]` | `[]` | Object fields to search (empty = search all string fields) |
| `filterFn` | `(item: any, search: string) => boolean` | `undefined` | Custom filter function |
| `groupBy` | `string \| ((item: any) => string \| undefined)` | `undefined` | Group items |
| `groupFilter` | `string[] \| ((groups: string[]) => string[])` | `undefined` | Filter/sort visible groups |
| `groupSelectable` | `boolean` | `false` | Allow selecting group headers |
| `disableChoice` | `(item: any) => boolean` | `undefined` | Predicate for disabled items |
| `sortFn` | `(a: any, b: any) => number` | `undefined` | Custom sort |
| `minimumInputLength` | `number` | `0` | Min chars before showing results |
| `refreshDelay` | `number` | `0` | Debounce delay (ms) for search events |

### `<UiSelectChoices>` Scoped Slot: `#choice`

| Property | Type | Description |
|---|---|---|
| `item` | `any` | The current item (for object sources: `{ key, value }`) |
| `index` | `number` | Item index in filtered list |
| `search` | `string` | Current search text |
| `highlighted` | `(text: string, search: string) => string` | Highlight helper returning HTML |
| `isActive` | `boolean` | Keyboard-active (highlighted) |
| `isSelected` | `boolean` | Already selected |
| `isDisabled` | `boolean` | Disabled via `disableChoice` |

### `<UiSelectMatch>` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | `''` | Placeholder when nothing selected |

### `<UiSelectMatch>` Scoped Slots

**Single mode** — `#default="{ selected, search, isOpen }"`:
- `selected`: the selected value

**Multi mode** — `#default="{ item, remove, isLocked }"`:
- `item`: individual selected item (iterated)
- `remove`: `(item) => void` to deselect
- `isLocked`: whether this item is locked

### `<UiSelectNoChoice>`

Renders its default slot content when the filtered item list is empty. No props required.

---

## Feature Requirements

### A. Base Behavior
- Single select with search, clear, placeholder
- Multi-select with chip/tag rendering, remove buttons
- Open/close dropdown
- Disabled state (entire control)
- `reset-search-input` option
- `close-on-select` option
- `search-enabled` toggle
- Controlled search via `@search` emit + `:items` reactivity (for async)

### B. Data Input Support
- Array of primitives (strings, numbers)
- Array of objects
- Object/dictionary source (`{ key: value }` pairs)
- Async/remote loading via `@search` + external state
- `:search-fields` for declarative field-based filtering
- `:filter-fn` for fully custom filtering
- `:track-by` for stable identity
- `:bind-property` for single-property binding (v-model gets `item[prop]` not the whole object)
- `:disable-choice` predicate
- `:sort-fn` custom sort
- `:remove-selected="false"` to disable-instead-of-hide selected items

### C. Match Rendering
- Single: custom slot for selected display, placeholder
- Multi: iterated slot per selected item, remove button, locked items
- Clearable button (single mode)

### D. Choices Rendering
- Custom `#choice` slot with full state context
- Active/highlighted/selected/disabled states exposed
- Grouped rendering with group headers
- Group filtering and sorting
- Empty state via `<ui-select-no-choice>`
- "Create tag" row when tagging is enabled

### E. Tagging / Creatable
- String tags (primitives)
- Object tags via transform function
- Custom tag factory (`tagging` as function)
- Predictive creation (show tag row while typing)
- `tagging-label` for the dropdown row text
- Token separator support (`,`, `/`, ` ` etc.) via `:tagging-tokens`
- Attempt single-select tagging; if unstable, document and drop with rationale

### F. Async Support
- `@search` emit for remote queries
- `:loading` prop for loading state display
- `:refresh-delay` / `:debounce` for debouncing
- `:minimum-input-length` to gate search
- Race condition protection (discard stale results)
- Selected-value hydration when using `:bind-property` with async items

### G. Overlay / Dropdown Positioning
- `<Teleport to="body">` when `:append-to-body="true"`
- `position: 'auto' | 'up' | 'down'`
- Recalculate on scroll and resize
- Outside-click close
- Escape key close
- Escape overflow clipping in modals / scrollable containers

### H. Accessibility (WAI-ARIA)
- `role="combobox"` on root
- `role="listbox"` on dropdown
- `role="option"` on items
- `aria-activedescendant` tracking
- `aria-expanded`, `aria-owns`, `aria-label`
- Keyboard: ↑ ↓ (navigate), Enter (select), Escape (close), Tab (close + move focus), Backspace (remove last tag in multi), Home/End (first/last item)
- Focus management: focus returns to control after selection
- Screen reader announcements for state changes

### I. Performance
- Avoid wasteful recomputation (memoize filtered items)
- Stable object identity via `track-by`
- Large dataset strategy: document virtual scrolling as future enhancement or optional opt-in
- Debounce search filtering for large local lists if needed

---

## Theme Architecture

### Chosen Approach: Internal Semantic Classes + Exported CSS + Data Attributes

Each theme ships as a standalone CSS file. Components render stable semantic CSS classes and `data-*` attributes. Themes target these hooks.

**Why this approach:**
- Themes are self-contained and swappable
- No headless/wrapper complexity for consumers
- Data attributes enable Tailwind `@apply` and arbitrary selectors
- CSS variables provide fine-grained overrides
- Slots remain available for full structural customization

### Built-In Themes

| Theme | File | External dependency |
|---|---|---|
| `bootstrap` | `dist/themes/bootstrap.css` | Bootstrap 5 CSS (peer) |
| `select2` | `dist/themes/select2.css` | None (self-contained styles inspired by Select2) |
| `selectize` | `dist/themes/selectize.css` | None (self-contained styles inspired by Selectize) |
| `tailwind` | `dist/themes/tailwind.css` | Tailwind CSS (peer) — uses `@apply` or utility classes |

### Tailwind Theme Requirements (First-Class)

The Tailwind theme is **not** an afterthought. It must:

- Feel native in Tailwind projects
- Not depend on Bootstrap / Select2 / Selectize CSS
- Support light and dark mode (`dark:` variants)
- Support focus rings (`ring-*`)
- Style **every** component part:
  - Root control container
  - Input / search region
  - Placeholder text
  - Single selected value display
  - Multi tags/chips with remove buttons
  - Dropdown panel (shadow, border, max-height, scroll)
  - Choice rows (hover, active, selected, disabled states)
  - Group headers
  - "Create tag" row styling
  - "No choice" empty state
  - Loading spinner
  - Error / validation state (red ring, error text)

### Tailwind Override Strategy

Consumers can customize via:
1. **Class props**: `:class-*` props on components for targeted overrides
2. **Data attributes**: `data-ui-select`, `data-ui-select-match`, `data-ui-select-choice`, etc. for CSS selectors
3. **CSS variables**: `--ui-select-*` custom properties for colors, spacing, radius
4. **Slots**: Full structural replacement when needed
5. **Optional Tailwind plugin/preset**: If warranted, expose a `tailwind.config` preset

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Vue 3.x** | Component framework |
| **Composition API** | All internal logic |
| **TypeScript** | Full typing: props, emits, slots, composables, public API |
| **Vite** | Dev server, library build, demo app bundling |
| **Vitest** | Unit and integration tests |
| **Vue Test Utils** | Component mounting/interaction in tests |
| **Playwright** | End-to-end browser tests against the demo app |
| **Teleport** | Append-to-body dropdown rendering |

**Do NOT use:** AngularJS, jQuery, or brittle DOM hacks.

---

## Repository Structure

```
vue-ui-select/
├── src/
│   ├── components/
│   │   ├── UiSelect.vue
│   │   ├── UiSelectMatch.vue
│   │   ├── UiSelectChoices.vue
│   │   └── UiSelectNoChoice.vue
│   ├── composables/
│   │   ├── useSelectState.ts
│   │   ├── useSelectFiltering.ts
│   │   ├── useSelectKeyboard.ts
│   │   ├── useSelectPositioning.ts
│   │   ├── useSelectTagging.ts
│   │   ├── useSelectAccessibility.ts
│   │   ├── useModelBinding.ts
│   │   └── useThemeClasses.ts
│   ├── themes/
│   │   ├── bootstrap.css
│   │   ├── select2.css
│   │   ├── selectize.css
│   │   └── tailwind.css
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── highlight.ts
│   │   ├── objectSource.ts
│   │   └── debounce.ts
│   ├── symbols.ts              ← provide/inject keys
│   └── index.ts                ← public entry: components, types, plugin
├── playground/
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── router.ts
│   │   ├── data/               ← mock datasets
│   │   └── pages/              ← one page per example
│   │       ├── BasicPage.vue
│   │       ├── AppendToBodyPage.vue
│   │       ├── BindSinglePropertyPage.vue
│   │       ├── BindSinglePropertyAsyncPage.vue
│   │       ├── DisableSearchPage.vue
│   │       ├── DropdownPositionPage.vue
│   │       ├── EventOnSelectionPage.vue
│   │       ├── FocusPage.vue
│   │       ├── GroupByPage.vue
│   │       ├── GroupFilterPage.vue
│   │       ├── MultipleSelectionPage.vue
│   │       ├── ObjectAsSourcePage.vue
│   │       ├── TaggingPage.vue
│   │       ├── BootstrapThemePage.vue
│   │       ├── Select2ThemePage.vue
│   │       ├── SelectizeThemePage.vue
│   │       ├── TailwindPage.vue
│   │       ├── TailwindMultiplePage.vue
│   │       ├── TailwindGroupedPage.vue
│   │       ├── TailwindTaggingPage.vue
│   │       ├── TailwindTeleportPage.vue
│   │       ├── TailwindStatesPage.vue
│   │       └── TailwindDarkModePage.vue
│   ├── index.html
│   └── vite.config.ts
├── tests/
│   ├── unit/                   ← Vitest + Vue Test Utils
│   │   ├── UiSelect.test.ts
│   │   ├── UiSelectMatch.test.ts
│   │   ├── UiSelectChoices.test.ts
│   │   ├── UiSelectNoChoice.test.ts
│   │   ├── filtering.test.ts
│   │   ├── keyboard.test.ts
│   │   ├── tagging.test.ts
│   │   ├── grouping.test.ts
│   │   ├── async.test.ts
│   │   ├── positioning.test.ts
│   │   ├── accessibility.test.ts
│   │   ├── objectSource.test.ts
│   │   ├── bindProperty.test.ts
│   │   └── themes.test.ts
│   └── e2e/                    ← Playwright
│       ├── basic.spec.ts
│       ├── multiSelect.spec.ts
│       ├── search.spec.ts
│       ├── keyboard.spec.ts
│       ├── appendToBody.spec.ts
│       ├── dropdownPosition.spec.ts
│       ├── grouping.spec.ts
│       ├── bindProperty.spec.ts
│       ├── async.spec.ts
│       ├── tagging.spec.ts
│       ├── objectSource.spec.ts
│       ├── events.spec.ts
│       ├── focus.spec.ts
│       ├── disableSearch.spec.ts
│       ├── themes.spec.ts
│       └── tailwindDarkMode.spec.ts
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vite.config.ts              ← library build config
├── vitest.config.ts
├── playwright.config.ts
├── .gitignore
├── LICENSE
├── README.md
└── context.md                  ← this file (dev only, not published)
```

---

## NPM Package Configuration

### `package.json` Key Fields

```jsonc
{
  "name": "vue-ui-select",
  "version": "0.1.0",
  "type": "module",
  "license": "MIT",
  "main": "./dist/vue-ui-select.umd.cjs",
  "module": "./dist/vue-ui-select.es.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/vue-ui-select.es.js",
      "require": "./dist/vue-ui-select.umd.cjs",
      "types": "./dist/types/index.d.ts"
    },
    "./dist/themes/*.css": "./dist/themes/*.css",
    "./themes/*": "./dist/themes/*"
  },
  "files": [
    "dist/",
    "README.md",
    "LICENSE"
  ],
  "sideEffects": [
    "**/*.css"
  ],
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "scripts": {
    "dev": "vite --config playground/vite.config.ts",
    "build": "vite build && vue-tsc --emitDeclarationOnly",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "vitest run && playwright test",
    "lint": "eslint src/",
    "typecheck": "vue-tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test:all"
  }
}
```

### Consumer Installation

```bash
npm install vue-ui-select
```

```ts
// main.ts — global registration
import { createApp } from 'vue'
import { UiSelectPlugin } from 'vue-ui-select'
import 'vue-ui-select/themes/tailwind.css'  // or bootstrap.css, select2.css, selectize.css

const app = createApp(App)
app.use(UiSelectPlugin, { theme: 'tailwind' })  // optional global config
app.mount('#app')
```

```ts
// or local import
import { UiSelect, UiSelectMatch, UiSelectChoices, UiSelectNoChoice } from 'vue-ui-select'
import 'vue-ui-select/themes/tailwind.css'
```

---

## Demo / Playground Requirements

The demo app must:
- Run with `npm run dev`
- Use **local source** (not npm-installed build)
- Have **Vue Router** with one route per example
- Include a **sidebar/nav** listing all examples
- Use **realistic mock data** (people with name, email, age, country)
- Include one **async mock** using `setTimeout` / delayed Promise (no external server)
- Serve as the **Playwright test target**
- Include `data-testid` attributes on key interactive elements

---

## Testing Requirements

### Unit / Integration Tests (Vitest + Vue Test Utils)

Cover every feature surface:

- Single select: open, select, close, v-model update
- Multi select: add, remove, chip rendering, limit
- Primitive arrays and object arrays
- Bind-to-single-property correctness
- Object source key/value data
- Search filtering (field-based, custom function)
- Disabled search mode
- Group-by (string and function)
- Group-filter (array and function)
- `@select` payload: `{ item, model }`
- `@remove` payload: `{ item, model }`
- Clear behavior
- Reset-search-input behavior
- Close-on-select behavior
- Async loading (mock delayed data)
- Async race condition handling (stale result discard)
- Append-to-body / Teleport rendering
- Dropdown positioning logic
- Tagging: create, token separators, label
- Remove-selected vs disable-selected
- Keyboard: arrows, enter, escape, tab, backspace, home/end
- ARIA attributes: roles, aria-activedescendant, aria-expanded
- Focus / autofocus
- Duplicate identity handling
- Theme class application
- Lock-choice in multi mode

### Playwright E2E Tests

Run against the demo app (`npm run dev`). Cover real user interactions:

- Basic single select flow (click, search, select, verify)
- Multiple selection flow (add several, remove one)
- Search typing and filtering
- Disable search: input not present
- Keyboard-only: tab to control, arrow down, enter to select, escape to close
- Append-to-body: dropdown renders in `<body>`, positioned correctly
- Dropdown position: up, down, auto
- Grouped rendering: headers visible, items under correct groups
- Group filter: only specified groups shown
- Bind-to-single-property: v-model output is a primitive, not object
- Async: type, wait for loading, results appear, select
- Tag creation: type new value, press enter/comma, tag appears
- Tag token separators: comma, space, slash
- Remove tag: click × on chip
- Object source: dict input renders items, selection works
- Event output: `@select` fires with correct payload (check displayed output)
- Focus: click focus button → control is focused
- Clearable: click × → selection cleared
- Disabled: control not interactive
- Dark mode: toggle dark mode, verify Tailwind dark classes apply
- No-choice: search for nonexistent → empty message shown
- Escape close: press Escape → dropdown closes
- Outside click: click outside → dropdown closes
- Teleported dropdown: interact through teleported overlay
- Theme smoke tests: each theme renders without errors

### Playwright Implementation Rules

- Use `data-testid` attributes as primary selectors
- Use `role`-based selectors where appropriate (`getByRole('combobox')`, `getByRole('option')`)
- Avoid brittle timing: use `waitForSelector`, `toBeVisible`, `toHaveText` etc.
- Mock data must be deterministic (no randomness)
- Headless by default; provide `--headed` and `--ui` instructions
- CI-friendly: no external dependencies

### Commands

```bash
npm run test          # Vitest unit/integration
npm run test:watch    # Vitest in watch mode
npm run test:e2e      # Playwright headless
npm run test:e2e:ui   # Playwright UI mode
npm run test:all      # All tests
```

---

## Internal Architecture (Composables)

The implementation should decompose into focused composables:

| Composable | Responsibility |
|---|---|
| `useSelectState` | Core reactive state: open, search, selected, activeIndex |
| `useSelectFiltering` | Filter items by search text, search-fields, filter-fn, minimum-input-length |
| `useSelectKeyboard` | Arrow keys, enter, escape, tab, backspace, home/end handlers |
| `useSelectPositioning` | Calculate dropdown position (up/down/auto), scroll/resize listeners |
| `useSelectTagging` | Tag creation, token parsing, tagging-label, tagging-tokens |
| `useSelectAccessibility` | ARIA attrs, activeDescendant, live region announcements |
| `useModelBinding` | v-model ↔ internal state sync, bind-property transform, track-by identity |
| `useThemeClasses` | Resolve theme-specific CSS classes based on active theme prop |

Communication between `<ui-select>` and its children uses Vue `provide`/`inject` via typed Symbol keys.

---

## Execution Plan (Phased)

Implement in this order. Each phase should be a complete, testable increment.

### Phase 1 — Scaffolding
- Repository structure
- `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`
- Build pipeline (library build + type generation)
- Empty component shells that render basic HTML

### Phase 2 — Core Logic
- Types and interfaces
- `useSelectState`, `useModelBinding`, `useSelectFiltering`
- provide/inject context
- Single select working end-to-end with v-model

### Phase 3 — Components
- `UiSelect.vue`, `UiSelectMatch.vue`, `UiSelectChoices.vue`, `UiSelectNoChoice.vue`
- Slot contracts with scoped data
- Emit contracts
- Multi-select support
- Search input

### Phase 4 — Advanced Features
- `useSelectKeyboard` (full keyboard support)
- `useSelectAccessibility` (ARIA)
- `useSelectPositioning` (up/down/auto)
- `useSelectTagging` (tagging, tokens)
- Append-to-body (Teleport)
- Bind-to-single-property
- Object-as-source
- Group-by, group-filter
- Async support, debounce, minimum-input-length

### Phase 5 — Themes
- Theme CSS architecture (semantic classes + data attributes)
- `bootstrap.css`
- `select2.css`
- `selectize.css`
- `tailwind.css` (light + dark mode, all states)

### Phase 6 — Demo App
- Playground with Vue Router
- One page per example (all 23)
- Mock data, async mock
- Sidebar navigation
- `data-testid` attributes

### Phase 7 — Tests
- Vitest unit/integration test suite
- Playwright E2E test suite
- Test helpers and fixtures

### Phase 8 — Docs & Publishing
- `README.md` with install, usage, API, theming, examples
- Migration guide (AngularJS → Vue)
- Compatibility matrix
- npm publish workflow

---

## Quality Bar

> **Checkbox Multi-Select Feature (added post-v0.1.2)**
>
> A `show-checkboxes` Boolean prop was added to `<ui-select-choices>` that renders native `<input type="checkbox">` elements inline before each choice row. The checkbox state is automatically synced to selection state. Clicking a checked item toggles it off via `ctx.removeItem()`. The feature is fully opt-in — when `showCheckboxes` is `false` (default), zero DOM or CSS changes occur.
>
> Best paired with `:remove-selected="false"` (keep items visible) and `:close-on-select="false"` (keep dropdown open).
>
> **Files changed:**
> - `src/components/UiSelectChoices.vue` — `showCheckboxes` prop, checkbox `<input>` in template, toggle-off logic in `handleItemClick`
> - `src/types/index.ts` — `showCheckboxes` added to `UiSelectChoicesProps`
> - `src/themes/{bootstrap,select2,selectize,tailwind}.css` — `.ui-select-choices__checkbox` and scoped flex layout via `[data-show-checkboxes]`
> - `playground/src/pages/CheckboxSelectionPage.vue` — 4 demos (strings, objects, searchable, default comparison)
> - `playground/src/router.ts` — `/checkbox-selection` route
> - `README.md` — prop table entry + usage example

The implementation must be:

- **Senior-level**: clean architecture, proper abstractions, no shortcuts
- **Production-grade**: error handling, edge cases, stable DOM
- **Library-quality**: typed public API, documented props/emits/slots, semantic versioning
- **Complete**: every feature in this spec implemented or explicitly documented as excluded with rationale
- **Tested**: meaningful coverage — not shallow snapshots, but real interaction tests
- **Honest**: explicit about tradeoffs, deviations, and limitations

Avoid:
- Vague architecture without implementation
- Toy examples pretending to be library code
- Shallow pseudo-solutions
- Under-testing
- Skipping package/publish details
- Treating Tailwind as an afterthought

---

## Output Format

When implementing, produce results in this order:

1. Architecture summary (brief)
2. File/folder structure
3. Configuration files (`package.json`, `tsconfig`, `vite.config`, `vitest.config`, `playwright.config`)
4. Core types (`src/types/index.ts`)
5. Composables (`src/composables/`)
6. Components (`src/components/`)
7. Theme CSS files (`src/themes/`)
8. Public entry point (`src/index.ts`)
9. Demo app (`playground/`)
10. Unit tests (`tests/unit/`)
11. E2E tests (`tests/e2e/`)
12. README.md

---

## Key Design Principles

1. **Preserve the original spirit**, not AngularJS implementation details.
2. **Modernize only when it materially improves** Vue 3 DX or library health.
3. **Explain every intentional deviation** from the original API.
4. **Keep DOM stable** for theming and testing (`data-testid`, semantic classes).
5. **Type everything**: props, emits, slot scopes, composable returns.
6. **Prefer real code** over pseudocode.
7. **Include `data-testid`** hooks on all interactive elements.
8. **SSR-safe patterns**: guard `window`/`document` access, handle Teleport gracefully.
