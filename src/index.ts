// ============================================================
// vue-ui-select — Public Entry Point
// ============================================================

import type { App, Plugin } from 'vue'
import UiSelect from './components/UiSelect.vue'
import UiSelectMatch from './components/UiSelectMatch.vue'
import UiSelectChoices from './components/UiSelectChoices.vue'
import UiSelectNoChoice from './components/UiSelectNoChoice.vue'
import { UI_SELECT_OPTIONS } from './symbols'
import type { UiSelectPluginOptions } from './types'

// ---- Plugin ----

export const UiSelectPlugin: Plugin = {
  install(app: App, options?: UiSelectPluginOptions) {
    const opts: UiSelectPluginOptions = {
      theme: 'tailwind',
      ...options,
    }

    app.provide(UI_SELECT_OPTIONS, opts)

    const prefix = opts.prefix || ''
    app.component(`${prefix}UiSelect`, UiSelect)
    app.component(`${prefix}UiSelectMatch`, UiSelectMatch)
    app.component(`${prefix}UiSelectChoices`, UiSelectChoices)
    app.component(`${prefix}UiSelectNoChoice`, UiSelectNoChoice)

    // Also register kebab-case aliases
    app.component(`${prefix}ui-select`, UiSelect)
    app.component(`${prefix}ui-select-match`, UiSelectMatch)
    app.component(`${prefix}ui-select-choices`, UiSelectChoices)
    app.component(`${prefix}ui-select-no-choice`, UiSelectNoChoice)
  },
}

// ---- Component exports ----

export { UiSelect, UiSelectMatch, UiSelectChoices, UiSelectNoChoice }

// ---- Type exports ----

export type {
  UiSelectProps,
  UiSelectChoicesProps,
  UiSelectMatchProps,
  UiSelectEmits,
  UiSelectContext,
  UiSelectPluginOptions,
  UiSelectPluginDefaults,
  ChoiceSlotScope,
  MatchSingleSlotScope,
  MatchMultiSlotScope,
  GroupedItems,
  ObjectSourceItem,
  DropdownPosition,
  ThemeName,
  SelectEventPayload,
  RemoveEventPayload,
  ChoicesConfig,
} from './types'

// ---- Utility exports ----

export { highlightText } from './utils/highlight'
export { normalizeObjectSource, resolveBindValue, getNestedValue, resolveTrackBy } from './utils/objectSource'
export { debounce } from './utils/debounce'

// ---- Symbol exports ----

export { UI_SELECT_CONTEXT, UI_SELECT_OPTIONS } from './symbols'

// ---- Default export ----

export default UiSelectPlugin
