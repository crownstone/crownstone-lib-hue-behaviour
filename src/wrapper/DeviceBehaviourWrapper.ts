import {BehaviourAggregator} from "../behaviour/BehaviourAggregator";


export class DeviceBehaviourWrapper {
  device: DeviceBehaviourSupport
  behaviourAggregator: BehaviourAggregator
  initialized: boolean = false;

  constructor(device: DeviceBehaviourSupport) {
    this.device = device;
    this.behaviourAggregator = new BehaviourAggregator(async (value: StateUpdate) => {await device.receiveStateUpdate(value)},device.getState());
    this.device.setStateUpdateCallback(async (value: StateUpdate) => {
      await this.behaviourAggregator.onStateChange(value)
    })
  }

  init(): void {
    if (this.initialized) { return; }
    this.initialized = true;
    this.behaviourAggregator.init();
  }

  cleanup(): void {
    this.behaviourAggregator.cleanup();
  }
}