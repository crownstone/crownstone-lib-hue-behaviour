import {Twilight} from "./behaviour/Twilight";
import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";


export class PrioritizerBase {
  behaviours: Twilight[] | SwitchBehaviour[] = [];
  prioritizedBehaviour: Twilight | SwitchBehaviour = undefined;
  timestamp = 0;
  composedState: BehaviourState;

  cleanup(): void {
    for (const behaviour of this.behaviours) {
      behaviour.cleanup();
    }
  }

  setBehaviour(behaviour: BehaviourWrapper,sphereLocation): number {
    throw("setBehaviour has to be overloaded!")
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
    throw "_prioritizeBehaviour must be overloaded!";
  }


  /** Returns the composed state of the active and prioritized behaviour.
   *
   */
  getComposedState(): BehaviourState {
    return this.composedState;
  }
}

