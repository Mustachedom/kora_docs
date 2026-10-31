export const localesPages = {
  shared: {
    title: 'Language strings',
    summary: 'Get a translated phrase from the locale files in the resource that calls Lang().',
    notice: 'Add locale files to your resource’s locales/ folder. The active language is used first, then English. If the key is missing from both, Lang() returns the key so missing text is easy to spot.',
    methods: [
      {
        name: 'lang',
        signature: 'Kora.lang(key, ...values)',
        summary: 'Look up a phrase by its key and optionally fill in values.',
        parameters: [
          { name: 'key', type: 'string', description: 'The phrase key to look up. Dot-separated keys can access nested values, such as notifications.saved.' },
          { name: '...values', type: 'any[] or table', description: 'Optional placeholders. Pass a table for named placeholders like %{name}, or values in order for Lua string.format placeholders like %s.', required: false },
        ],
        returns: 'translated value or key',
        returnValues: [
          { value: 'translated value', meaning: 'The phrase found in the active language or English fallback. Placeholders are filled when values are provided.' },
          { value: 'key', meaning: 'Returned when the phrase is missing from both the active language and English.' },
        ],
        example: `-- locales/en.json in your resource:\n-- {\n--     "greeting": "Hello, %{name}!",\n--     "items": { "count": "You have %s items." }\n-- }\n\nlocal greeting = Kora.lang("greeting", { name = GetPlayerName(source) })\nlocal itemCount = Kora.lang("items.count", 3)\n\nprint(greeting)\nprint(itemCount)\n\n-- OR\n\nlocal greeting = exports.kora_lib:lang("greeting", { name = GetPlayerName(source) })\nlocal itemCount = exports.kora_lib:lang("items.count", 3)\n\nprint(greeting)\nprint(itemCount)`,
        useCase: 'Keep player-facing text in locale files so the same feature can display different languages without changing its Lua code.',
      },
    ],
  },
}
