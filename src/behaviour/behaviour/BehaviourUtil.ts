//TODO: stop hier alle functies in die niet perse in je behaviour class hoeven staan zodat deze makkelijker te lezen is
import {SunCalc} from "SunCalc";

// TODO: globals in all caps maakt het duidelijk dat ze niet een locale variabele zijn
const WEEKDAY_MAP = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"}

export const BehaviourUtil = {

  getWeekday: function(timestamp, offsetDay: number = 0): string {
    const dayNumber = ((((new Date(timestamp).getDay()) + offsetDay) % 7) + 7) % 7 // ((n % m) + m) % m - Fix for negative numbers
    return WEEKDAY_MAP[dayNumber];
  },

  isSomeonePresent(presenceLocations): boolean {
    return (this.presenceLocations.length > 0);
  },

  mapBehaviourActionToHue: function(value: number) {
    return value * 2.54
  },

  /** returns the sunset time in minutes, given the timestamp and sphereLocation
   * @param sphereLocation
   * @param timestamp
   */
  getSunsetTimeInMinutes: function(timestamp : number, sphereLocation : SphereLocation): Number {
    const sunTimes = SunCalc.getTimes(new Date(timestamp), sphereLocation.latitude,sphereLocation.longitude);
    return (sunTimes.sunset.getHours() * 60) + sunTimes.sunset.getMinutes();
  },
  /** returns the end of the sunrise time in minutes, given the timestamp and sphereLocation
   * @param sphereLocation
   * @param timestamp
   */
  getSunriseTimeInMinutes: function(timestamp : number, sphereLocation : SphereLocation): Number {
    const sunTimes = SunCalc.getTimes(new Date(timestamp),sphereLocation.latitude,sphereLocation.longitude);
    return (sunTimes.sunriseEnd.getHours() * 60) + sunTimes.sunriseEnd.getMinutes() ;
  }

}