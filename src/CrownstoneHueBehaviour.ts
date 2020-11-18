import {Light} from "../../crownstone-lib-hue/"
import {eventBus} from "./util/EventBus";
import {ON_DUMB_HOUSE_MODE_SWITCH, ON_PRESENCE_CHANGE, ON_SPHERE_CHANGE} from "./constants/EventConstants";
import {GenericUtil} from "./util/GenericUtil";
import {LightBehaviourWrapper} from "./wrapper/LightBehaviourWrapper";
import { SPHERE_DEFAULT} from "./constants/HueConstants";

/**
 * CrownstoneHueBehaviour object
 *
 *
 * @param sphereLocation - Longitude and Latitude of the location of where the Sphere is.
 * @param wrappers - List of a wrapped light and behaviours
 *
 */


export class CrownstoneHueBehaviour {
  wrappers: { [uniqueId: string]: LightBehaviourWrapper } = {};
  sphereLocation: SphereLocation;
  dumbHouseModeActive: boolean = false;
  activePresenceEvents: PresenceEvent[] = [];

  constructor(sphereLocation?: SphereLocation) {
    if (!sphereLocation || !sphereLocation.latitude|| !sphereLocation.longitude) {
      sphereLocation = SPHERE_DEFAULT;
    }
    this.sphereLocation = sphereLocation;
  }

  /** Call to change/set new Sphere location
   */
  setSphereLocation(sphereLocation: SphereLocation): void {
    this.sphereLocation = sphereLocation;
    eventBus.emit(ON_SPHERE_CHANGE, sphereLocation)
  }

  /** Call to turn on/off Dumb house mode.
   *
   * @param on - Boolean whether Dumb house mode should be on or off.
   */
  setDumbHouseMode(on: boolean): void {
    eventBus.emit(ON_DUMB_HOUSE_MODE_SWITCH, on);
    this.dumbHouseModeActive = on;
  }

  /** Adds/Updates the new behaviour on its light.
   * Passes the active presence events to the new behaviour.
   * @param newBehaviour
   */
  setBehaviour(newBehaviour: HueBehaviourWrapper): boolean {
    const behaviour = GenericUtil.deepCopy(newBehaviour) as HueBehaviourWrapper;
      if (this.wrappers[behaviour.lightId] !== undefined) {
        this._setBehaviour(this.wrappers[behaviour.lightId], behaviour);
        return true;
      }
    return false;
  };

  _setBehaviour(lightBehaviourWrapper: LightBehaviourWrapper, behaviour: HueBehaviourWrapper): void {
    const index = lightBehaviourWrapper.behaviourAggregator.setBehaviour(behaviour, this.sphereLocation);
    if (behaviour.type === "BEHAVIOUR") {
      for (const event of this.activePresenceEvents) {
        lightBehaviourWrapper.behaviourAggregator.switchBehaviourPrioritizer.behaviours[index].onPresenceDetect(event);
      }
    }
  }


  removeBehaviour(lightId: string, cloudId: string): void {
      const light = this.wrappers[lightId];
      if (light !== undefined) {
        light.behaviourAggregator.removeBehaviour(cloudId);
    }
  };

  /** Use when a user enters or leaves a room or sphere.
   *  Saves the event for when a new behaviour is added.
   * @param presenceEvent
   */
  presenceChange(presenceEvent: PresenceEvent): void {
    if (presenceEvent.type === "ENTER") {
      this.activePresenceEvents.push(presenceEvent);
    }
    else if (presenceEvent.type === "LEAVE") {
      this._onPresenceLeave(presenceEvent);
    }
    else {
      return;
    }
    eventBus.emit(ON_PRESENCE_CHANGE, presenceEvent);
  }

  _onPresenceLeave(presenceEvent: PresenceEvent): void {
    for (let i = 0; i < this.activePresenceEvents.length; i++) {
      let presenceProfile = this.activePresenceEvents[i].data;
      if (presenceProfile.profileIdx === presenceEvent.data.profileIdx) {
        if (presenceEvent.data.type === "SPHERE" && presenceProfile.type === "SPHERE") {
          this.activePresenceEvents.splice(i, 1);
          break;
        }
        if (presenceEvent.data.type === "LOCATION" && presenceProfile.type === "LOCATION") {
          if (presenceEvent.data.locationId === presenceProfile.locationId) {
            this.activePresenceEvents.splice(i, 1);
            break;
          }
        }
      }
    }
  }


  addLight(light: Light): LightBehaviourWrapper {
    const lightBehaviourWrapper = new LightBehaviourWrapper(light);
    lightBehaviourWrapper.init();
    this.wrappers[light.getUniqueId()] = lightBehaviourWrapper;
    lightBehaviourWrapper.behaviourAggregator.onDumbHouseModeSwitch(this.dumbHouseModeActive)
    return lightBehaviourWrapper;
  }

  removeLight(lightId: string): void {
    if (this.wrappers[lightId] !== undefined) {
      this.wrappers[lightId].cleanup();
      delete this.wrappers[lightId];
    }
  }


  /** Returns a map of all connected lights by uniqueId

   */
  getAllConnectedLights(): { [uniqueId: string]: Light } {
    let lights = {}
    for (const wrappedLight of Object.values(this.wrappers)) {
      lights[wrappedLight.light.uniqueId] = wrappedLight.light;
    }
    return lights;
  }


  stop(): void {
    Object.values(this.wrappers).forEach(wrappedLight => {
      wrappedLight.cleanup();
    });
  }
}
