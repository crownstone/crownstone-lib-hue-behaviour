/** Simulates an Hue Light object, for testing Purposes
 *
 */
import {GenericUtil} from "../../src/util/GenericUtil";


export class mockLight {
  uniqueId: string;
  type: string;
  state: { on: boolean, bri: number, hue?: number, sat?: number, ct?: number };
  id: number;
  apiState: { on: boolean, bri: number, hue?: number, sat?: number, ct?: number };
  stateUpdateCallback = ((state) => {
  });
  intervalId;

  constructor(uniqueId, id, state, type = "Dimmable light") {
    this.state = {...state};
    this.apiState = {...state};
    this.id = id;
    this.uniqueId = uniqueId;
    this.type = type;
  }

  init() {
    this.intervalId = setInterval(async () => await this.renewState(), 500);
  }

  setState(state) {
    this.state.on = state.on;
    this.apiState.on = state.on;
    if (state.bri !== undefined) {

      this.state.bri = state.bri
      this.apiState.bri = state.bri

    }
    if (state.hue !== undefined) {

      this.apiState.hue = state.hue
      this.state.hue = state.hue
    }
    if (state.sat !== undefined) {

      this.apiState.sat = state.sat
      this.state.sat = state.sat
    }
    if (state.ct !== undefined) {

      this.apiState.ct = state.ct
      this.state.ct = state.ct
    }
  }

  getType() {
    return this.type;
  }

  getCurrentState() {
    return {...this.state};
  }
  setStateUpdateCallback(callback: (state) => {}): void {
    this.stateUpdateCallback = callback;
  }

  async renewState() {
    const oldState = {...this.state};
    this.state = {...this.apiState};
    if (oldState.on !== this.state.on || oldState.bri !== this.state.bri) {
      await this.stateUpdateCallback({...this.state});
    }
  }

  getUniqueId() {
    return this.uniqueId;
  }

  cleanup() {
    clearInterval(this.intervalId);
  }

  printInfo() {
    console.log(`The light is turned ${(this.state.on) ? "on with a dim percentage of " + this.state.bri / 2.54 + "%" : "off"}.`)
  }
}

export class mockWrapper {
  state: { on: boolean, bri: number, hue?: number, sat?: number, ct?: number };
  id: number
  light;
  callback;

  constructor(light) {
    this.state = light.getCurrentState();
    this.light = light
  }

  setState(state) {
    if (state.type === "SWITCH") {
      this.state.on = state.value;
      this.light.setState({on: state.value * 2.54});
    }
    if (state.type === "DIMMING") {
      if (state.value === 0) {
        this.state.on = state.false;
        this.light.setState({on: false});
      }
      else {
        this.state.on = true;
        this.state.bri = state.value * 2.54;
        this.light.setState({on: true, bri: state.value * 2.54});
      }
    }
    if (state.type === "COLOR") {
      if (state.brightness === 0) {
        this.state.on = state.false;
        this.light.setState({on: false});
      }
      else {
        this.state.on = true;
        this.state.bri = state.brightness * 2.54;
        this.state.hue = state.hue * 382.04;
        this.state.sat = state.saturation * 2.54;
        this.light.setState({
          on: true,
          bri: state.brightness * 2.54,
          hue: state.hue * 382.04,
          sat: state.saturation * 2.54
        });
      }
    }

    if (state.type === "COLOR_TEMPERATURE") {
      if (state.brigthness === 0) {
        this.state.on = state.false;
        this.light.setState({on: false});
      }
      else {
        this.state.on = true;
        this.state.bri = state.brightness * 2.54;
        this.state.ct = state.temperature;
        this.light.setState({on: true, bri: state.brightness * 2.54, ct: Math.floor(1000000 / state.temperature)});
      }
    }
  }

  getUniqueId() {
    return this.light.getUniqueId();
  }


  getDeviceType(): DeviceType {
    if (this.light.getType() === "Color light" || this.light.getType() === "Extended color light") {
      return "COLORABLE";
    }
    else if (this.light.getType() === "Color temperature light") {
      return "COLORABLE_TEMPERATURE";
    }
    else if (this.light.getType() === "Dimmable light") {
      return "DIMMABLE";
    }
  }
  getState() {
    if (this.getDeviceType() === "DIMMABLE") {
      return {type: this.getDeviceType(), on: this.state.on, brightness: this.state.bri / 2.54}
    }
    if (this.getDeviceType() === "COLORABLE") {
      return {
        type: this.getDeviceType(),
        on: this.state.on,
        brightness: this.state.bri / 2.54,
        hue: this.state.hue / 182.04,
        saturation: this.state.sat / 2.54,
        temperature: Math.floor(1000000 / this.state.ct)
      }
    }
    if (this.getDeviceType() === "COLORABLE_TEMPERATURE") {
      return {
        type: this.getDeviceType(),
        on: this.state.on,
        brightness: this.state.bri / 2.54,
        temperature: Math.floor(1000000 / this.state.ct)
      }
    }
  }

  async setStateUpdateCallback(callback: ((state: StateUpdate) => void)): Promise<void> {
    this.callback = callback;
    await this.light.setStateUpdateCallback(this.sendStateToBehaviour.bind(this));
  }

  sendStateToBehaviour(state): void {
    this.callback(this._convertToBehaviourFormat(state));
  }

  _convertToBehaviourFormat(state): StateUpdate {
    const oldState = this.state;
    this.state = GenericUtil.deepCopy(state);
    if (this.getDeviceType() === "DIMMABLE") {
      if (state.on && state.bri != oldState.bri) {
        return {type: "DIMMING", value: this.state.bri / 2.54}
      }
      else if (state.on) {
        return {type: "SWITCH", value: true}
      }
      else {
        return {type: "SWITCH", value: false}
      }
    }
    if (this.getDeviceType() === "COLORABLE") {
      if (state.on && (state.hue !== oldState.hue || state.sat !== oldState.sat)) {
        return {
          type: "COLOR",
          brightness: this.state.bri / 2.54,
          saturation: this.state.sat / 2.54,
          hue: this.state.hue / 182.04
        }
      }
      if (state.on && (oldState.ct !== state.ct)) {
        return {type: "COLOR_TEMPERATURE", brightness: this.state.bri / 2.54, temperature: 1000000 / this.state.ct}

      }
      if (state.on && state.bri != oldState.bri) {
        return {type: "DIMMING", value: this.state.bri / 2.54}
      }
      else if (state.on) {
        return {type: "SWITCH", value: true}
      }
      else {
        return {type: "SWITCH", value: false}
      }
    }
  }


}