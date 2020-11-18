/** Simulates an Hue Light object, for testing Purposes
 *
 */

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
    this.state = {...state};
    this.apiState = {...state};
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