import {BehaviourUtil} from "./BehaviourUtil";
import {eventBus} from "../../util/EventBus";
import {ON_SPHERE_CHANGE} from "../../constants/EventConstants";


export abstract class BehaviourBase {
  behaviour: HueBehaviourWrapper;
  isActive: boolean;
  timestamp: number | null = null;
  sphereLocation: SphereLocation
  unsubscribeSphereChangeEvent: EventUnsubscriber;

  protected constructor(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation) {
    this.behaviour = behaviour;
    this.sphereLocation = sphereLocation;
    this.unsubscribeSphereChangeEvent = eventBus.subscribe(ON_SPHERE_CHANGE, this.setSphereLocation.bind(this));
  }

  cleanup():void {
    this.unsubscribeSphereChangeEvent();
  }

  setSphereLocation(sphereLocation: SphereLocation):void {
    this.sphereLocation = sphereLocation;
  }

  tick(timestamp: number):void {
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
    throw "_behaviourActiveCheck has to be overloaded!"
  }
}
