import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { flatPages, resolveRoute, resources, search } from './registry.js'
import { highlightLua } from './highlight.js'
import './styles.css'

const glyphs = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  code: <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14" />,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  left: <path d="M19 12H5m6-6-6 6 6 6" />,
  right: <path d="M5 12h14m-6-6 6 6-6 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
}

function Icon({ name, size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{glyphs[name]}</svg>
}

/* ---------- routing ---------- */

const parseHash = () => {
  const [resource, module, page, method] = window.location.hash.replace(/^#\/?/, '').split('/')
  return { resource, module, page, method }
}

const scrollToTarget = (method) => {
  if (method) document.getElementById(`method-${method}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  else window.scrollTo({ top: 0, behavior: 'auto' })
}

const navigate = (path) => {
  const next = `#${path}`
  if (window.location.hash === next) scrollToTarget(path.split('/')[3])
  else window.location.hash = next
}

function useRoute() {
  const [route, setRoute] = useState(parseHash)
  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

function useCopy() {
  const [copied, setCopied] = useState('')
  const copy = useCallback(async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      window.setTimeout(() => setCopied(''), 1400)
    } catch {
      setCopied('')
    }
  }, [])
  return [copied, copy]
}

/* ---------- sidebar ---------- */

function Sidebar({ current, open, onClose }) {
  const currentKey = `${current.resource.id}/${current.module.id}`
  const [expanded, setExpanded] = useState(() => new Set([currentKey]))

  useEffect(() => {
    setExpanded((prev) => (prev.has(currentKey) ? prev : new Set(prev).add(currentKey)))
  }, [currentKey])

  const toggle = (key) => setExpanded((prev) => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
    <a className="brand" href={`#${flatPages[0].path}`} onClick={onClose}>
      <span className="brand-mark">K</span>
      <span className="brand-word">kora<span>docs</span></span>
    </a>
    <nav className="sidebar-nav" aria-label="Documentation">
      {resources.map((resource) => <div className="nav-resource" key={resource.id}>
        <div className="nav-resource-title"><span className="resource-dot" />{resource.title}</div>
        {resource.modules.map((module) => {
          const key = `${resource.id}/${module.id}`
          const isOpen = expanded.has(key)
          return <div className="nav-module" key={key}>
            <button className="nav-module-button" aria-expanded={isOpen} onClick={() => toggle(key)}>
              <span className={`nav-chevron ${isOpen ? 'nav-chevron-open' : ''}`}><Icon name="chevron" size={14} /></span>
              {module.title}
            </button>
            {isOpen && <div className="nav-pages">
              {module.pages.map((page) => {
                const active = current.resource === resource && current.module === module && current.page === page
                return <a key={page.id} className={`nav-link ${active ? 'nav-link-active' : ''}`} href={`#${key}/${page.id}`} aria-current={active ? 'page' : undefined} onClick={onClose}>{page.title}</a>
              })}
            </div>}
          </div>
        })}
      </div>)}
    </nav>
    <div className="sidebar-footer">More Kora resources are being added.</div>
  </aside>
}

/* ---------- search palette ---------- */

function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef(null)
  const results = useMemo(() => search(query), [query])

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const pick = (item) => {
    navigate(item.path)
    onClose()
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && results[active]) {
      pick(results[active])
    } else if (event.key === 'Escape') {
      onClose()
    }
  }

  return <div className="palette-backdrop" onMouseDown={onClose}>
    <div className="palette" role="dialog" aria-modal="true" aria-label="Search documentation" onMouseDown={(event) => event.stopPropagation()}>
      <div className="palette-input">
        <Icon name="search" size={18} />
        <input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setActive(0) }} onKeyDown={onKeyDown} placeholder="Search pages, functions, parameters" aria-label="Search" />
        <kbd>Esc</kbd>
      </div>
      <div className="palette-list" ref={listRef}>
        {results.length === 0 && <div className="palette-empty">Nothing matches “{query}”. Try a function name or a word from its description.</div>}
        {results.map((item, index) => <button key={item.path} className={`palette-item ${index === active ? 'palette-item-active' : ''}`} onMouseEnter={() => setActive(index)} onClick={() => pick(item)}>
          <span className="palette-icon"><Icon name={item.kind === 'method' ? 'code' : 'file'} size={16} /></span>
          <span className="palette-text">
            <strong className={item.kind === 'method' ? 'mono' : ''}>{item.title}</strong>
            <small>{item.subtitle}</small>
          </span>
          <span className="palette-tag">{item.tag}</span>
        </button>)}
      </div>
      <div className="palette-hints"><span><kbd>↑</kbd><kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span></div>
    </div>
  </div>
}

/* ---------- page pieces ---------- */

function Code({ code, id, copied, copy, label = 'Lua' }) {
  return <div className="code">
    <div className="code-bar">
      <span>{label}</span>
      <button className="ghost-button" onClick={() => copy(code, id)}><Icon name={copied === id ? 'check' : 'copy'} size={14} />{copied === id ? 'Copied' : 'Copy'}</button>
    </div>
    <pre><code>{highlightLua(code).map((token, index) => <span key={index} className={`tok-${token.type}`}>{token.text}</span>)}</code></pre>
  </div>
}

function ParamRow({ param }) {
  return <div className="param">
    <div className="param-key">
      <code className="param-name">{param.name}</code>
      <code className="param-type">{param.type}</code>
      {!param.required && <span className="optional-tag">optional</span>}
    </div>
    <p>{param.description}</p>
  </div>
}

function Method({ method, module, pagePath, copied, copy }) {
  const withExport = (example) => example.includes('-- OR') ? example : `${example}\n\n-- OR\n\n${example.replaceAll(`${module.namespace}.${method.name}`, `exports.${module.exportResource}:${module.exportPrefix}${method.name}`)}`
  const consumedParams = new Set()
  const parameterRows = method.parameters.map((param) => {
    if (consumedParams.has(param.name)) return null
    const childPrefix = param.type.includes('[]') ? `${param.name}[].` : `${param.name}.`
    const children = method.parameters.filter((candidate) => candidate.name.startsWith(childPrefix))
    if (!children.length) {
      consumedParams.add(param.name)
      return <ParamRow key={param.name} param={param} />
    }
    consumedParams.add(param.name)
    children.forEach((child) => consumedParams.add(child.name))
    return <details className="param-group" key={param.name}>
      <summary>
        <div className="param-key">
          <code className="param-name">{param.name}</code>
          <code className="param-type">{param.type}</code>
          {!param.required && <span className="optional-tag">optional</span>}
        </div>
        <p>{param.description}</p>
        <span className="param-expand-hint">Expand to view its options</span>
      </summary>
      <div className="param-children">{children.map((child) => <ParamRow key={child.name} param={child} />)}</div>
    </details>
  })
  return <section className="method" id={`method-${method.name}`} data-method={method.name}>
    <div className="method-head">
      <h3><a href={`#${pagePath}/${method.name}`}>{method.name}</a></h3>
      <span className="returns-badge">returns {method.returns}</span>
      <button className="icon-button" title="Copy signature" aria-label={`Copy ${method.name} signature`} onClick={() => copy(method.signature, method.name)}><Icon name={copied === method.name ? 'check' : 'copy'} size={15} /></button>
    </div>
    <p className="method-summary">{method.summary}</p>

    <h4>Parameters</h4>
    <div className="params">
      {parameterRows}
    </div>

    <h4>Returns</h4>
    <div className="answers">
      {method.returnValues.map((item) => <div className="answer" key={item.value}>
        <code className={`answer-value answer-${item.value}`}>{item.value}</code>
        <p>{item.meaning}</p>
      </div>)}
    </div>
    {module.returnNote && <p className="fine-print">{module.returnNote}</p>}

    {method.fullParameterExample && method.basicExample ? <>
      <h4>Basic Example</h4>
      <Code code={withExport(method.basicExample)} id={`basic-example-${method.name}`} copied={copied} copy={copy} />
      <h4>Full Parameter Example</h4>
      <Code code={withExport(method.fullParameterExample)} id={`full-example-${method.name}`} copied={copied} copy={copy} />
    </> : method.example ? <>
      <h4>Example</h4>
      <Code code={withExport(method.example)} id={`example-${method.name}`} copied={copied} copy={copy} />
    </> : null}

    <div className="use-case"><Icon name="info" size={17} /><p><strong>When to use it.</strong> {method.useCase}</p></div>
  </section>
}

function OnThisPage({ methods, pagePath, activeMethod }) {
  const jump = (event, method) => {
    event.preventDefault()
    window.history.replaceState(null, '', `#${pagePath}${method ? `/${method}` : ''}`)
    scrollToTarget(method)
  }
  return <aside className="right-rail">
    <div className="rail-title">On this page</div>
    <a href={`#${pagePath}`} className={`rail-link ${activeMethod ? '' : 'rail-link-active'}`} onClick={(event) => jump(event, '')}>Overview</a>
    {methods.map((method) => <a key={method.name} href={`#${pagePath}/${method.name}`} className={`rail-link mono ${activeMethod === method.name ? 'rail-link-active' : ''}`} onClick={(event) => jump(event, method.name)}>{method.name}</a>)}
  </aside>
}

function PageNav({ index }) {
  const previous = flatPages[index - 1]
  const next = flatPages[index + 1]
  if (!previous && !next) return null
  const label = (entry) => `${entry.module.title} ${entry.page.title}`
  return <nav className="page-nav" aria-label="Previous and next page">
    {previous ? <a href={`#${previous.path}`} className="page-nav-link"><span><Icon name="left" size={14} /> Previous</span><strong>{label(previous)}</strong></a> : <span />}
    {next ? <a href={`#${next.path}`} className="page-nav-link page-nav-next"><span>Next <Icon name="right" size={14} /></span><strong>{label(next)}</strong></a> : <span />}
  </nav>
}

/* ---------- app ---------- */

function App() {
  const route = useRoute()
  const resolved = resolveRoute(route)
  const current = resolved ?? flatPages[0]
  const { resource, module, page, path } = current
  const content = page.content
  const pageIndex = flatPages.indexOf(current)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [activeMethod, setActiveMethod] = useState('')
  const [copied, copy] = useCopy()

  useEffect(() => {
    if (!resolved) window.history.replaceState(null, '', `#${flatPages[0].path}`)
  }, [resolved])

  useEffect(() => {
    document.title = `${module.title} ${page.title} · kora docs`
  }, [module, page])

  useEffect(() => {
    scrollToTarget(resolved ? route.method : '')
  }, [route, resolved])

  useEffect(() => {
    setActiveMethod('')
    const sections = [...document.querySelectorAll('[data-method]')]
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) setActiveMethod(visible[0].target.dataset.method)
    }, { rootMargin: '-90px 0px -65% 0px' })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [path])

  useEffect(() => {
    const onKey = (event) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      } else if (event.key === '/' && !typing) {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return <div className="app-shell">
    <Sidebar current={current} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    {mobileOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

    <div className="main-area">
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen((open) => !open)}><Icon name="menu" size={18} /></button>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span>{resource.title}</span><Icon name="chevron" size={13} /><span>{module.title}</span><Icon name="chevron" size={13} /><span className="crumb-current">{page.title}</span>
        </nav>
        <button className="search-button" onClick={() => setPaletteOpen(true)}>
          <Icon name="search" size={16} /><span>Search docs</span><kbd>Ctrl K</kbd>
        </button>
      </header>

      <div className="docs-layout">
        <article className="article">
          <header className="page-header">
            <h1>{content.title}</h1>
          </header>

          {content.methods.map((method) => <Method key={method.name} method={method} module={module} pagePath={path} copied={copied} copy={copy} />)}

          <PageNav index={pageIndex} />
        </article>
        <OnThisPage methods={content.methods} pagePath={path} activeMethod={activeMethod} />
      </div>
    </div>

    {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
  </div>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
