const param = (name, type, description, required = true) => ({ name, type, description, required })
const answers = (...items) => items.map(([value, meaning]) => ({ value, meaning }))

const payloadFields = () => [
  param('title', 'string', 'Optional heading shown above the message. Add either a title or a message.', false),
  param('message', 'string', 'Optional notification text. Supports safe Markdown. Add either a title or a message.', false),
  param('duration', 'number', 'How long the notification stays visible, in milliseconds. Defaults to 5000; maximum 120000.', false),
  param('type', '"info" | "success" | "warning" | "error"', 'Visual style and icon. Defaults to info. The aliases inform and warn are also accepted.', false),
  param('position', 'string', 'Screen location: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right, center-left, center-right, top, or bottom. Defaults to top-right.', false),
  param('icon', 'string', 'Optional icon name or safe image URL to replace the default icon.', false),
  param('iconColor', 'string', 'Optional CSS color for the icon.', false),
  param('iconAnimation', 'string', 'Optional animation: spin, spinPulse, spinReverse, pulse, beat, fade, beatFade, bounce, or shake.', false),
  param('alignIcon', '"top" | "center"', 'Vertical icon alignment. Defaults to center.', false),
  param('id', 'string or number', 'Optional ID. A new notification with the same ID replaces the existing one.', false),
  param('showDuration', 'boolean', 'Set false to hide the notification lifetime indicator.', false),
  param('style', 'table', 'Optional appearance overrides using CSS style values. Nested title, description, message, and text selectors can each have their own style values.', false),
  param('style.<CSS property>', 'scalar', 'A supported CSS value for the notification, for example backgroundColor or borderColor. Nested objects are ignored here.', false),
  param('style.title / description / message / text', 'table', 'Optional styles for that part of the notification. Use simple CSS property and value pairs inside each selector.', false),
]

const sharedSummary = 'A notification needs at least a title or a message. The duration and visual style use server-configured defaults when omitted.'

export const notifyPages = {
  client: {
    title: 'Notifications on the client',
    summary: 'Show a short message to the local player. Notifications appear in the configured screen position and disappear after their duration.',
    methods: [
      {
        name: 'send',
        signature: 'Kora.notify.send(payload)',
        summary: 'Show a notification to the local player.',
        parameters: payloadFields(),
        returns: 'nothing',
        returnValues: [],
        example: `Kora.notify.send({\n    title = "Saved",\n    message = "Your changes were saved.",\n    type = "success",\n    duration = 4000,\n})`,
        useCase: 'Confirm an action to the player, such as saving settings, completing a purchase, or explaining why an action failed.',
      },
    ],
  },
  server: {
    title: 'Notifications on the server',
    summary: 'Send a notification to one player or broadcast it to everyone online.',
    notice: 'Use a positive server ID for one player, or -1 to notify everyone. Invalid recipients or notification content are logged and dropped.',
    methods: [
      {
        name: 'send',
        signature: 'Kora.notify.send(src, payload)',
        summary: 'Send a notification from the server to one player, or to everyone with server ID -1.',
        parameters: [param('src', 'number', 'The target player server ID. Use -1 to send to every connected player.'), ...payloadFields()],
        returns: 'nothing',
        returnValues: [],
        example: `Kora.notify.send(src, {\n    title = "Payment received",\n    message = "Your order is ready for pickup.",\n    type = "success",\n})`,
        useCase: 'Notify a player after a server-checked action, such as a payment, job result, or permission check.',
      },
      {
        name: 'sendToAll',
        signature: 'Kora.notify.sendToAll(payload)',
        summary: 'Send the same notification to every connected player.',
        parameters: payloadFields(),
        returns: 'nothing',
        returnValues: [],
        example: `Kora.notify.sendToAll({\n    title = "Server announcement",\n    message = "The city will restart in 10 minutes.",\n    type = "warning",\n    duration = 10000,\n})`,
        useCase: 'Broadcast a server-wide announcement without looping over each player yourself.',
      },
    ],
  },
  shared: {
    title: 'Shared notification helpers',
    summary: 'Prepare and check notification settings before sending them. These helpers are available on both the client and server.',
    methods: [
      {
        name: 'assert',
        signature: 'Kora.notify.assert(payload)',
        summary: 'Check notification settings. Raises an error when the payload is invalid; returns normally when it is valid.',
        parameters: payloadFields(),
        returns: 'valid or error',
        returnValues: answers(['valid', 'The settings passed validation.'], ['error', 'Invalid settings raise an error. This function does not return false.']),
        example: `Kora.notify.assert({\n    title = "Saved",\n    message = "Your changes were saved.",\n})`,
        useCase: 'Check notification settings early when you want invalid data to be reported before a send is attempted.',
      },
      {
        name: 'withDefaults',
        signature: 'Kora.notify.withDefaults(payload)',
        summary: 'Return a copy of notification settings with the configured duration, type, and position filled in.',
        parameters: payloadFields(),
        returns: 'table',
        returnValues: answers(['settings', 'A new settings table with configured defaults. The original table is left unchanged.']),
        example: `local settings = Kora.notify.withDefaults({\n    title = "Saved",\n})\n\nprint(settings.duration)\nprint(settings.type)\nprint(settings.position)`,
        useCase: 'Build a fully filled notification payload without changing the original table.',
      },
      {
        name: 'normalizeType',
        signature: 'Kora.notify.normalizeType(notifyType)',
        summary: 'Convert a supported type alias to its standard name. inform becomes info and warn becomes warning.',
        parameters: [param('notifyType', 'string', 'Notification style name or alias, such as inform, warn, info, success, warning, or error.')],
        returns: 'value',
        returnValues: answers(['info / warning', 'Known aliases are converted: inform becomes info; warn becomes warning.'], ['unchanged', 'Other values are returned as they were so validation can report an unsupported type.']),
        example: `local standardType = Kora.notify.normalizeType("inform")\nprint(standardType) -- info`,
        useCase: 'Convert a type name from another notification system before checking or saving it.',
      },
      {
        name: 'normalize',
        signature: 'Kora.notify.normalize(payload)',
        summary: 'Return notification settings with a recognized type alias converted to its standard name.',
        parameters: payloadFields(),
        returns: 'table',
        returnValues: answers(['settings', 'The normalized settings. If the type needed no change, the original table is returned; otherwise a copy is returned.']),
        example: `local settings = Kora.notify.normalize({\n    title = "Hello",\n    type = "inform",\n})\n\nprint(settings.type) -- info`,
        useCase: 'Accept notification type aliases from another system before sending or validating settings.',
      },
    ],
  },
}
