
/** Helper class for simulation purposes.
 * Simulates an Api class and more;
 */
export class mockApi {
  lights;  //Fakes reals Api's api.lights method.
  light; // Same as lights, context purpose.
  user; // Extra for testing purpose.
  constructor() {
    const light = new ApiLight()
    this.lights = light;
    this.light = light;
    this.user = new UserInteraction(light);
  }
}

/** Simulates to be the connection to the Hue Light for testing.
 *
 */
export class ApiLight {
  state: {  } = {on: false, brightness: 100};

  getLightState(id?) {
    return {...this.state};
  }

  setState(id, state) {
    for (const key of Object.keys(state)) {
      if (this.state[key] !== undefined) {
        this.state[key] = state[key];
      }
    }
  }

}

/** Simulates to be user involvement to the Hue Light for testing.
 *
 */
export class UserInteraction {
  light: ApiLight;

  constructor(light) {
    this.light = light;
  }

  turnLightOff() {
    this.light.setState(0, {on: false})
  }

  turnLightOn() {
    this.light.setState(0, {on: true})
  }

  dimLight(dimPercentage) {
    this.light.setState(0, {bri: dimPercentage*2.54})
  }
}