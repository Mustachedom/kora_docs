const values = { name: '...values', type: 'any[]', description: 'Any number of values to print. Tables become sorted, indented JSON; strings, numbers, booleans, nil, and functions are converted to readable text.', required: false }
const noReturn = [{ value: '—', meaning: 'This function writes to the console and does not return a value.' }]

const makeMethod = (name, level, color, example, useCase) => ({
  name,
  summary: `Print a ${level} message to the console with a colored [${level.toUpperCase()}] prefix.`,
  parameters: [values],
  returns: 'nothing',
  returnValues: noReturn,
  example,
  useCase,
})

export const printsPages = {
  shared: {
    title: 'Print helpers',
    summary: 'Write readable, color-coded messages to the console from shared code.',
    notice: 'These helpers format console output only. They do not save logs or deliver them to Discord. Use the Logging module for persistent event records or Discord delivery.',
    methods: [
      makeMethod('debug', 'debug', 'purple', `Kora.print.debug("Player state:", {\n    source = 12,\n    license = "license:abc123",\n})\n\n-- Expected console output:\n-- [DEBUG] Player state: {\n--   "license": "license:abc123",\n--   "source": 12\n-- }`, 'Print detailed information while tracking down a problem.'),
      makeMethod('info', 'info', 'blue', `Kora.print.info("Player loaded", 12)\n\n-- Expected console output:\n-- [INFO] Player loaded 12`, 'Print a normal message about something that happened.'),
      makeMethod('warn', 'warning', 'yellow', `Kora.print.warn("Inventory was nearly full", 8)\n\n-- Expected console output:\n-- [WARNING] Inventory was nearly full 8`, 'Point out an unexpected situation that did not stop the resource.'),
      makeMethod('error', 'error', 'red', `Kora.print.error("Could not load player data", 12)\n\n-- Expected console output:\n-- [ERROR] Could not load player data 12`, 'Show a problem that prevented an operation from completing.'),
      makeMethod('success', 'success', 'green', `Kora.print.success("Player data loaded", 12)\n\n-- Expected console output:\n-- [SUCCESS] Player data loaded 12`, 'Confirm that an operation completed successfully.'),
    ],
  },
}
