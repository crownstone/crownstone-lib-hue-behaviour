import {eventBus} from "./util/EventBus";
import {ON_DUMB_HOUSE_MODE_SWITCH, ON_PRESENCE_CHANGE, ON_SPHERE_CHANGE} from "./constants/EventConstants";
import {GenericUtil} from "./util/GenericUtil";
import {DeviceBehaviourWrapper} from "./wrapper/DeviceBehaviourWrapper";
import {CrownstoneHueError} from "./util/CrownstoneHueError";
export const SPHERE_DEFAULT =  {latitude: 51.9233355, longitude: 4.469152};

/**
 * CrownstoneHueBehaviour object
 *
 *
 * @param sphereLocation - Longitude and Latitude of the location of where the Sphere is.
 *
 */
export class CrownstoneHueBehaviour {
  wrappers: { [uniqueId: string]: DeviceBehaviourWrapper } = {};
  sphereLocation: SphereLocation;
  dumbHouseModeActive: boolean = false;
  activePresenceEvents: PresenceEvent[] = [];

  constructor(sphereLocation?: SphereLocation) {
    if (!sphereLocation || !sphereLocation.latitude|| !sphereLocation.longitude) {
      sphereLocation = SPHERE_DEFAULT;
    }
    this.sphereLocation = sphereLocation;
  }

  /**
   * Call to change/set new Sphere location
   */
  setSphereLocation(sphereLocation: SphereLocation): void {
    this.sphereLocation = sphereLocation;
    eventBus.emit(ON_SPHERE_CHANGE, sphereLocation)
  }

  /**
   * Call to turn on/off Dumb house mode.
   *
   * @param on - Boolean whether Dumb house mode should be on or off.
   */
  setDumbHouseMode(on: boolean): void {
    eventBus.emit(ON_DUMB_HOUSE_MODE_SWITCH, on);
    this.dumbHouseModeActive = on;
  }

  /**
   * Adds/Updates the new behaviour on its device.
   * Passes the active presence events to the new behaviour.
   * @param deviceId - uniqueId of the device
   * @param behaviour
   */
  setBehaviour(deviceId: string, behaviour: BehaviourWrapper): boolean {
      if (this.wrappers[deviceId] !== undefined) {
        this._setBehaviour(this.wrappers[deviceId], GenericUtil.deepCopy(behaviour));
        return true;
      }
    return false;
  };

  _setBehaviour(deviceBehaviourWrapper: DeviceBehaviourWrapper, behaviour: BehaviourWrapper): void {
    const index = deviceBehaviourWrapper.behaviourAggregator.setBehaviour(behaviour, this.sphereLocation);
    if (behaviour.type === "BEHAVIOUR") {
      for (const event of this.activePresenceEvents) {
        deviceBehaviourWrapper.behaviourAggregator.switchBehaviourPrioritizer.behaviours[index].onPresenceDetect(event);
      }
    }
  }


  removeBehaviour(deviceId: string, cloudId: string): void {
      const device = this.wrappers[deviceId];
      if (device !== undefined) {
        device.behaviourAggregator.removeBehaviour(cloudId);
    }
  };

  /**
   * Use when a user enters or leaves a room or sphere.
   * Saves the event for when a new behaviour is added.
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


  addDevice(device: DeviceBehaviourSupport): DeviceBehaviourWrapper {
    if(this.wrappers[device.getUniqueId()] !== undefined){
      throw new CrownstoneHueError(500,device.getUniqueId());
    }
    const deviceBehaviourWrapper = new DeviceBehaviourWrapper(device);
    deviceBehaviourWrapper.init();
    this.wrappers[device.getUniqueId()] = deviceBehaviourWrapper;
    deviceBehaviourWrapper.behaviourAggregator.onDumbHouseModeSwitch(this.dumbHouseModeActive)
    return deviceBehaviourWrapper;
  }

  removeDevice(uniqueId: string): void {
    if (this.wrappers[uniqueId] !== undefined) {
      this.wrappers[uniqueId].cleanup();
      delete this.wrappers[uniqueId];
    }
  }


  /**
   * Returns a map of all connected devices by uniqueId
   */
  getAllDevices(): { [uniqueId: string]: DeviceBehaviourSupport } {
    let devices = {}
    for (const wrappedDevice of Object.values(this.wrappers)) {
      devices[wrappedDevice.device.getUniqueId()] = wrappedDevice.device;
    }
    return devices;
  }


  stop(): void {
    Object.values(this.wrappers).forEach(wrappedDevice => {
      wrappedDevice.cleanup();
    });
  }
}
