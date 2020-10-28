import {BehaviourSupport} from "./BehaviourSupport";
import {BehaviourBase} from "./BehaviourBase";


export class Twilight extends BehaviourBase{

  constructor(behaviour: HueBehaviourWrapperTwilight, sphereLocation: SphereLocation) {
    super(behaviour,sphereLocation);
  }
  /**
   * Checks if the behaviour is active according to the defined rules.
   *
   */
  _behaviourActiveCheck(): void {
    const behaviourObj = new BehaviourSupport(this.behaviour);
    if (this.behaviour.type === "TWILIGHT") {
      if (behaviourObj.isActiveTimeObject(this.timestamp, this.sphereLocation)) {
        this.isActive = true;
        return;
      }
    }
    this.isActive = false;
  }
}

