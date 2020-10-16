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


export class BehaviourBase {
  behaviour: HueBehaviourWrapper;
  isActive: boolean;
  timestamp: number | null = null;
  sphereLocation: SphereLocation

  constructor(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation) {
    this.behaviour = behaviour;
    this.sphereLocation = sphereLocation;
  }

  setSphereLocation(sphereLocation: SphereLocation) {
    this.sphereLocation = sphereLocation;
  }

  tick(timestamp: number) {
    this.timestamp = timestamp;
    this._behaviourActiveCheck();
  }
  /**
   * Retrieves the SwitchBehaviour's composed state.
   *
   *
   * @Returns a Hue Light state
   */
  getComposedState(): HueLightState {
    return (this.isActive) ? this._createComposedState() : {on: false}
  }

  _createComposedState(): HueLightState {
    return {on: true, bri: BehaviourUtil.mapBehaviourActionToHue(this.behaviour.data.action.data)}
  }


  /**
   * Checks if the behaviour is active according to the defined rules.
   *
   */
  _behaviourActiveCheck(): void {

  }
}
