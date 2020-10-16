import {eventBus} from "../../util/EventBus";
import {BehaviourUtil} from "./BehaviourUtil";
import {BehaviourSupport} from "./BehaviourSupport";
import {ON_PRESENCE_CHANGE} from "../../constants/EventConstants";
import {
  EventUnsubscriber,
  HueLightState,
  PresenceEvent,
  PresenceProfile,
  SphereLocation
} from "../../declarations/declarations";
import {BehaviourBase} from "./BehaviourBase";


export class Twilight extends BehaviourBase{

  constructor(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation) {
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
