import {BehaviourUtil} from "./BehaviourUtil";
import {eventBus} from "../../util/EventBus";
import {ON_SPHERE_CHANGE} from "../../constants/EventConstants";

export abstract class BehaviourBase {
  behaviour: BehaviourWrapper;
  isActive: boolean;
  timestamp: number | null = null;
  sphereLocation: SphereLocation
  unsubscribeSphereChangeEvent: EventUnsubscriber;

  protected constructor(behaviour: BehaviourWrapper, sphereLocation: SphereLocation) {
    this.behaviour = behaviour;
    this.sphereLocation = sphereLocation;
    this.unsubscribeSphereChangeEvent = eventBus.subscribe(ON_SPHERE_CHANGE, this.setSphereLocation.bind(this));
  }

  cleanup(): void {
    this.unsubscribeSphereChangeEvent();
  }

  setSphereLocation(sphereLocation: SphereLocation): void {
    this.sphereLocation = sphereLocation;
  }

  tick(timestamp: number): void {
    this.timestamp = timestamp;
    this._behaviourActiveCheck();
  }

  /**
   * Retrieves the SwitchBehaviour's composed state.
   *
   *
   * @Returns a Hue Light state
   */
  getComposedState(): BehaviourStates {
    return this._createComposedState();
  }

  _createComposedState(): BehaviourStates {
    if (this.isActive) {
      if (this.behaviour.data.action.type === "BE_ON" || this.behaviour.data.action.type === "DIM_WHEN_TURNED_ON") {
        return {type: "RANGE", value: this.behaviour.data.action.data};
      }
      if(this.behaviour.data.action.type === "BE_COLOR" || this.behaviour.data.action.type === "SET_COLOR_WHEN_TURNED_ON"){
        if(this.behaviour.data.action.data.type === "COLOR"){
          return {type: "COLOR", brightness: this.behaviour.data.action.data.brightness, saturation: this.behaviour.data.action.data.saturation, hue: this.behaviour.data.action.data.hue};
        }
        if(this.behaviour.data.action.data.type === "COLOR_TEMPERATURE"){
          return {type: "COLOR_TEMPERATURE", brightness: this.behaviour.data.action.data.brightness, temperature: this.behaviour.data.action.data.temperature};
        }
      }
    }
    else {
        return {type: "RANGE", value: 0};
    }
  }


  /**
   * Checks if the behaviour is active according to the defined rules.
   *
   */
  _behaviourActiveCheck(): void {
    throw "_behaviourActiveCheck has to be overloaded!"
  }
}
