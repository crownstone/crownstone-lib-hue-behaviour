import {
  HueLightState,
  SphereLocation,
} from "../declarations/declarations";


import {Twilight} from "./behaviour/Twilight";
import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {HueBehaviourWrapper} from "../declarations/behaviourTypes";


export class PrioritizerBase {
  behaviours: Twilight[] | SwitchBehaviour[] = [];
  prioritizedBehaviour: Twilight | SwitchBehaviour = undefined;
  timestamp = 0;
  composedState: HueLightState;


  cleanup(): void  {
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

  tick(timestamp: number): void {
    this.timestamp = timestamp;
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

