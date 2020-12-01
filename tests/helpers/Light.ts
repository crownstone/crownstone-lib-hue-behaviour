/** Simulates an Hue Light object, for testing Purposes
 *
 */
import {GenericUtil} from "../../src/util/GenericUtil";


export class mockLight {
  uniqueId: string;
  state: HueFullState;
  id: number;
  apiState: HueFullState
  stateUpdateCallback = ((state) => {
  });
  intervalId;
  constructor(uniqueId, id, state) {
    this.state =  {...state};
    this.apiState =  {...state};
    this.id = id;
    this.uniqueId = uniqueId;
  }

  init(){ this.intervalId = setInterval(async () => await this.renewState(), 500);
  }

  setState(state) {
      this.state.on = state.on;
      this.apiState.on = state.on;
      this.state.bri = state.bri
      this.apiState.bri = state.bri
  }

  getType(){
    return "DIMMABLE";
  }

  getState(){
    return {...this.state};
  }

  setStateUpdateCallback(callback:(state) => {}):void {
    this.stateUpdateCallback = callback;
  }

  async renewState(){
    const oldState = {...this.state};
    this.state = {...this.apiState};
    if(oldState.on !== this.state.on || oldState.bri !== this.state.bri ){
      await this.stateUpdateCallback({...this.state});
    }
  }

  getUniqueId(){
    return this.uniqueId;
  }

  cleanup(){
    clearInterval(this.intervalId);
  }

  printInfo(){
    console.log(`The light is turned ${(this.state.on)?"on with a dim percentage of " +this.state.bri/2.54 +"%":"off"}.`)
  }
}

export class mockWrapper {
  state: {on: boolean, bri: number}
  id: number
  light;
  callback;
  constructor(light) {
    this.state = light.getState();
    this.light = light
  }
  setState(state){
    if(state.type === "SWITCH"){
      this.state.on = state.value;
      this.light.setState({on:state.value * 2.54});
    }
    if(state.type === "DIMMING"){
      if(state.value === 0){
        this.state.on = state.false;
        this.light.setState({on:false});
      }
      else{
        this.state.on = true;
        this.state.bri = state.value;
        this.light.setState({on:true, bri: state.value * 2.54});
      }
    }
  }

  getUniqueId(){
    return this.light.getUniqueId();
  }
  
  getDeviceType(): DeviceType{return "DIMMABLE";}

  getState(){
    return {type: "DIMMABLE", on: this.state.on, brightness: this.state.bri }
  }

 async setStateUpdateCallback(callback:((state:StateUpdate) => {})): Promise<void>{
    this.callback  = callback;
    await this.light.setStateUpdateCallback(this.sendStateToBehaviour.bind(this));
  }

  sendStateToBehaviour(state):void{
    this.callback(this._convertToBehaviourFormat(state));
  }

  _convertToBehaviourFormat(state:HueFullState): StateUpdate{
    const oldState = this.state;
    this.state = GenericUtil.deepCopy(state);
    if(this.getDeviceType() === "DIMMABLE"){
      if(state.on && state.bri != oldState.bri){
        return {type:"DIMMING", value: this.state.bri / 2.54}
      } else if(state.on) {
        return {type:"SWITCH", value: true}
      } else {
        return {type:"SWITCH", value: false}
      }
    }
  }




}