import {eventBus} from "../../util/EventBus";
import {BehaviourUtil} from "./BehaviourUtil";
import {BehaviourSupport} from "./BehaviourSupport";


export class Behaviour {
  behaviour: HueBehaviourWrapper;
  isActive: boolean;
  presenceLocations: PresenceProfile[] = []; // Empty when no one is present for this behaviour.
  timestamp: number | null = null;
  lastPresenceUpdate: number = 0;

  sphereLocation: SphereLocation

  unsubscribe: EventUnsubscriber

  constructor(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation) {
    this.behaviour = behaviour;
    this.sphereLocation = sphereLocation;
    this.unsubscribe = eventBus.subscribe("onPresenceDetect", this._onPresenceDetect.bind(this));
  }

  setSphereLocation(sphereLocation: SphereLocation) {
    this.sphereLocation = sphereLocation;
  }

  cleanup() {
    this.unsubscribe();
  }

  tick(timestamp: number) {
    this.timestamp = timestamp;
    this._behaviourActiveCheck();
  }

  /**
   * On Presence detection when someone enters/leaves a SPHERE or LOCATION,
   * Checks if Behaviour has IGNORE as presence type and if endCondition is set.
   * Calls _handlePresenceEvent() with the appropriate Presence object.
   * @param presenceEvent - PresenceEvent object of type ENTER or LEAVE, containing information of who enters/leaves which room or the house.
   */
  _onPresenceDetect(presenceEvent: PresenceEvent): void {
    if (this.behaviour.data.presence.type !== "IGNORE") {
      this._handlePresenceEvent(presenceEvent, this.behaviour.data.presence)
    } else if ("endCondition" in this.behaviour.data && this.behaviour.data.endCondition.presence.type === "SOMEBODY") {
      this._handlePresenceEvent(presenceEvent, this.behaviour.data.endCondition.presence)
    }
  }

  /**
   * Parsing function for Presence Detection Event Handling,
   * Simple check for handling the appropriate event.
   * @param presenceEvent - PresenceEvent object of type ENTER or LEAVE
   * @param presenceObject - Presence object, can be the one of Behaviour.presence or Behaviour.endCondition.
   */
  _handlePresenceEvent(presenceEvent: PresenceEvent, presenceObject): void {
    if (presenceEvent.type === "ENTER") {
      this._onPresenceEnterEvent(presenceEvent, presenceObject);
    } else if (presenceEvent.type === "LEAVE") {
      this._onPresenceLeaveEvent(presenceEvent);
    }
  }

  /**
   * On Presence detection when someone enters a SPHERE or LOCATION,
   * If SPHERE related, Check if Behaviour handles SPHERE based presences, then simply add PresenceProfile to list.
   * If LOCATION related, Check if Behaviour handles LOCATION based presences,
   *    If true: Check if PresenceProfile locationId matches locationId in Presence object locationIds.
   *        If true: add to presenceLocations list if matches.
   * @param presenceEvent - PresenceEvent object of type ENTER, containing information of who entered a which room or the house.
   * @param presenceObject - Presence object, can be the one of Behaviour.presence or Behaviour.endCondition.
   */
  _onPresenceEnterEvent(presenceEvent: PresenceEvent, presenceObject: Presence): void {
    if (presenceEvent.data.type === "SPHERE") {
      if ("data" in presenceObject && presenceObject.data.type === "SPHERE") {
        this.presenceLocations.push(presenceEvent.data);
        this.lastPresenceUpdate = this.timestamp;
      }
    } else if (presenceEvent.data.type === "LOCATION") {
      if ("data" in presenceObject && presenceObject.data.type === "LOCATION") {
        if (presenceObject.data.locationIds.includes(presenceEvent.data.locationId)) {
          this.presenceLocations.push(presenceEvent.data);
          this.lastPresenceUpdate = this.timestamp;
        }
      }
    }
  }

  /**
   * On Presence detection when someone leaves a SPHERE or LOCATION,
   * Removes the PresenceProfile from the list on a match.
   *
   * @param presenceEvent - PresenceEvent object of type LEAVE, containing information of who leaves which room or the house.
   */
  _onPresenceLeaveEvent(presenceEvent: PresenceEvent): void {
    for (let i = 0; i < this.presenceLocations.length; i++) {
      let presenceProfile = this.presenceLocations[i];
      if (presenceProfile.profileIdx === presenceEvent.data.profileIdx) {
        if (presenceEvent.data.type === "SPHERE" && presenceProfile.type === "SPHERE") {
          this.presenceLocations.splice(i, 1);
          this.lastPresenceUpdate = this.timestamp;
          break;
        }
        if (presenceEvent.data.type === "LOCATION" && presenceProfile.type === "LOCATION") {
          if (presenceEvent.data.locationId === presenceProfile.locationId) {
            this.presenceLocations.splice(i, 1);
            this.lastPresenceUpdate = this.timestamp;
            break;
          }
        }
      }
    }
  }

  /**
   * Retrieves the Behaviour's composed state.
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
    const behaviourObj = new BehaviourSupport(this.behaviour);
    const msSinceLastUpdate = this.timestamp - this.lastPresenceUpdate;
    if (this.behaviour.type === "BEHAVIOUR") {
      if (behaviourObj.isActiveTimeObject(this.timestamp, this.sphereLocation)) {
        if (behaviourObj.isActivePresenceObject(this.presenceLocations,msSinceLastUpdate)){
          this.isActive = true;
          return;
        }
      } else if (behaviourObj.hasLocationEndCondition(), this.isActive) {
        if (BehaviourUtil.isSomeonePresent(this.presenceLocations)
          || msSinceLastUpdate < this.behaviour.data.endCondition.presence.delay * 1000) {
          this.isActive = true;
          return;
        }
      }
      this.isActive = false;
    }
  }
}
