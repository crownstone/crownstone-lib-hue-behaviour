import {BehaviourAggregator} from "../behaviour/BehaviourAggregator";

export class GenericObjectBehaviourWrapper {
  genericObject: any
  behaviourAggregator: BehaviourAggregator
  initialized: boolean = false;

  constructor(genericObject: any) {
    this.genericObject = genericObject;
    this.behaviourAggregator = new BehaviourAggregator(async (value: StateUpdate) => {await genericObject.setState(value) }, genericObject.getState());
    this.genericObject.setStateUpdateCallback(async (value: HueFullState) => {
      await this.behaviourAggregator.onStateChange(value)
    })
  }

  init(): void {
    if (this.initialized) { return; }
    this.initialized = true;
    this.behaviourAggregator.init();
    this.genericObject.init();
  }

  cleanup(): void {
    this.behaviourAggregator.cleanup();
    this.genericObject.cleanup();
  }
}