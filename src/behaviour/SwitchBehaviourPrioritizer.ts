import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {BehaviourAggregatorUtil} from "./BehaviourAggregatorUtil";
import {PrioritizerBase} from "./PrioritizerBase";


export class SwitchBehaviourPrioritizer extends PrioritizerBase {
  behaviours: SwitchBehaviour[] = [];
  prioritizedBehaviour: SwitchBehaviour = undefined;



  setBehaviour(behaviour: HueBehaviourWrapperBehaviour, sphereLocation: SphereLocation): number {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === behaviour.cloudId) {
        this.behaviours[i].behaviour = behaviour;
        this.behaviours[i].presenceLocations = []; //Reset in case Presence rules has changed.
        return i;
      }
    }
    return this.behaviours.push(new SwitchBehaviour(behaviour, sphereLocation));
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

  _prioritizeBehaviour():void {

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
    this.composedState = (this.prioritizedBehaviour) ? this.prioritizedBehaviour.getComposedState() : {on: false};
  }
}

