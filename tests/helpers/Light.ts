import {mockApi} from "./Api";
import {BehaviourAggregator} from "../../src/behaviour/BehaviourAggregator";

/** Simulates an Hue Light object, for testing Purposes
 *
 */
interface StateUpdate{on:boolean, bri:number}
interface  HueLightState extends StateUpdate{}
export class mockLight {
  state: HueLightState;
  behaviourAggregator: BehaviourAggregator
  api: mockApi;
  constructor(api) {
    this.api = api;
    this.state = api.lights.getLightState();
    this.behaviourAggregator = new BehaviourAggregator(async (value:StateUpdate)=>{ await this.setState(value)},{...this.state});
  }

  setState(state){
    this.api.lights.setState(0,{...state});
    this.state = {...state};
  }

  async renewState(){
    let oldState = {} as HueLightState;
    Object.keys(this.state).forEach((key) => {
      oldState[key] = this.state[key]
    })
    this.state = this.api.lights.getLightState();
    if(oldState.on !== this.state.on || oldState.bri !== this.state.bri ){
      await this.behaviourAggregator.lightStateChanged(<HueFullState>{...this.state});
    }
  }

  printInfo(){
    console.log(`The light is turned ${(this.state.on)?"on with a dim percentage of " +this.state.bri/2.54 +"%":"off"}.`)
  }
}