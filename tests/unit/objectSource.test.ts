// ============================================================
// objectSource utility tests
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  normalizeObjectSource,
  resolveBindValue,
  getNestedValue,
  resolveTrackBy,
} from '../../src/utils/objectSource'

describe('normalizeObjectSource', () => {
  it('converts { key: value } to array of { key, value }', () => {
    const result = normalizeObjectSource({ a: 'Apple', b: 'Banana' })
    expect(result).toEqual([
      { key: 'a', value: 'Apple' },
      { key: 'b', value: 'Banana' },
    ])
  })

  it('handles empty object', () => {
    expect(normalizeObjectSource({})).toEqual([])
  })

  it('preserves object values', () => {
    const result = normalizeObjectSource({ x: { id: 1, name: 'X' } })
    expect(result).toEqual([{ key: 'x', value: { id: 1, name: 'X' } }])
  })
})

describe('getNestedValue', () => {
  it('returns value at simple path', () => {
    expect(getNestedValue({ name: 'Alice' }, 'name')).toBe('Alice')
  })

  it('returns value at nested path', () => {
    expect(getNestedValue({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42)
  })

  it('returns undefined for missing path', () => {
    expect(getNestedValue({ a: 1 }, 'b')).toBeUndefined()
  })

  it('returns obj if path is empty', () => {
    const obj = { a: 1 }
    expect(getNestedValue(obj, '')).toBe(obj)
  })

  it('returns null/undefined obj as-is', () => {
    expect(getNestedValue(null, 'a')).toBe(null)
    expect(getNestedValue(undefined, 'a')).toBe(undefined)
  })
})

describe('resolveBindValue', () => {
  it('returns item as-is when no bindProperty', () => {
    const item = { id: 1, name: 'Alice' }
    expect(resolveBindValue(item)).toBe(item)
  })

  it('returns nested value when bindProperty is set', () => {
    const item = { id: 1, name: 'Alice' }
    expect(resolveBindValue(item, 'id')).toBe(1)
  })

  it('supports dot-notation paths', () => {
    const item = { meta: { code: 'ABC' } }
    expect(resolveBindValue(item, 'meta.code')).toBe('ABC')
  })
})

describe('resolveTrackBy', () => {
  it('returns item when no trackBy', () => {
    const item = { id: 1 }
    expect(resolveTrackBy(item)).toBe(item)
  })

  it('resolves string trackBy', () => {
    expect(resolveTrackBy({ id: 42, name: 'X' }, 'id')).toBe(42)
  })

  it('resolves function trackBy', () => {
    const fn = (item: any) => `${item.type}-${item.id}`
    expect(resolveTrackBy({ id: 1, type: 'person' }, fn)).toBe('person-1')
  })
})
