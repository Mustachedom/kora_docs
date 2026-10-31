import { distancePages } from './data.js'
import { progressbarPages } from './progressbar.js'
import { notifyPages } from './notify.js'

/*
  The whole site is described here. To add documentation:
    1. Write a page object in its own data file (same shape as distancePages.client).
    2. Add a page to a module below, or add a new module / resource.
  The sidebar, tabs, search, previous/next links and routes are all generated from this tree.
*/

const distanceFacts = [
  { label: 'Returns', value: 'true or false' },
  { label: 'Default radius', value: '5.0 units' },
]

export const resources = [
  {
    id: 'kora_lib',
    title: 'kora_lib',
    modules: [
      {
        id: 'distance',
        title: 'Distance',
        namespace: 'Kora.distance',
        exportResource: 'kora_lib',
        exportPrefix: 'distance_',
        returnNote: 'A position exactly at the distance limit counts as within range.',
        pages: [
          {
            id: 'client',
            title: 'Client',
            facts: [...distanceFacts, { label: 'Distance model', value: '3D radius' }],
            content: distancePages.client,
          },
          {
            id: 'server',
            title: 'Server',
            facts: [...distanceFacts, { label: 'Distance model', value: '3D radius from the server ped' }],
            content: distancePages.server,
          },
        ],
      },
      {
        id: 'progressbar',
        title: 'Progressbar',
        namespace: 'Kora.progressbar',
        exportResource: 'kora_lib',
        exportPrefix: 'progressbar_',
        pages: [
          {
            id: 'client',
            title: 'Client',
            facts: [],
            content: progressbarPages.client,
          },
        ],
      },
      {
        id: 'notify',
        title: 'Notify',
        namespace: 'Kora.notify',
        exportResource: 'kora_lib',
        exportPrefix: 'notify_',
        pages: [
          { id: 'client', title: 'Client', facts: [], content: notifyPages.client },
          { id: 'shared', title: 'Shared', facts: [], content: notifyPages.shared },
          { id: 'server', title: 'Server', facts: [], content: notifyPages.server },
        ],
      },
    ],
  },
]

export const flatPages = resources.flatMap((resource) =>
  resource.modules.flatMap((module) =>
    module.pages.map((page) => ({ resource, module, page, path: `${resource.id}/${module.id}/${page.id}` })),
  ),
)

export const resolveRoute = ({ resource, module, page }) =>
  flatPages.find((entry) => entry.resource.id === resource && entry.module.id === module && entry.page.id === page) ?? null

const searchIndex = flatPages.flatMap(({ resource, module, page, path }) => [
  {
    kind: 'page',
    title: `${module.title} ${page.title}`,
    subtitle: page.content.summary,
    tag: resource.title,
    path,
    hay: `${resource.title} ${module.title} ${page.title} ${page.content.title} ${page.content.summary}`.toLowerCase(),
  },
  ...page.content.methods.map((method) => ({
    kind: 'method',
    title: `${module.namespace}.${method.name}`,
    subtitle: method.summary,
    tag: page.title,
    path: `${path}/${method.name}`,
    hay: [
      module.title, page.title, method.name, method.signature, method.summary, method.useCase,
      ...method.parameters.map((param) => `${param.name} ${param.type} ${param.description}`),
    ].join(' ').toLowerCase(),
  })),
])

const scoreItem = (item, words) => {
  const title = item.title.toLowerCase()
  let score = 0
  for (const word of words) {
    if (!item.hay.includes(word)) return 0
    score += title.includes(word) ? 3 : 1
    if (title.endsWith(`.${word}`) || title.startsWith(word)) score += 2
  }
  return score
}

export const search = (query, limit = 8) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return searchIndex.filter((item) => item.kind === 'page').slice(0, limit)
  return searchIndex
    .map((item) => ({ item, score: scoreItem(item, words) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item)
}
