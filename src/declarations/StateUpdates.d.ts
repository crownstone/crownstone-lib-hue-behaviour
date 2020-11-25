/** Switch command
 *  @param value - True | False
 */
interface switchCommand {
  type: "SWITCH",
  value: boolean
}

/** Dimming command.
 * @param value - Should have a range from 0 to 100;
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
  hue: number
}