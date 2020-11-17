import {hueStateVariables} from "../../constants/HueConstants";

const SunCalc = require('suncalc');

const WEEKDAY_MAP = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"}

export const BehaviourUtil = {

  getWeekday (timestamp, offsetDay: number = 0): string {
    const dayNumber = ((((new Date(timestamp).getDay()) + offsetDay) % 7) + 7) % 7 // ((n % m) + m) % m - Fix for negative numbers
    return WEEKDAY_MAP[dayNumber];
  },

  isSomeonePresent(presenceLocations:PresenceProfile[]): boolean {
    return (presenceLocations.length > 0);
  },

  mapBehaviourActionToHue(value: number):number {
    return value * 2.54
  },

  /** Maps State A to State B
   *
   * @param stateA
   * @param stateB
   *
   * Returns stateB with stateB objects.
   */
  mapStateObjectToTheOther(stateA:HueLightState, stateB:HueLightState):HueLightState {
    for (const key of Object.keys(stateA)) {
      if ((hueStateVariables[key])) {
        stateB[key] = stateA[key];
      }
    }
    return {...stateB};
  },


  /** returns the sunset time in minutes, given the timestamp and sphereLocation
   * @param sphereLocation
   * @param timestamp
   */
  getSunsetTimeInMinutes: function (timestamp: number, sphereLocation: SphereLocation): number {
    const sunTimes = SunCalc.getTimes(new Date(timestamp), sphereLocation.latitude, sphereLocation.longitude);
    return (sunTimes.sunset.getHours() * 60) + sunTimes.sunset.getMinutes();
  },
  /** returns the end of the sunrise time in minutes, given the timestamp and sphereLocation
   * @param sphereLocation
   * @param timestamp
   */
  getSunriseTimeInMinutes: function (timestamp: number, sphereLocation: SphereLocation): number {
    const sunTimes = SunCalc.getTimes(new Date(timestamp), sphereLocation.latitude, sphereLocation.longitude);
    return (sunTimes.sunriseEnd.getHours() * 60) + sunTimes.sunriseEnd.getMinutes();
  }

}