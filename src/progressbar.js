const param = (name, type, description, required = true) => ({ name, type, description, required })
const answers = (...values) => values.map(([value, meaning]) => ({ value, meaning }))

export const progressbarPages = {
  client: {
    title: 'Progressbar',
    summary: 'Show a timed progress bar while the player completes an action. It can play an animation, show attached props, disable controls, and report whether the action finished.',
    methods: [
      {
        name: 'start',
        signature: 'Kora.progressbar.start(payload)',
        summary: 'Start a progress bar and wait until it finishes or is interrupted. Only one progress bar can run at a time.',
        parameters: [
          param('label', 'string', 'Text shown with the progress bar.'),
          param('duration', 'integer', 'Time to fill the bar, in milliseconds. Must be a positive whole number and no longer than the configured limit (10 minutes by default).'),
          param('maxDuration', 'integer or false', 'Compatibility option to change the duration limit for this call. Normally leave this unset. false removes the limit.', false),
          param('canCancel', 'boolean', 'Whether the player can cancel with the configured cancel keys. Defaults to false.', false),
          param('cancelControls', 'integer[] or false', 'Compatibility option for which controls cancel the bar. false lets a compatibility resource handle cancellation. Normally leave this unset.', false),
          param('presentation', '"bar" or "circle"', 'Choose a bar or circular display. Defaults to bar.', false),
          param('position', '"middle" or "bottom"', 'Where to place a circular display. Defaults to middle.', false),
          param('useWhileDead', 'boolean', 'Let the bar continue if the player dies. Defaults to false.', false),
          param('allowRagdoll', 'boolean', 'Let the bar continue while the player is ragdolling. Defaults to false.', false),
          param('allowCuffed', 'boolean', 'Let the bar continue while the player is cuffed. Defaults to false.', false),
          param('allowFalling', 'boolean', 'Let the bar continue while the player is falling. Defaults to false.', false),
          param('allowSwimming', 'boolean', 'Let the bar continue while the player is swimming. Defaults to false.', false),
          param('disable', 'table', 'Optional group of controls to disable while the bar runs. Each setting below defaults to false.', false),
          param('disable.move', 'boolean', 'Freeze the player in place until the bar ends. Cleaned up automatically.', false),
          param('disable.moveMode', '"freeze" or "controls"', 'Compatibility option for how movement is stopped. Defaults to freeze.', false),
          param('disable.sprint', 'boolean', 'Disable sprinting while the bar runs.', false),
          param('disable.combat', 'boolean', 'Disable attacking, aiming, weapon switching, and melee controls.', false),
          param('disable.car', 'boolean', 'Disable vehicle driving controls while the player is in a vehicle.', false),
          param('disable.mouse', 'boolean', 'Disable mouse look while the bar runs.', false),
          param('disable.controlProfile', '"kora_lib" | "qblib" | "ox"', 'Compatibility option to select the control set used for combat and vehicle restrictions. Defaults to kora_lib; qblib is a legacy alias.', false),
          param('anim', 'table', 'Optional animation settings. Cannot be combined with scenario. The animation is stopped and released when the bar ends.', false),
          param('anim.dict', 'string', 'Animation dictionary name. Required when anim is used.', false),
          param('anim.clip', 'string', 'Animation clip name. Required when anim is used.', false),
          param('anim.flag', 'number', 'Animation flags. Defaults to 1 (loop).', false),
          param('anim.blendIn', 'number', 'Animation blend-in speed. Defaults to 8.0.', false),
          param('anim.blendOut', 'number', 'Animation blend-out speed. Defaults to 8.0.', false),
          param('anim.stopBlendOut', 'number', 'Compatibility option for the blend-out speed used when the animation is stopped. Normally leave this unset.', false),
          param('anim.duration', 'number', 'Animation duration in milliseconds. Defaults to -1, so the bar controls when it stops.', false),
          param('anim.playbackRate', 'number', 'Animation playback speed. Defaults to 0.', false),
          param('anim.lockX', 'boolean', 'Lock X movement while the animation plays.', false),
          param('anim.lockY', 'boolean', 'Lock Y movement while the animation plays.', false),
          param('anim.lockZ', 'boolean', 'Lock Z movement while the animation plays.', false),
          param('strictAnim', 'boolean', 'Compatibility option: raise an error if the animation cannot load. Normally the bar continues without the animation.', false),
          param('scenario', 'table', 'Optional scenario settings. Cannot be combined with anim.', false),
          param('scenario.name', 'string', 'Scenario name, for example WORLD_HUMAN_HAMMERING. Required when scenario is used.', false),
          param('scenario.playEnter', 'boolean', 'Whether to play the scenario entry animation. Defaults to true.', false),
          param('emote', 'string', 'Optional emote name. Used only when anim and scenario are not provided.', false),
          param('props', 'table[]', 'Optional list of local cosmetic props attached during the bar. Each prop needs a model; all are deleted when the bar ends. The configured default limit is 2 props.', false),
          param('props[].model', 'string or integer', 'Model name or model hash. Required for each prop.', false),
          param('props[].bone', 'string or integer', 'Ped bone name or ID. Defaults to 60309.', false),
          param('props[].offset', 'vector3()', 'Position offset from the attachment bone. Defaults to vector3(0, 0, 0).', false),
          param('props[].rotation', 'vector3()', 'Rotation offset from the attachment bone. Defaults to vector3(0, 0, 0).', false),
          param('props[].softPinning', 'boolean', 'Use soft pinning for the attached prop. Defaults to true.', false),
          param('props[].collision', 'boolean', 'Enable collision for the prop. Defaults to false.', false),
          param('props[].rotationOrder', 'integer', 'Rotation order from 0 to 5. Defaults to 0.', false),
          param('props[].syncRotation', 'boolean', 'Sync the prop rotation with its bone. Defaults to true.', false),
          param('prop', 'table', 'Legacy single-prop option. Requires model, coords, integer bone ID, and rotation. Prefer props for new code.', false),
          param('proptwo', 'table', 'Legacy second-prop option. Requires model, coords, integer bone ID, and rotation. Prefer props for new code.', false),
          param('prop.model', 'string or integer', 'Model name or model hash for the legacy prop.', false),
          param('prop.coords', 'vector3()', 'Attachment offset for the legacy prop.', false),
          param('prop.bone', 'integer', 'Ped bone ID for the legacy prop.', false),
          param('prop.rotation', 'vector3()', 'Attachment rotation for the legacy prop.', false),
          param('proptwo.model', 'string or integer', 'Model name or model hash for the second legacy prop.', false),
          param('proptwo.coords', 'vector3()', 'Attachment offset for the second legacy prop.', false),
          param('proptwo.bone', 'integer', 'Ped bone ID for the second legacy prop.', false),
          param('proptwo.rotation', 'vector3()', 'Attachment rotation for the second legacy prop.', false),
          param('maxProps', 'integer or false', 'Compatibility option to change the maximum size of the props array; false removes its limit. Normally leave this unset.', false),
        ],
        returns: 'boolean, string?',
        returnValues: answers(
          ['true', 'The full timer finished. The action can continue.'],
          ['false', 'The bar was cancelled, interrupted, or could not start because another bar is already running.'],
        ),
        returnNote: 'The second result is an error message only when the bar could not start because another one is active. A normal cancellation returns false without an error message.',
        fullParameterExample: `local completed = Kora.progressbar.start({
    label = "Picking the lock...",
    duration = 8000,
    maxDuration = 600000, -- Optional duration limit override.
    canCancel = true,
    cancelControls = { 73, 322 }, -- X and Escape.
    presentation = "circle",
    position = "bottom",
    useWhileDead = false,
    allowRagdoll = false,
    allowCuffed = false,
    allowFalling = false,
    allowSwimming = false,
    disable = {
        move = true,
        moveMode = "freeze",
        sprint = true,
        combat = true,
        car = true,
        mouse = true,
        controlProfile = "kora_lib",
    },
    anim = {
        dict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
        clip = "machinic_loop_mechandplayer",
        flag = 1,
        blendIn = 8.0,
        blendOut = 8.0,
        stopBlendOut = 1.0,
        duration = -1,
        playbackRate = 0,
        lockX = false,
        lockY = false,
        lockZ = false,
    },
    strictAnim = false,
    -- Choose scenario OR anim, not both:
    -- scenario = { name = "WORLD_HUMAN_HAMMERING", playEnter = true },
    -- emote = "mechanic", -- Used only when anim and scenario are omitted.
    props = {
        {
            model = "prop_tool_screwdvr01",
            bone = 60309,
            offset = vector3(0.05, 0.0, 0.0),
            rotation = vector3(0.0, 0.0, 0.0),
            softPinning = true,
            collision = false,
            rotationOrder = 0,
            syncRotation = true,
        },
    },
    -- Legacy alternatives to props; don't add these on top of the prop above:
    -- prop = { model = "prop_tool_screwdvr01", coords = vector3(0.05, 0.0, 0.0), bone = 60309, rotation = vector3(0.0, 0.0, 0.0) },
    -- proptwo = { model = "prop_tool_screwdvr01", coords = vector3(0.05, 0.0, 0.0), bone = 60309, rotation = vector3(0.0, 0.0, 0.0) },
    maxProps = 2,
})

if completed then
    print("Lock picked.")
else
    print("Lockpicking interrupted.")
end`,
        basicExample: `local completed = Kora.progressbar.start({
    label = "Picking the lock...",
    duration = 8000,
    disable = { move = true, combat = true, car = true },
    anim = {
        dict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
        clip = "machinic_loop_mechandplayer",
    },
})

if completed then
    print("Lock picked.")
else
    print("Lockpicking interrupted.")
end`,
        useCase: 'Use for timed actions such as searching, repairing, crafting, or picking a lock. Only continue the action when the function returns true.',
      },
      {
        name: 'cancel',
        signature: 'Kora.progressbar.cancel()',
        summary: 'Ask the progress bar started by this resource to stop. It ends on the next update, usually within a frame.',
        parameters: [],
        returns: 'boolean',
        returnValues: answers(['true', 'A running progress bar owned by this resource was asked to stop.'], ['false', 'This resource did not have a running progress bar to cancel.']),
        example: `local cancelled = Kora.progressbar.cancel()\nprint(cancelled)`,
        useCase: 'Stop an in-progress action when another event makes it unnecessary, such as a target disappearing.',
      },
      {
        name: 'isActive',
        signature: 'Kora.progressbar.isActive()',
        summary: 'Check whether any progress bar from this module is currently running.',
        parameters: [],
        returns: 'boolean',
        returnValues: answers(['true', 'A progress bar is currently running.'], ['false', 'No progress bar is currently running.']),
        example: `if Kora.progressbar.isActive() then\n    print("A progress bar is running.")\nend`,
        useCase: 'Check whether an action is already in progress before starting a conflicting interaction.',
      },
    ],
  },
}
