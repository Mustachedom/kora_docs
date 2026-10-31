import React from 'react'
import { highlightLua } from './highlight.js'

const plain = (value) => value.replace(/^#+\s*/, '').replace(/[`*_~]/g, '').trim()
const slug = (value) => plain(value).toLowerCase().replace(/[^\w.-]+/g, '-').replace(/^-|-$/g, '')

function Inline({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)
  return <>{parts.map((part, index) => {
    if (part.startsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
    if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>
    return part
  })}</>
}

const isTableDivider = (line) => /^\s*\|?\s*:?-{3,}/.test(line)
const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())

function CodeBlock({ code, language }) {
  const tokens = language === 'lua' ? highlightLua(code) : [{ type: 'plain', text: code }]
  return <div className="reference-code"><div className="reference-code-label">{language || 'Code'}</div><pre><code>{tokens.map((token, index) => <span key={index} className={`tok-${token.type}`}>{token.text}</span>)}</code></pre></div>
}

export default function MarkdownDocument({ markdown }) {
  const lines = markdown.replace(/\r/g, '').split('\n')
  const blocks = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim() || /^<!--/.test(line.trim())) { index += 1; continue }
    const fence = line.match(/^\s*```\s*([\w-]*)/)
    if (fence) {
      const code = []
      index += 1
      while (index < lines.length && !/^\s*```/.test(lines[index])) code.push(lines[index++])
      index += 1
      blocks.push(<CodeBlock key={blocks.length} code={code.join('\n')} language={fence[1]} />)
      continue
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      index += 1
      if (heading[1].length === 1) continue
      const text = heading[2].replace(/\s+#+\s*$/, '')
      const id = slug(text)
      const props = { id: `method-${id}`, 'data-method': id }
      const content = <Inline text={text} />
      if (heading[1].length === 2) blocks.push(<h2 key={blocks.length} {...props}>{content}</h2>)
      else if (heading[1].length === 3) blocks.push(<h3 key={blocks.length} {...props}>{content}</h3>)
      else blocks.push(<h4 key={blocks.length} {...props}>{content}</h4>)
      continue
    }
    if (line.trim().startsWith('|') && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const header = cells(lines[index])
      index += 2
      const rows = []
      while (index < lines.length && lines[index].trim().startsWith('|')) rows.push(cells(lines[index++]))
      blocks.push(<div className="reference-table-wrap" key={blocks.length}><table className="reference-table"><thead><tr>{header.map((cell, cellIndex) => <th key={cellIndex}><Inline text={cell} /></th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{header.map((_, cellIndex) => <td key={cellIndex}><Inline text={row[cellIndex] || ''} /></td>)}</tr>)}</tbody></table></div>)
      continue
    }
    if (/^\s*([-*+] |\d+\. )/.test(line)) {
      const ordered = /^\s*\d+\. /.test(line)
      const items = []
      while (index < lines.length && /^\s*([-*+] |\d+\. )/.test(lines[index])) items.push(lines[index++].replace(/^\s*(?:[-*+] |\d+\. )/, ''))
      const List = ordered ? 'ol' : 'ul'
      blocks.push(<List key={blocks.length}>{items.map((item, itemIndex) => <li key={itemIndex}><Inline text={item} /></li>)}</List>)
      continue
    }
    if (/^\s*>/.test(line)) {
      const quote = []
      while (index < lines.length && /^\s*>/.test(lines[index])) quote.push(lines[index++].replace(/^\s*>\s?/, ''))
      blocks.push(<blockquote key={blocks.length}><Inline text={quote.join(' ')} /></blockquote>)
      continue
    }
    if (/^\s*---+\s*$/.test(line)) { index += 1; blocks.push(<hr key={blocks.length} />); continue }
    const paragraph = [line.trim()]
    index += 1
    while (index < lines.length && lines[index].trim() && !/^(#{1,6}\s|\s*```|\s*\||\s*>|\s*([-*+] |\d+\. )|\s*---+\s*$)/.test(lines[index])) paragraph.push(lines[index++].trim())
    blocks.push(<p key={blocks.length}><Inline text={paragraph.join(' ')} /></p>)
  }
  return <div className="reference-body">{blocks}</div>
}
