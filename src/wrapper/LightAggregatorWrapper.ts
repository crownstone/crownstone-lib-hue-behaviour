import {Light} from "..";
import {BehaviourAggregator} from "../behaviour/BehaviourAggregator";

export class LightAggregatorWrapper{
  light: Light
  behaviourAggregator: BehaviourAggregator

  constructor(light:Light) {
    this.light = light;
    this.behaviourAggregator = new BehaviourAggregator(async (value:StateUpdate)=>{ await light.setState(value)},light.getState());
  }

  init(){
    this.behaviourAggregator.init();
    this.light.setCallback(async (value:HueFullState) => {await this.behaviourAggregator.lightStateChanged(value)})
    this.light.init();
  }

  cleanup(){
    this.behaviourAggregator.cleanup();
    this.light.cleanup();
  }
}