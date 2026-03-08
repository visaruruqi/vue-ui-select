// ============================================================
// highlight utility tests
// ============================================================

import { describe, it, expect } from 'vitest'
import { highlightText } from '../../src/utils/highlight'

describe('highlightText', () => {
  it('returns escaped text when search is empty', () => {
    expect(highlightText('Hello', '')).toBe('Hello')
  })

  it('returns empty string when text is empty', () => {
    expect(highlightText('', 'foo')).toBe('')
  })

  it('wraps matching substring in <mark> tags', () => {
    expect(highlightText('Hello World', 'world')).toBe('Hello <mark>World</mark>')
  })

  it('is case-insensitive', () => {
    expect(highlightText('FooBar', 'foobar')).toBe('<mark>FooBar</mark>')
  })

  it('highlights multiple occurrences', () => {
    expect(highlightText('abcabc', 'abc')).toBe('<mark>abc</mark><mark>abc</mark>')
  })

  it('escapes HTML entities in text', () => {
    expect(highlightText('<script>alert("xss")</script>', 'script')).toBe(
      '&lt;<mark>script</mark>&gt;alert(&quot;xss&quot;)&lt;/<mark>script</mark>&gt;'
    )
  })

  it('handles regex special characters in search', () => {
    expect(highlightText('price is $100.00', '$100')).toBe('price is <mark>$100</mark>.00')
  })

  it('handles null/undefined text gracefully', () => {
    expect(highlightText(null as any, 'test')).toBe('')
    expect(highlightText(undefined as any, 'test')).toBe('')
  })
})
