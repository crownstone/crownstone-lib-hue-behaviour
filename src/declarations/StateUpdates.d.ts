/** Switch command
 *  @param value - True | False
 */
interface switchCommand {
  type: "SWITCH",
  value: boolean
}

/** Dimming command.
 * @param value - Should have a range from 0 to 100;
 *
 *  Value = 0  === Off, Value > 0 === On + brightness level.
 */
interface dimmingCommand {
  type: "DIMMING",
  value: number
}

/** Color command
 * @param hue - Should have a range from 0 to 360;
 * @param saturation - Should have a range from 0 to 100;
 * @param brightness - Should have a range from 0 to 100;
 */

interface colorCommand {
  type: "COLOR",
  hue: number,
  brightness: number,
  saturation: number
}

type StateUpdate = switchCommand | dimmingCommand | colorCommand;


interface SwitchableState{
  type: "SWITCHABLE",
  on: boolean
}
interface DimmableState{
  type: "DIMMABLE",
  on: boolean,
  brightness: number
}

interface ColorableState{
  type: "COLORABLE",
  on: boolean,
  hue: number,
  brightness: number,
  saturation: number
}

type DeviceStates = SwitchableState | DimmableState | ColorableState

type DeviceType = "SWITCHABLE" | "DIMMABLE" | "COLORABLE";

interface BehaviourValueRangeState{
  type: "RANGE"
    value: number // 0 ... 100
}

interface BehaviourColorState{
  type: "COLOR",
  brightness: number,
  hue: number,
  saturation: number
}
type BehaviourStates = BehaviourValueRangeState | BehaviourColorState

