const keywords = new Set([
  'local', 'function', 'if', 'then', 'else', 'elseif', 'end', 'for', 'in', 'do', 'while',
  'return', 'and', 'or', 'not', 'nil', 'true', 'false', 'repeat', 'until',
])

const tokenPattern = /(--[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g

// Small Lua tokenizer: enough for doc examples, no dependency.
export function highlightLua(code) {
  const tokens = []
  for (const match of code.matchAll(tokenPattern)) {
    const [text, comment, string, number, word] = match
    if (comment) tokens.push({ type: 'comment', text })
    else if (string) tokens.push({ type: 'string', text })
    else if (number) tokens.push({ type: 'number', text })
    else if (word) {
      const isCall = code[match.index + text.length] === '('
      if (keywords.has(text)) tokens.push({ type: 'keyword', text })
      else if (isCall) tokens.push({ type: 'fn', text })
      else tokens.push({ type: 'plain', text })
    } else tokens.push({ type: 'plain', text })
  }
  return tokens
}
