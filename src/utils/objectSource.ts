import type { ObjectSourceItem } from '../types'

/**
 * Convert a Record<string, V> into an array of { key, value } objects
 * suitable for iteration and display.
 */
export function normalizeObjectSource<V = any>(
  obj: Record<string, V>
): ObjectSourceItem<V>[] {
  return Object.entries(obj).map(([key, value]) => ({ key, value }))
}

/**
 * Get the value to use for v-model binding based on bindProperty.
 * For object sources, item is { key, value }.
 */
export function resolveBindValue(item: any, bindProperty?: string): any {
  if (!bindProperty) return item
  return getNestedValue(item, bindProperty)
}

/**
 * Get a nested property value using dot notation.
 * e.g. getNestedValue({ a: { b: 1 } }, 'a.b') => 1
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return obj
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

/**
 * Resolve the identity of an item using trackBy config.
 */
export function resolveTrackBy(item: any, trackBy?: string | ((item: any) => any)): any {
  if (!trackBy) return item
  if (typeof trackBy === 'function') return trackBy(item)
  return getNestedValue(item, trackBy)
}
