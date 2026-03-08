import type { InjectionKey } from 'vue'
import type { UiSelectContext, UiSelectPluginOptions } from './types'

/** Provide/inject key for parent UiSelect → child components */
export const UI_SELECT_CONTEXT: InjectionKey<UiSelectContext> = Symbol('UiSelectContext')

/** Provide/inject key for global plugin options */
export const UI_SELECT_OPTIONS: InjectionKey<UiSelectPluginOptions> = Symbol('UiSelectOptions')
