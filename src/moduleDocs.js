import realms from './reference/realms.json'

const markdownFiles = import.meta.glob('./reference/*.md', { eager: true, query: '?raw', import: 'default' })
const handWritten = new Set(['cache', 'locales', 'notify', 'prints', 'progressbar', 'distancecheck'])

const cleanHeading = (heading) => heading
  .replace(/^#+\s*/, '')
  .replace(/`/g, '')
  .replace(/\*\*/g, '')
  .trim()

const slug = (value) => cleanHeading(value)
  .toLowerCase()
  .replace(/[^\w.-]+/g, '-')
  .replace(/^-|-$/g, '')

const classifyRealm = (heading) => {
  const text = cleanHeading(heading).toLowerCase()
  const hasClient = /\bclient(?:-side| only| changes| api)?\b/.test(text)
  const hasServer = /\bserver(?:-side| only| authority| api)?\b/.test(text)
  const hasShared = /\bshared\b/.test(text)
  if (hasClient && hasServer) return ['client', 'server']
  if (hasClient) return ['client']
  if (hasServer) return ['server']
  if (hasShared) return ['shared']
  return null
}

const markdownForRealm = (markdown, realm) => {
  const lines = markdown.split('\n')
  const chunks = []
  let activeRealm = null
  let current = []
  let currentRealm = null
  let sawRealmSection = false
  const flush = () => {
    if (current.length) chunks.push({ realm: currentRealm, text: current.join('\n') })
  }

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flush()
      current = [line]
      const declared = classifyRealm(heading[2])
      if (heading[1].length <= 2 && declared) {
        activeRealm = declared
        sawRealmSection = true
      }
      currentRealm = declared || activeRealm
      if (declared) sawRealmSection = true
      continue
    }
    current.push(line)
  }
  flush()

  if (!sawRealmSection) return markdown
  const selected = chunks.filter((chunk) => chunk.realm === null || chunk.realm.includes(realm)).map((chunk) => chunk.text)
  return selected.join('\n\n') || `# ${realm[0].toUpperCase() + realm.slice(1)} reference\n\nNo ${realm}-specific API sections are documented here yet.`
}

const methodsFrom = (markdown) => markdown.split('\n')
  .filter((line) => /^#{2,4}\s/.test(line))
  .map((line) => {
    const heading = cleanHeading(line)
    const signature = heading.match(/(?:QB|Kora)\.[\w.]+\([^)]*\)/)?.[0] ?? ''
    const name = slug(heading)
    return { name, searchTitle: heading, signature, summary: heading }
  })
  .filter((method, index, all) => method.name && all.findIndex((candidate) => candidate.name === method.name) === index)

const titleFrom = (markdown, fallback) => {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.replace(/\s+module$/i, '')
  return title || fallback.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const summaryFrom = (markdown) => {
  const lines = markdown.split('\n')
  const first = lines.findIndex((line) => /^#\s/.test(line))
  for (let index = first + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line && !line.startsWith('#') && !line.startsWith('```')) return line.replace(/[`*_]/g, '')
  }
  return 'Reference for this kora_lib module.'
}

export const referenceModules = Object.entries(markdownFiles)
  .map(([path, markdown]) => {
    const id = path.split('/').at(-1).replace(/\.md$/, '')
    if (handWritten.has(id)) return null
    const sourceRealms = realms[id] || []
    const pages = (sourceRealms.length ? sourceRealms : ['shared']).map((realm) => ({
      id: realm,
      title: realm[0].toUpperCase() + realm.slice(1),
      facts: [],
      content: (() => {
        const pageMarkdown = markdownForRealm(markdown, realm)
        return {
          title: `${titleFrom(markdown, id)} reference`,
          summary: summaryFrom(markdown),
          markdown: pageMarkdown,
          methods: methodsFrom(pageMarkdown),
        }
      })(),
    }))
    return {
      id,
      title: titleFrom(markdown, id),
      namespace: `Kora.${id}`,
      exportResource: 'kora_lib',
      exportPrefix: `${id}_`,
      pages,
    }
  })
  .filter(Boolean)
  .sort((a, b) => a.title.localeCompare(b.title))
