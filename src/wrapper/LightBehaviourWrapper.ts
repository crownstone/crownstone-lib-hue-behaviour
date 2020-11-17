import {Light} from "..";
import {BehaviourAggregator} from "../behaviour/BehaviourAggregator";

export class LightBehaviourWrapper {
  light: Light
  behaviourAggregator: BehaviourAggregator
  initialized: boolean = false;

  constructor(light: Light) {
    this.light = light;
    this.behaviourAggregator = new BehaviourAggregator(async (value: StateUpdate) => {
      await light.setState(value)
    }, light.getState());
  }

  init(): void {
    if (this.initialized) { return; }
    this.initialized = true;
      this.behaviourAggregator.init();
      this.light.setStateUpdateCallback(async (value: HueFullState) => {
        await this.behaviourAggregator.lightStateChanged(value)
      })
      this.light.init();
  }

  cleanup(): void {
    this.behaviourAggregator.cleanup();
    this.light.cleanup();
  }
}