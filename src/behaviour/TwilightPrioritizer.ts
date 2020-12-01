import {BehaviourAggregatorUtil} from "./BehaviourAggregatorUtil";
import {Twilight} from "./behaviour/Twilight";
import {PrioritizerBase} from "./PrioritizerBase";


export class TwilightPrioritizer extends PrioritizerBase {
  behaviours: Twilight[] = [];
  prioritizedBehaviour: Twilight = undefined;


  setBehaviour(behaviour: BehaviourWrapperTwilight, sphereLocation: SphereLocation): number {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === behaviour.cloudId) {
        this.behaviours[i].behaviour = behaviour;
        return i;
      }
    }
    return this.behaviours.push(new Twilight(behaviour, sphereLocation));
  }

  removeBehaviour(cloudId: string): void {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === cloudId) {
        this.behaviours.splice(i, 1);
        break;
      }
    }
  }


  _prioritizeBehaviour():void {
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
    this.composedState = this.prioritizedBehaviour && this.prioritizedBehaviour.getComposedState() || undefined
  }
}