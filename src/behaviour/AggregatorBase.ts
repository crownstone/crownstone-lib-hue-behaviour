import {
  HueLightState,
  SphereLocation,
} from "../declarations/declarations";

import {POLLING_RATE} from "./BehaviourAggregatorUtil";
import Timeout = NodeJS.Timeout;
import {Twilight} from "./behaviour/Twilight";
import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {HueBehaviourWrapper} from "../declarations/behaviourTypes";


export class AggregatorBase {
  behaviours: Twilight[] | SwitchBehaviour[] = [];
  prioritizedBehaviour: Twilight | SwitchBehaviour = undefined;
  timestamp = 0;
  composedState: HueLightState;
  intervalId: Timeout;

  init(): void {
    this.intervalId = setInterval(() => this._loop(), POLLING_RATE);

  }

  stopLoop(){
    clearInterval(this.intervalId);
  }

  cleanup(): void {
    this.stopLoop();
  }


  addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): void {
  }

  removeBehaviour(cloudId: string): void {
  }

  updateBehaviour(behaviour: HueBehaviourWrapper): void {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === behaviour.cloudId) {
        this.behaviours[i].behaviour = behaviour;
        break;
      }
    }
  }

  _loop(): void {
    this.timestamp = Date.now();
    this._sendTickToBehaviours();
    this._prioritizeBehaviour();
  }

  _sendTickToBehaviours(): void {
    for (const behaviour of this.behaviours) {
      behaviour.tick(this.timestamp);
    }
  }

  _prioritizeBehaviour(): void {
  }


  /** Returns the composed state of the active and prioritized behaviour.
   *
   */
  getComposedState(): HueLightState {
    return this.composedState;
  }
}

