import {Light} from "..";
import {BehaviourAggregator} from "../behaviour/BehaviourAggregator";

class LightAggregatorWrapper{
  light: Light
  behaviourAggregator: BehaviourAggregator

  constructor(light:Light) {
    this.behaviourAggregator = new BehaviourAggregator(async (value:StateUpdate)=>{ await light.setState(value)},light.getState());
  }

  init(){
    this.behaviourAggregator.init();
    this.light.setCallback(async (value:HueFullState) => {await this.behaviourAggregator.lightStateChanged(value)})
  }

  cleanup(){
    this.behaviourAggregator.cleanup();
    this.light.cleanup();
  }
}