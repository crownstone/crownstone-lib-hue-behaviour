import {Behaviour} from "./behaviour/Behaviour";

import {
  EventUnsubscriber, HueFullState,
  HueLightState,
  PrioritizedList,
  SphereLocation,
  StateUpdate
} from "../declarations/declarations";
import {BehaviourAggregatorUtil} from "./BehaviourAggregatorUtil";
import Timeout = NodeJS.Timeout;

const POLLING_RATE = 500;

export class SwitchBehaviourAggregator {
  behaviours: Behaviour[] = [];
  prioritizedBehaviour: Behaviour = undefined;
  timestamp = 0;
  composedState: HueLightState;
  intervalId:Timeout;
  constructor() {
  }

  init(): void {
    this.intervalId = setInterval(() => this._loop(), POLLING_RATE);

  }
  cleanup(): void {
    clearInterval(this.intervalId);
    for (const behaviour of this.behaviours) {
      behaviour.cleanup();
    }
  }


  addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): void {
    this.behaviours.push(new Behaviour(behaviour, sphereLocation));
  }

  removeBehaviour(cloudId: string): void {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === cloudId) {
        this.behaviours[i].cleanup();
        this.behaviours.splice(i, 1);
        break;
      }
    }
  }

  updateBehaviour(behaviour: HueBehaviourWrapper): void {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === behaviour.cloudId) {
        this.behaviours[i].behaviour = behaviour;
        break;
      }
    }
  }

  async _loop() {
      this.timestamp = Date.now();
      this._sendTickToBehaviours();
      this._prioritizeBehaviour();
  }

  _sendTickToBehaviours(): void {
    for (const behaviour of this.behaviours) {
      behaviour.tick(this.timestamp);
    }
  }

  _prioritizeBehaviour() {
    if (this.behaviours === []) {
      this.prioritizedBehaviour = undefined;
    }

    let activeBehaviours = [];
    this.behaviours.forEach(behaviour => {
      if (behaviour.isActive) {
        if (behaviour.behaviour.type === "BEHAVIOUR") {
          activeBehaviours.push(behaviour);
        }
      }
    });
    this.prioritizedBehaviour = this._getPrioritizedBehaviour(activeBehaviours);
    this.composedState = (this.prioritizedBehaviour !== undefined) ? this.prioritizedBehaviour.getComposedState() : {on: false};
  }


  /** Returns the prioritized behaviour
   *
   * @param behaviours - a list of active behaviours to be iterated through.
   * @Returns a Behaviour or undefined when given list was empty.
   */
  _getPrioritizedBehaviour(behaviours: Behaviour[]): Behaviour {
    if (behaviours === []) {
      return undefined;
    } else {
      const prioritizedList = BehaviourAggregatorUtil.prioritizeBehaviours(behaviours);
      return BehaviourAggregatorUtil.getBehaviourWithHighestPriority(prioritizedList);
    }
  }


  /** Returns the composed state of the active and prioritized behaviour.
   *
   */
  getComposedState(): HueLightState {
    return this.composedState;
  }
}

