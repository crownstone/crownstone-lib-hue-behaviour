export const MinStateValue = {
  brightness: 0,
  saturation: 0,
  hue: 0
}

export const MaxStateValue = {
  brightness: 100,
  saturation: 100,
  hue: 360
}

export const StateValues = {
  on: true,
  brightness: true,
  saturation: true,
  hue: true,
  value: true
}

export const SWITCH_OFF_COMMAND =  {type: "SWITCH", value: false} as StateUpdate
export const DIMMING_OFF_COMMAND =  {type: "DIMMING", value: 0} as StateUpdate
export const SWITCH_ON_COMMAND =  {type: "SWITCH", value: true} as StateUpdate