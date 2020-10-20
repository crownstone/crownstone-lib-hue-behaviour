import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {SphereLocation} from "../declarations/declarations";
import {BehaviourAggregatorUtil} from "./BehaviourAggregatorUtil";
import {PrioritizerBase} from "./PrioritizerBase";
import {HueBehaviourWrapperBehaviour} from "../declarations/behaviourTypes";


export class SwitchBehaviourPrioritizer extends PrioritizerBase {
  behaviours: SwitchBehaviour[] = [];
  prioritizedBehaviour: SwitchBehaviour = undefined;

  cleanup(): void {
    for (const behaviour of this.behaviours) {
      behaviour.cleanup();
    }
  }



  addBehaviour(behaviour: HueBehaviourWrapperBehaviour, sphereLocation: SphereLocation): void {
    this.behaviours.push(new SwitchBehaviour(behaviour, sphereLocation));
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
    this.prioritizedBehaviour = BehaviourAggregatorUtil.getPrioritizedBehaviour(activeBehaviours);
    this.composedState = (typeof(this.prioritizedBehaviour) !== "undefined") ? this.prioritizedBehaviour.getComposedState() : {on: false};
  }
}

