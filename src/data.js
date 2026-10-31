const c = (name, type, description, required = true) => ({ name, type, description, required })
const answers = (yes, no) => [
  { value: 'true', meaning: yes },
  { value: 'false', meaning: no },
]

const coords = c('coords', 'vector3() or vector4()', 'The position to check, written as vector3(x, y, z) or vector4(x, y, z, heading). The heading in vector4 is ignored.')
const radius = c('distance', 'number', 'How close is close enough, in game units. Defaults to 5.0. Use zero or a positive number.', false)
 
export const distancePages = {
  client: {
    realm: 'Client',
    eyebrow: 'KORA LIB / DISTANCE',
    title: 'Distance checks on the client',
    summary: 'Check whether your character is close to a place or object, or whether two places are close to each other. Each check gives a simple yes or no answer.',
    source: 'modules/distancecheck/client.lua',
    requirements: ['Client realm', 'Kora.cache coordinates'],
    methods: [
      {
        name: 'player', signature: 'Kora.distance.player(coords, distance?)',
        summary: 'Check whether your character is close to a position.',
        parameters: [coords, radius], returns: 'boolean', returnValues: answers('Your character is at or within the chosen distance of the position.', 'Your character is farther away than the chosen distance.'),
        example: `local shop = vector3(25.7, -1347.3, 29.5)\n\nif Kora.distance.player(shop, 2.5) then\n    openShop()\nend`,
        useCase: 'Gate an interaction such as opening a shop, starting a repair, or showing a prompt when the player reaches a location.',
      },
      {
        name: 'coords', signature: 'Kora.distance.coords(coords1, coords2, distance?)',
        summary: 'Check how close two positions are. This does not depend on where a player is.',
        parameters: [c('coords1', 'vector3() or vector4()', 'The first position: vector3(x, y, z) or vector4(x, y, z, heading). Heading is ignored.'), c('coords2', 'vector3() or vector4()', 'The second position: vector3(x, y, z) or vector4(x, y, z, heading). Heading is ignored.'), radius], returns: 'boolean', returnValues: answers('The two positions are at or within the chosen distance.', 'The two positions are farther apart than the chosen distance.'),
        example: `local isNear = Kora.distance.coords(\n    vector3(10.0, 20.0, 30.0),\n    vector3(12.0, 20.0, 30.0),\n    3.0\n)`,
        useCase: 'Compare a moving object to a destination or check whether two configured positions are close, without reading player state.',
      },
      {
        name: 'entity', signature: 'Kora.distance.entity(entity, distance?)',
        summary: 'Check whether the local player is within a radius of an entity handle.',
        parameters: [c('entity', 'integer', 'The game handle for an object, such as a vehicle. It must still exist when checked.'), radius], returns: 'boolean', returnValues: answers('Your character is at or within the chosen distance of the object.', 'Your character is farther away than the chosen distance.'),
        example: `local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)\n\nif vehicle ~= 0 and Kora.distance.entity(vehicle, 4.0) then\n    showVehiclePrompt()\nend`,
        useCase: 'Show a nearby vehicle or prop interaction while keeping the calling resource responsible for entity discovery and validity.',
      },
      {
        name: 'x', signature: 'Kora.distance.x(point, distance?)',
        summary: 'Compare only the X-axis distance from the local player.',
        parameters: [c('point', 'vector3() or vector4()', 'A vector3(x, y, z) or vector4(x, y, z, heading). Only its X value is used.'), radius], returns: 'boolean', returnValues: answers('The X positions are at or within the chosen distance.', 'The X positions are farther apart than the chosen distance.'),
        example: `local gate = vector3(441.2, -981.9, 30.7)\n\nif Kora.distance.x(gate, 1.0) then\n    alignWithGate()\nend`,
        useCase: 'Use when only one axis matters, such as aligning with a wall, counter, or lane marker.',
      },
      {
        name: 'y', signature: 'Kora.distance.y(point, distance?)',
        summary: 'Compare only the Y-axis distance from the local player.',
        parameters: [c('point', 'vector3() or vector4()', 'A vector3(x, y, z) or vector4(x, y, z, heading). Only its Y value is used.'), radius], returns: 'boolean', returnValues: answers('The Y positions are at or within the chosen distance.', 'The Y positions are farther apart than the chosen distance.'),
        example: `local counter = vector3(441.2, -981.9, 30.7)\n\nif Kora.distance.y(counter, 1.5) then\n    showCounterPrompt()\nend`,
        useCase: 'Use for a single-axis threshold when the other coordinates should not affect the check.',
      },
      {
        name: 'xy', signature: 'Kora.distance.xy(point, distance?)',
        summary: 'Compare horizontal X/Y distance and ignore height (Z).',
        parameters: [c('point', 'vector3() or vector4()', 'The position to check, written as vector3(x, y, z) or vector4(x, y, z, heading). Height (Z) and heading are ignored.'), radius], returns: 'boolean', returnValues: answers('The horizontal distance is within the chosen distance.', 'The horizontal distance is farther than the chosen distance.'),
        example: `local marker = vector3(25.7, -1347.3, 29.5)\n\nif Kora.distance.xy(marker, 3.0) then\n    showFloorMarker()\nend`,
        useCase: 'Check a ground location in multi-storey buildings where vertical separation should not hide a marker or prompt.',
      },
    ],
  },
  server: {
    realm: 'Server',
    eyebrow: 'KORA LIB / DISTANCE',
    title: 'Distance checks on the server',
    summary: 'Check how close a player is from the server. Use this when the server needs to confirm a player is near enough before allowing an action.',
    source: 'modules/distancecheck/server.lua',
    requirements: ['Server realm', 'OneSync for player positions'],
    notice: 'A server distance check is one condition in an authorization decision. Also validate ownership, permissions, the requested action, and current server state. Never treat a client-supplied target or radius as proof of access.',
    methods: [
      {
        name: 'player', signature: 'Kora.distance.player(src, coords, distance?)',
        summary: 'Check whether a player is close to a position.',
        parameters: [c('src', 'integer', 'The player’s server ID, often named source in a server event.'), coords, radius], returns: 'boolean', returnValues: answers('The player is at or within the chosen distance of the position.', 'The player is farther away than the chosen distance.'),
        example: `local station = vector3(441.2, -981.9, 30.7)\n\nif Kora.distance.player(src, station, 3.0) then\n    openStationFor(src)\nend`,
        useCase: 'Validate that a player is near a server-owned location before processing an action. Keep the location and radius under server control.',
      },
      {
        name: 'coords', signature: 'Kora.distance.coords(coords1, coords2, distance?)',
        summary: 'Check how close two positions are. This does not check a player.',
        parameters: [c('coords1', 'vector3() or vector4()', 'The first position: vector3(x, y, z) or vector4(x, y, z, heading). Heading is ignored.'), c('coords2', 'vector3() or vector4()', 'The second position: vector3(x, y, z) or vector4(x, y, z, heading). Heading is ignored.'), radius], returns: 'boolean', returnValues: answers('The two positions are at or within the chosen distance.', 'The two positions are farther apart than the chosen distance.'),
        example: `local jobPosition = vector3(441.2, -981.9, 30.7)\nlocal targetPosition = vector3(444.0, -981.9, 30.7)\n\nlocal close = Kora.distance.coords(jobPosition, targetPosition, 5.0)`,
        useCase: 'Compare server-held positions or points when no player-relative check is needed.',
      },
      {
        name: 'entity', signature: 'Kora.distance.entity(src, entity, distance?)',
        summary: 'Check whether the source player is within a radius of an existing entity.',
        parameters: [c('src', 'integer', 'The player’s server ID, often named source in a server event.'), c('entity', 'integer', 'The game handle for an object that exists on the server, such as a vehicle.'), radius], returns: 'boolean', returnValues: answers('The player is at or within the chosen distance of the object.', 'The player is farther away than the chosen distance.'),
        example: `if Kora.distance.entity(src, vehicleEntity, 4.0) then\n    handleVehicleAction(src)\nend`,
        useCase: 'Check proximity to a server-known entity after validating that the entity belongs to the expected workflow.',
      },
      {
        name: 'x', signature: 'Kora.distance.x(src, point, distance?)',
        summary: 'Compare only the player’s X-axis distance to a point.',
        parameters: [c('src', 'integer', 'The player’s server ID, often named source in a server event.'), c('point', 'vector3() or vector4()', 'A vector3(x, y, z) or vector4(x, y, z, heading). Only its X value is used.'), radius], returns: 'boolean', returnValues: answers('The player and position are within the chosen distance along X.', 'They are farther apart than the chosen distance along X.'),
        example: `local counter = vector3(441.2, -981.9, 30.7)\n\nif Kora.distance.x(src, counter, 1.5) then\n    processCounterAction(src)\nend`,
        useCase: 'Use when a server rule depends only on the player crossing or reaching a specific X threshold.',
      },
      {
        name: 'y', signature: 'Kora.distance.y(src, point, distance?)',
        summary: 'Compare only the player’s Y-axis distance to a point.',
        parameters: [c('src', 'integer', 'The player’s server ID, often named source in a server event.'), c('point', 'vector3() or vector4()', 'A vector3(x, y, z) or vector4(x, y, z, heading). Only its Y value is used.'), radius], returns: 'boolean', returnValues: answers('The player and position are within the chosen distance along Y.', 'They are farther apart than the chosen distance along Y.'),
        example: `local register = vector3(441.2, -981.9, 30.7)\n\nif Kora.distance.y(src, register, 2.0) then\n    processRegisterAction(src)\nend`,
        useCase: 'Use when only the player’s Y-axis position matters to a server-validated action.',
      },
      {
        name: 'xy', signature: 'Kora.distance.xy(src, point, distance?)',
        summary: 'Compare horizontal X/Y distance from the source player and ignore height.',
        parameters: [c('src', 'integer', 'The player’s server ID, often named source in a server event.'), c('point', 'vector3() or vector4()', 'The position to check, written as vector3(x, y, z) or vector4(x, y, z, heading). Height (Z) and heading are ignored.'), radius], returns: 'boolean', returnValues: answers('The player is within the chosen horizontal distance.', 'The player is farther away horizontally than the chosen distance.'),
        example: `local entrance = vector3(441.2, -981.9, 30.7)\n\nif Kora.distance.xy(src, entrance, 3.0) then\n    allowGroundEntranceAction(src)\nend`,
        useCase: 'Use for ground-plane proximity when a player being on another floor should still count as horizontally nearby.',
      },
    ],
  },
}

export const searchDocuments = Object.entries(distancePages).flatMap(([realm, page]) => page.methods.map((method) => ({
  realm,
  label: `Kora.distance.${method.name}`,
  signature: method.signature,
  summary: method.summary,
  terms: `${method.name} ${method.signature} ${method.summary} ${method.useCase} ${method.parameters.map((item) => `${item.name} ${item.type} ${item.description}`).join(' ')}`.toLowerCase(),
})))
