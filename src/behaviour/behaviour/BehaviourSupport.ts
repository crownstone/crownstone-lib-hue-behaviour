import {BehaviourUtil} from "./BehaviourUtil";
import {EMPTY_RULE, SPHERE_DELAY} from "../../constants/BehaviourSupportConstants"

export class BehaviourSupport {
  rule: HueBehaviourWrapper;

  constructor(behaviour: HueBehaviourWrapper = EMPTY_RULE) {
    this.rule = {...behaviour}
  }

  //########Setters###########
  setTypeBehaviour(){
    this.rule.type = "BEHAVIOUR"
    this.rule.data.action.type = "BE_ON";
    if(!("presence" in this.rule.data)){
      this.rule.type["Presence"] = {}
      this.setTimeAllDay();
    }
    return this;
  }
  setTypeTwilight(){
    this.rule.type= "BEHAVIOUR";
    this.rule.data.action.type = "DIM_WHEN_TURNED_ON";
    delete this.rule.data["presence"];
    delete this.rule.data["endCondition"];
    return this;
  }
  setCloudId(value:string){
    this.rule.cloudId = value;
    return this;
  }
  setLightId(value:string){
    this.rule.lightId = value;
    return this;
  }
  setActionState(value: number) {
    this.rule.data.action.data = value;
    return this;
  }

  setDimPercentage(value: number) {
    this.rule.data.action.data = value;
    return this;
  }

  setTimeAllDay() {
    this.rule.data.time = {type: "ALL_DAY"};
    return this;
  }

  setTimeWhenDark() {
    this.rule.data.time = {
      type: "RANGE",
      from: {type: "SUNSET", offsetMinutes: 0},
      to: {type: "SUNRISE", offsetMinutes: 0}
    };
    return this;
  }

  setTimeWhenSunUp() {
    this.rule.data.time = {
      type: "RANGE",
      from: {type: "SUNRISE", offsetMinutes: 0},
      to: {type: "SUNSET", offsetMinutes: 0}
    };
    return this;
  }

  setTimeFromSunrise(offsetMinutes: number = 0) {
    // if the time was ALL_DAY, set it to an acceptable range, given the name of this method.
    if (this.rule.data.time.type === "ALL_DAY") {
      this.setTimeWhenSunUp();
    }

    if (this.rule.data.time.type === "RANGE") {
      this.rule.data.time.from = {type: "SUNRISE", offsetMinutes: offsetMinutes};
    }
    return this;
  }

  setTimeFromSunset(offsetMinutes: number = 0) {
    // if the time was ALL_DAY, set it to an acceptable range, given the name of this method.
    if (this.rule.data.time.type === "ALL_DAY") {
      this.setTimeWhenDark();
    }

    if (this.rule.data.time.type === "RANGE") {
      this.rule.data.time.from = {type: "SUNSET", offsetMinutes: offsetMinutes};
    }
    return this;
  }

  setTimeToSunrise(offsetMinutes: number = 0) {
    // if the time was ALL_DAY, set it to an acceptable range, given the name of this method.
    if (this.rule.data.time.type === "ALL_DAY") {
      this.setTimeWhenDark();
    }

    if (this.rule.data.time.type === "RANGE") {
      this.rule.data.time.to = {type: "SUNRISE", offsetMinutes: offsetMinutes};
    }
    return this;
  }

  setTimeToSunset(offsetMinutes: number = 0) {
    // if the time was ALL_DAY, set it to an acceptable range, given the name of this method.
    if (this.rule.data.time.type === "ALL_DAY") {
      this.setTimeWhenSunUp();
    }

    if (this.rule.data.time.type === "RANGE") {
      this.rule.data.time.to = {type: "SUNSET", offsetMinutes: offsetMinutes};
    }
    return this;
  }

  setTimeFromClock(hours: number, minutes: number) {
    // if the time was ALL_DAY, set it to an acceptable range, given the name of this method.
    if (this.rule.data.time.type === "ALL_DAY") {
      if (hours < 14) {
        this.setTimeWhenSunUp();
      } else {
        this.setTimeWhenDark();
      }
    }

    if (this.rule.data.time.type === "RANGE") {
      this.rule.data.time.from = {type: "CLOCK", data: {hours: hours, minutes: minutes}};
    }
    return this;
  }

  setTimeToClock(hours: number, minutes: number) {
    // if the time was ALL_DAY, set it to an acceptable range, given the name of this method.
    if (this.rule.data.time.type === "ALL_DAY") {
      if (hours > 20) {
        this.setTimeFromClock(18, 0);
      } else if (hours > 8) {
        this.setTimeFromClock(8, 0);
      } else {
        this.setTimeFromClock(0, 0);
      }
    }

    if (this.rule.data.time.type === "RANGE") {
      this.rule.data.time.to = {type: "CLOCK", data: {hours: hours, minutes: minutes}};
    }
    return this;
  }

  setTime(time: Time) {
    this.rule.data.time = time;
    return this;
  }

  insertTimeDataFrom(timeData: TimeData) {
    if (this.rule.data.time.type === "ALL_DAY") {
      this.setTimeWhenDark();
    }

    if (this.rule.data.time.type === "RANGE") {
      this.rule.data.time.from = timeData;
    }
  }

  insertTimeDataTo(timeData: TimeData) {
    if (this.rule.data.time.type === "ALL_DAY") {
      this.setTimeWhenDark();
    }

    if (this.rule.data.time.type === "RANGE") {
      this.rule.data.time.to = timeData;
    }
  }

  ignorePresence(): BehaviourSupport {

    if(this.rule.type === "BEHAVIOUR") {
      this.rule.data.presence = {type: "IGNORE"};
    }
    return this;
  }

  setPresenceIgnore(): BehaviourSupport {
    return this.ignorePresence();
  }

  setPresenceSomebody(): BehaviourSupport {

    if(this.rule.type === "BEHAVIOUR"){
    if (this.rule.data.presence.type === "IGNORE") {
      this.setPresenceSomebodyInSphere()
    }

      this.rule.data.presence.type = "SOMEBODY";
    }
    return this;
  }

  setPresenceNobody(): BehaviourSupport {
    if (this.rule.type === "BEHAVIOUR" && this.rule.data.presence.type === "IGNORE") {
      this.setPresenceNobodyInSphere()
    }
    if (this.rule.type === "BEHAVIOUR") {
      this.rule.data.presence.type = "NOBODY";
    }
    return this;
  }

  setPresenceSomebodyInSphere(): BehaviourSupport {

    if (this.rule.type === "BEHAVIOUR") {
      this.rule.data.presence = {type: "SOMEBODY", data: {type: "SPHERE"}, delay: SPHERE_DELAY};
    }
    return this;
  }
  setPresenceDelay(delay:number){
    if (this.rule.type === "BEHAVIOUR" && this.rule.data.presence.type !== "IGNORE") {
      this.rule.data.presence.delay = delay;
    }
    return this;
  }

  setPresenceNobodyInSphere(): BehaviourSupport {

    if (this.rule.type === "BEHAVIOUR") {
      this.rule.data.presence = {type: "NOBODY", data: {type: "SPHERE"}, delay: SPHERE_DELAY};
    }
    return this;
  }

  setPresenceInSphere(): BehaviourSupport {

    if (this.rule.type === "BEHAVIOUR") {
      if (this.rule.data.presence.type === "IGNORE") {
        this.setPresenceSomebodyInSphere()
      } else {
        this.rule.data.presence.data.type = "SPHERE";
      }
    }
    return this;
  }

  setPresenceInLocations(locationIds: number[]) {

    if (this.rule.type === "BEHAVIOUR") {
      if (this.rule.data.presence.type === "IGNORE") {
        this.setPresenceSomebodyInLocations(locationIds);
      } else {
        this.rule.data.presence.data = {type: "LOCATION", locationIds: locationIds}
      }
    }
    return this;
  }

  setPresenceSomebodyInLocations(locationIds: number[]): BehaviourSupport {

    if (this.rule.type === "BEHAVIOUR") {
      this.rule.data.presence = {
        type: "SOMEBODY",
        data: {type: "LOCATION", locationIds: locationIds},
        delay: SPHERE_DELAY
      };
    }
    return this;
  }

  setPresenceNobodyInLocations(locationIds: number[]): BehaviourSupport {

    if(this.rule.type === "BEHAVIOUR") {
      this.rule.data.presence = {
        type: "NOBODY",
        data: {type: "LOCATION", locationIds: locationIds},
        delay: SPHERE_DELAY
      };
    }
    return this;
  }

  setNoEndCondition(): BehaviourSupport {

    if (this.rule.type === "BEHAVIOUR") {
      delete this.rule.data.endCondition;
    }
    return this;
  }

  setEndConditionWhilePeopleInSphere(): BehaviourSupport {

    if (this.rule.type === "BEHAVIOUR") {
      this.rule.data.endCondition = {
        type: "PRESENCE_AFTER",
        presence: {type: "SOMEBODY", data: {type: "SPHERE"}, delay: SPHERE_DELAY}
      };
    }
    return this;
  }

  setEndConditionWhilePeopleInLocation(locationId: number): BehaviourSupport {

    if (this.rule.type === "BEHAVIOUR") {
      this.rule.data.endCondition = {
        type: "PRESENCE_AFTER",
        presence: {type: "SOMEBODY", data: {type: "LOCATION", locationIds: [locationId]}, delay: SPHERE_DELAY}
      };
    }
    return this;
  }

  setActiveDays(activeDays: ActiveDays) {
    this.rule.activeDays = activeDays;
    return this;
  }

  //########Getters###########

  getLocationIds(): number[] {
    if (this.rule.type === "BEHAVIOUR" && this.rule.data.presence.type !== "IGNORE") {
      if (this.rule.data.presence.data.type === "LOCATION") {
        return this.rule.data.presence.data.locationIds;
      }
    }
    return [];
  }

  isUsingPresence(): boolean {
    if (this.rule.type === "BEHAVIOUR") {
      return this.rule.data.presence.type !== "IGNORE";
    } else {
      return false;
    }
  }

  isUsingSingleRoomPresence(): boolean {
    if (this.rule.type === "BEHAVIOUR" && this.rule.data.presence.type !== "IGNORE") {
      if (this.rule.data.presence.data.type === "LOCATION") {
        return this.rule.data.presence.data.locationIds.length === 1;
      }
    }
    return false;
  }

  isUsingMultiRoomPresence(): boolean {
    if (this.rule.type === "BEHAVIOUR" && this.rule.data.presence.type !== "IGNORE") {
      if (this.rule.data.presence.data.type === "LOCATION") {
        return this.rule.data.presence.data.locationIds.length > 1;
      }
    }
    return false;
  }

  isUsingSpherePresence(): boolean {
    if (this.rule.type === "BEHAVIOUR" && this.rule.data.presence.type !== "IGNORE") {
      return this.rule.data.presence.data.type === "SPHERE";
    }
    return false;
  }

  hasLocationEndCondition(): boolean {
    if (this.rule.type === "BEHAVIOUR" && this.rule.data.endCondition && this.rule.data.endCondition.presence && this.rule.data.endCondition.presence.data.type) {
      return this.rule.data.endCondition.presence.data.type === "LOCATION"
    }
    return false;
  }

  hasEndCondition(): boolean {
    if (this.rule.type === "BEHAVIOUR" && this.rule.data.endCondition && this.rule.data.endCondition.presence && this.rule.data.endCondition.presence.data.type) {
      return this.rule.data.endCondition.presence.data.type === "LOCATION" || this.rule.data.endCondition.presence.data.type === "SPHERE"
    }
    return false;
  }


  /**
   * Retrieves the SwitchBehaviour's (de)activation time in minutes.

   * @Param operator -  Either from or to
   *
   * @Returns
   *
   */
  getSwitchingTime(operator: "from" | "to", timestamp: number, sphereLocation: SphereLocation): number {
    switch (this.rule.data.time[operator].type) {
      case "SUNRISE":
        return BehaviourUtil.getSunriseTimeInMinutes(timestamp, sphereLocation) + this.rule.data.time[operator].offsetMinutes;
      case "SUNSET":
        return BehaviourUtil.getSunsetTimeInMinutes(timestamp, sphereLocation) + this.rule.data.time[operator].offsetMinutes;
      case "CLOCK":
        return this.rule.data.time[operator].data.minutes + (this.rule.data.time[operator].data.hours * 60);
      default:
        return -1;
    }
  }

  isActiveRangeObject(timestamp: number, sphereLocation: SphereLocation): boolean {
    const currentTimeInMinutes = new Date(timestamp).getMinutes() + (new Date(timestamp).getHours() * 60);
    const fromTimeInMinutes = this.getSwitchingTime("from", timestamp, sphereLocation);
    const toTimeInMinutes = this.getSwitchingTime("to", timestamp, sphereLocation);

    if (fromTimeInMinutes === -1 || toTimeInMinutes === -1) {
      return false;
    }

    //Checks if SwitchBehaviour is activated yesterday and is still active.
    if (((toTimeInMinutes - fromTimeInMinutes) < 0) && (currentTimeInMinutes < toTimeInMinutes)) {
      return this.rule.activeDays[BehaviourUtil.getWeekday(timestamp, -1)];
    }

    //Checks if behaviour should be activated today
    if (currentTimeInMinutes >= fromTimeInMinutes) {
      //Checks if behaviour is still active with ending day today)
      if (currentTimeInMinutes < toTimeInMinutes) {
        return this.rule.activeDays[BehaviourUtil.getWeekday(timestamp)];
      }
      // If above failed, check if ending day is the next day.
      if (toTimeInMinutes < fromTimeInMinutes) {
        return this.rule.activeDays[BehaviourUtil.getWeekday(timestamp)];
      }
    }
    return false;

  }

  isActiveTimeObject(timestamp: number, sphereLocation: SphereLocation): boolean {
    if (this.rule.data.time.type === "ALL_DAY") {
      return this.isActiveTimeAllDay(timestamp);
    }
    if (this.rule.data.time.type === "RANGE") {
      return this.isActiveRangeObject(timestamp, sphereLocation);
    }
    return false;
  }

  isActiveTimeAllDay(timestamp: number): boolean {
    const currentTimeInMinutes = new Date(timestamp).getMinutes() + (new Date(timestamp).getHours() * 60);

    //Checks if current time is between  00:00 > 03:59.
    if (currentTimeInMinutes < 4 * 60) {
      //Checks if yesterday should be active.
      return this.rule.activeDays[BehaviourUtil.getWeekday(timestamp, -1)]
    } else {//Else means 04:00 -> 23:59.
      //Is Today active. Thus 04:00 -> 23:59
      return this.rule.activeDays[BehaviourUtil.getWeekday(timestamp)]
    }
  }

  isActivePresenceObject(presenceLocations, msSincePresenceUpdate): boolean {
    if (this.rule.type === "BEHAVIOUR") {
      switch (this.rule.data.presence.type) {
        case "IGNORE":
          return true;
        case "NOBODY":
          return (!BehaviourUtil.isSomeonePresent(presenceLocations) && msSincePresenceUpdate >= this.rule.data.presence.delay * 1000);
        case "SOMEBODY":
          return (BehaviourUtil.isSomeonePresent(presenceLocations)) ? true : (msSincePresenceUpdate < this.rule.data.presence.delay * 1000);
        default:
          return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Presence check
   *
   * @returns Boolean - True if Someone is present, False if No one is present.
   */
  isSomeonePresent(presenceLocations): boolean {
    return (presenceLocations.length > 0);
  }

  getDelay(): number {
    return ("presence" in this.rule.data && "delay" in this.rule.data.presence) ? this.rule.data.presence.delay : -1;
  }

  willDim(): boolean {
    return this.rule.data.action.data < 100;
  }

  getDimPercentage(): number {
    return this.rule.data.action.data;
  }

  getTime(): Time {
    return this.rule.data.time;
  }

  getToHour(): number {
    if (this.rule.data.time.type === "RANGE" && this.rule.data.time.to.type === "CLOCK") {
      return this.rule.data.time.to.data.hours;
    }
    return null;
  }

  getToMinutes(): number {
    if (this.rule.data.time.type === "RANGE" && this.rule.data.time.to.type === "CLOCK") {
      return this.rule.data.time.to.data.minutes;
    }
    return null;
  }

  getFromHour(): number {
    if (this.rule.data.time.type === "RANGE" && this.rule.data.time.from.type === "CLOCK") {
      return this.rule.data.time.from.data.hours;
    }
    return null;
  }

  getFromMinutes(): number {
    if (this.rule.data.time.type === "RANGE" && this.rule.data.time.from.type === "CLOCK") {
      return this.rule.data.time.from.data.minutes;
    }
    return null;
  }

  isActiveAllDay(): boolean {
    return this.rule.data.time.type === "ALL_DAY";
  }

  isUsingClockTime(): boolean {
    return this.isUsingClockStartTime() || this.isUsingClockEndTime();
  }

  isUsingClockStartTime(): boolean {
    return this.rule.data.time.type === "RANGE" && this.rule.data.time.from.type === "CLOCK";
  }

  isUsingClockEndTime(): boolean {
    return this.rule.data.time.type === "RANGE" && this.rule.data.time.to.type === "CLOCK";
  }

  isUsingSunsetAsEndTime(): boolean {
    return this.rule.data.time.type === "RANGE" && this.rule.data.time.to.type === "SUNSET";
  }

}
