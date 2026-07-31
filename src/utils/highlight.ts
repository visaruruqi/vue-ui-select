/**
 * Wraps matching portions of `text` in <mark> tags for visual highlighting.
 * Escapes HTML to prevent XSS.
 *
 * Matching runs on the RAW text and escaping happens per segment afterwards.
 * The old escape-first order had two failure modes on text containing
 * `& < > " '`: a search term with one of those characters could never match
 * its own escaped text ("AT&T" vs "AT&amp;T"), and a term like "amp" or "lt"
 * matched INSIDE an entity, splitting it with <mark> and corrupting the
 * rendered output.
 */
export function highlightText(text: string, search: string): string {
  const raw = text ?? ''
  if (!search || !raw) return escapeHtml(raw)

  const regex = new RegExp(escapeRegExp(search), 'gi')
  let result = ''
  let lastIndex = 0

  for (const match of raw.matchAll(regex)) {
    const start = match.index ?? 0
    result += escapeHtml(raw.slice(lastIndex, start))
    result += `<mark>${escapeHtml(match[0])}</mark>`
    lastIndex = start + match[0].length
  }

  return result + escapeHtml(raw.slice(lastIndex))
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
