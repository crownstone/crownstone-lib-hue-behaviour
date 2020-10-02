
import {eventBus} from "../../util/EventBus";
import {BehaviourUtil} from "./BehaviourUtil";


export class Behaviour {
  behaviour: HueBehaviourWrapper;
  isActive: boolean;
  presenceLocations: PresenceProfile[] = []; // Empty when no one is present for this behaviour.
  timestamp: number | null = null; // TODO: deze kan niet geinitialiseerd zijn. Hij mag tot die tijd geen waarde hebben.

  sphereLocation : SphereLocation

  unsubscribe : EventUnsubscriber

  constructor(behaviour : HueBehaviourWrapper, sphereLocation: SphereLocation) {
    this.behaviour = behaviour;
    this.sphereLocation = sphereLocation;

    // pas doen op het moment dat je een tick krijgt.
    // this._behaviourActiveCheck();

    this.unsubscribe = eventBus.subscribe("onPresenceDetect", this._onPresenceDetect.bind(this));
  }


  setSphereLocation(sphereLocation : SphereLocation) {
    this.sphereLocation = sphereLocation;
  }

  // TODO: belangrijk! events opruimen als de behaviour weggegooit gaat worden
  cleanup() {
    this.unsubscribe();
  }


  // TODO: geen default Date.now hier. Forceer hier altijd een tijd in
  // kies tussen een Date of timestamp.
  tick(timestamp : number) {
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
  _handlePresenceEvent(presenceEvent: PresenceEvent, presenceInformation): void {
    if (presenceEvent.type === "ENTER") {
      this._onPresenceEnterEvent(presenceEvent, presenceInformation);
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
      }
    } else if (presenceEvent.data.type === "LOCATION") {
      if ("data" in presenceObject && presenceObject.data.type === "LOCATION") {
        if (presenceEvent.data.locationId in presenceObject.data.locationIds) {
          this.presenceLocations.push(presenceEvent.data);
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
          this.presenceLocations[i] = undefined;
          break;
        }
        if (presenceEvent.data.type === "LOCATION" && presenceProfile.type === "LOCATION") {
          if (presenceEvent.data.locationId === presenceProfile.locationId) {
            this.presenceLocations[i] = undefined;
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
  getComposedState(): StateUpdate {
    return (this.isActive) ? this._createComposedState() : {on: false}
  }

  _createComposedState(): StateUpdate {
    return {on: true, bri: BehaviourUtil.mapBehaviourActionToHue(this.behaviour.data.action.data) }
  }

  _isActiveTimeAllDay(): boolean {
    const currentTimeInMinutes = new Date(this.timestamp).getMinutes() + (new Date(this.timestamp).getHours() * 60);

    //Checks if current time is between  00:00 > 03:59.
    if (currentTimeInMinutes < 4 * 60) {
      //Checks if yesterday should be active.
      return this.behaviour.activeDays[BehaviourUtil.getWeekday(this.timestamp, -1)]
    } else {//Else means 04:00 -> 23:59.
      //Is Today active. Thus 04:00 -> 23:59
      return this.behaviour.activeDays[BehaviourUtil.getWeekday(this.timestamp)]
    }
  }


  /**
   * Retrieves the Behaviour's (de)activation time in minutes.

   * @Param operator -  Either from or to
   *
   * @Returns
   *
   *
   * TODO: hij mag niet zelf zn tick methode aanroepen!
   */
  _getSwitchingTime(operator: "from" | "to"): number {
    switch (this.behaviour.data.time[operator].type) {
      case "SUNRISE":
        return BehaviourUtil.getSunriseTimeInMinutes(this.timestamp, this.sphereLocation) + this.behaviour.data.time[operator].offsetMinutes;
      case "SUNSET":
        return BehaviourUtil.getSunsetTimeInMinutes(this.timestamp, this.sphereLocation) + this.behaviour.data.time[operator].offsetMinutes;
      case "CLOCK":
        return this.behaviour.data.time[operator].data.minutes + (this.behaviour.data.time[operator].data.hours * 60);
      default:
        return -1;
    }
  }

  _isActiveRangeObject(): boolean {
    const currentTimeInMinutes = new Date(this.timestamp).getMinutes() + (new Date(this.timestamp).getHours() * 60);
    const fromTimeInMinutes = this._getSwitchingTime("from");
    const toTimeInMinutes = this._getSwitchingTime("to");

    if (fromTimeInMinutes === -1 || toTimeInMinutes === -1) {
      return false;
    }

    //Checks if Behaviour is activated yesterday and is still active.
    if (((toTimeInMinutes - fromTimeInMinutes) < 0) && (currentTimeInMinutes < toTimeInMinutes)) {
      return this.behaviour.activeDays[BehaviourUtil.getWeekday(-1)];
    }

    //Checks if behaviour should be activated today
    if (currentTimeInMinutes >= fromTimeInMinutes) {
      //Checks if behaviour is still active with ending day today)
      if (currentTimeInMinutes < toTimeInMinutes) {
        return this.behaviour.activeDays[BehaviourUtil.getWeekday(this.timestamp)];
      }
      // If above failed, check if ending day is the next day.
      if (toTimeInMinutes < fromTimeInMinutes) {
        return this.behaviour.activeDays[BehaviourUtil.getWeekday(this.timestamp)];
      }
    }
    return false;

  }

  _isActiveTimeObject(): boolean {
    if (this.behaviour.data.time.type === "ALL_DAY") {
      return this._isActiveTimeAllDay();
    }
    if (this.behaviour.data.time.type === "RANGE") {
      return this._isActiveRangeObject();
    }
    return false;
  }

  _isActivePresenceObject(): boolean {
    switch (this.behaviour.data.presence.type) {
      case "IGNORE":
        return true;
      case "NOBODY":
        return !this._isSomeonePresent();
      case "SOMEBODY":
        return this._isSomeonePresent();
      default:
        return false;
    }
  }

  _isActiveEndConditionObject(): boolean {
    return ("endCondition" in this.behaviour.data && this.isActive && this._isSomeonePresent())?true:false;
  }

  /**
   * Presence check
   *
   * @returns Boolean - True if Someone is present, False if No one is present.
   */
  _isSomeonePresent(): boolean {
    return (this.presenceLocations.length > 0);
  }

  _behaviourActiveCheck(): void {
    if (this.behaviour.type === "BEHAVIOUR"
    ) {
      if (this._isActiveTimeObject()) {
        if (this._isActivePresenceObject()) {
          this.isActive = true;
          return;
        }
      } else if (this._isActiveEndConditionObject()) {
        this.isActive = true;
        return;

      }
    }
    this.isActive = false;
  }


}

