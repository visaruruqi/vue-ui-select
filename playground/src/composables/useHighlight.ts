/**
 * Shared syntax highlighter used by ExampleSection and InstallPage.
 * Produces HTML with inline VS Code–like colours.
 */

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function highlight(code: string): string {
  const escaped = esc(code)
  return escaped
    // Comments  <!-- ... -->  and  // ...
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color:#6a9955">$1</span>')
    .replace(/(\/\/.*)/g, '<span style="color:#6a9955">$1</span>')
    // Template/script/style tags
    .replace(/(&lt;\/?(?:template|script|style)[^&]*?&gt;)/g, '<span style="color:#569cd6">$1</span>')
    // Vue directives & special attrs  v-xxx, :xxx, @xxx, #xxx
    .replace(/\b(v-[\w.-]+|:[a-z][\w.-]*|@[\w.-]+|#[\w.-]+)(=)/g, '<span style="color:#c586c0">$1</span><span style="color:#d4d4d4">$2</span>')
    .replace(/\b(v-[\w.-]+|:[a-z][\w.-]*|@[\w.-]+|#[\w.-]+)(?=[\s/&])/g, '<span style="color:#c586c0">$1</span>')
    // Tag names  <ui-select...> etc.
    .replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span style="color:#4ec9b0">$2</span>')
    // Strings  "..." and '...'
    .replace(/(=&quot;)(.*?)(&quot;)/g, '$1<span style="color:#ce9178">$2</span>$3')
    .replace(/(=&#39;)(.*?)(&#39;)/g, '$1<span style="color:#ce9178">$2</span>$3')
    .replace(/(&#39;)([\w/.@-]+)(&#39;)/g, '$1<span style="color:#ce9178">$2</span>$3')
    .replace(/((?:^|[\s(,])&quot;)([\w/.@-]+)(&quot;)/gm, '$1<span style="color:#ce9178">$2</span>$3')
    // Mustache interpolation {{ ... }}
    .replace(/(\{\{)([\s\S]*?)(\}\})/g, '<span style="color:#dcdcaa">$1$2$3</span>')
    // JS keywords
    .replace(/\b(import|from|export|const|let|var|function|return|if|else|async|await|ref|computed|reactive|default|new|type)\b/g, '<span style="color:#569cd6">$1</span>')
    // Types / special values
    .replace(/\b(true|false|null|undefined|string|number|boolean|any)\b/g, '<span style="color:#4fc1ff">$1</span>')
}
