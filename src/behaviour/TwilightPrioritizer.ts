import {SphereLocation} from "../declarations/declarations";
import {BehaviourAggregatorUtil} from "./BehaviourAggregatorUtil";
import {Twilight} from "./behaviour/Twilight";
import {PrioritizerBase} from "./PrioritizerBase";
import {HueBehaviourWrapperTwilight} from "../declarations/behaviourTypes";


export class TwilightPrioritizer extends PrioritizerBase {
  behaviours: Twilight[] = [];
  prioritizedBehaviour: Twilight = undefined;


  addBehaviour(behaviour: HueBehaviourWrapperTwilight, sphereLocation: SphereLocation): void {
    this.behaviours.push(new Twilight(behaviour, sphereLocation));
  }

  removeBehaviour(cloudId: string): void {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === cloudId) {
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
        if (behaviour.behaviour.type === "TWILIGHT") {
          activeBehaviours.push(behaviour);
        }
      }
    });
    this.prioritizedBehaviour = BehaviourAggregatorUtil.getPrioritizedTwilight(activeBehaviours);
    this.composedState = (typeof(this.prioritizedBehaviour) !== "undefined") ? this.prioritizedBehaviour.getComposedState() : {on: false};
  }

}

