


import {Twilight} from "./behaviour/Twilight";
import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";


export class PrioritizerBase {
  behaviours: Twilight[] | SwitchBehaviour[] = [];
  prioritizedBehaviour: Twilight | SwitchBehaviour = undefined;
  timestamp = 0;
  composedState: HueLightState;

  cleanup(): void  {
    // TODO: if this HAS to be overloaded since it's a parent class, usually you put a throw here
    throw "cleanup must be overloaded!";
  }

  addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): void {
    // TODO: if this HAS to be overloaded since it's a parent class, usually you put a throw here
    throw "addBehaviour must be overloaded!";
  }

  // TODO: empty method?
  removeBehaviour(cloudId: string): void {
    // TODO: if this HAS to be overloaded since it's a parent class, usually you put a throw here
    throw "removeBehaviour must be overloaded!";
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

  // TODO: empty method?
  _prioritizeBehaviour(): void {
    // if this HAS to be overloaded since it's a parent class, usually you put a throw here
    throw "_prioritizeBehaviour must be overloaded!";
  }


  /** Returns the composed state of the active and prioritized behaviour.
   *
   */
  getComposedState(): HueLightState {
    return this.composedState;
  }
}

