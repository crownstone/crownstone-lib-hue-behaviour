import {CrownstoneHueBehaviour} from "../dist/src";
// import {CrownstoneHueBehaviour} from "crownstone-lib-hue-behaviour";

class ExampleDevice {
  state: { on: boolean, brightness: number, hue: number, saturation: number, temperature: number };
  id: number
  callback;

  constructor() {
    this.id = Date.now();
    this.state = {on: true, brightness: 100, hue: 412, saturation: 50, temperature: 1000}
  }

  receiveStateUpdate(state) {
    if (state.type === "SWITCH") {
      this.state.on = state.value;
    }
    if (state.type === "DIMMING") {
      if (state.value === 0) {
        this.state.on = state.false;
      }
      else {
        this.state.on = true;
        this.state.brightness = state.value;
      }
    }
    if (state.type === "COLOR") {
      if (state.brightness === 0) {
        this.state.on = state.false;
      }
      else {
        this.state.on = true;
        this.state.brightness = state.brightness;
        this.state.hue = state.hue;
        this.state.saturation = state.saturation;

      }
    }

    if (state.type === "COLOR_TEMPERATURE") {
      if (state.brigthness === 0) {
        this.state.on = state.false;
      }
      else {
        this.state.on = true;
        this.state.brightness = state.brightness;
        this.state.temperature = state.temperature;
      }
    }
    console.log("**** NEW STATE UPDATE ****")
    console.log(state);
  }

  getUniqueId() {
    return "AB:" + this.id;
  }

  getDeviceType(): string {
    return "COLORABLE";
  }

  getState() {
    return {
      type: this.getDeviceType(),
      on: this.state.on,
      brightness: this.state.brightness,
      hue: this.state.hue,
      saturation: this.state.saturation,
      temperature: this.state.temperature
    }
  }

  async setStateUpdateCallback(callback): Promise<void> {
    this.callback = callback;
  }

  sendStateToBehaviour(state): void {
    this.callback(state);
  }
}

const crownstoneHueBehaviour = new CrownstoneHueBehaviour();

const device = new ExampleDevice() //Add your own supported device.
crownstoneHueBehaviour.addDevice(device);
crownstoneHueBehaviour.setBehaviour({
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_COLOR", "data": {type: "COLOR", brightness: 42, hue: 254, saturation: 100}},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {"type": "SOMEBODY", "data": {"type": "SPHERE"}, "delay": 300}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "13sbsuqd52qyuhkfs5f4349",
  "deviceId": device.getUniqueId() //
})
console.log("Behaviour set and ready to be activated by presence.")
crownstoneHueBehaviour.presenceChange({type: "ENTER", data: {type: "SPHERE", profileIdx: 0}}); // User enters the sphere.
console.log("Presence data passed")
