/**
 * Wraps matching portions of `text` in <mark> tags for visual highlighting.
 * Escapes HTML to prevent XSS.
 */
export function highlightText(text: string, search: string): string {
  if (!search || !text) return escapeHtml(text ?? '')
  const escaped = escapeHtml(text)
  const searchEscaped = escapeRegExp(search)
  const regex = new RegExp(`(${searchEscaped})`, 'gi')
  return escaped.replace(regex, '<mark>$1</mark>')
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
