import {HueFullState, HueLightState} from "../../src/declarations/declarations";
import {SwitchBehaviourAggregator} from "../../src/behaviour/SwitchBehaviourAggregator";
import {Api} from "./Api";

/** Simulates an Hue Light object, for testing Purposes
 *
 */

export class Light {
  state:HueLightState;
  behaviourAggregator: SwitchBehaviourAggregator
  api: Api;
  constructor(api) {
    this.api = api;
    this.behaviourAggregator = new SwitchBehaviourAggregator();
  }

  setState(state){
    this.api.lights.setState(0,state);
    this.state = state;
  }

  renewState(){
    let oldState = {} as HueLightState;
    Object.keys(this.state).forEach((key) => {
      oldState[key] = this.state[key]
    })
    this.state = this.api.lights.getLightState();
    if(oldState !== this.state){
      // this.behaviourAggregator.lightStateChanged(<HueFullState>this.state);
    }
  }

  printInfo(){
    console.log(`The light is turned ${(this.state.on)?"on with a dim percentage of " +this.state.bri/2.54 +"%":"off"}.`)
  }
}