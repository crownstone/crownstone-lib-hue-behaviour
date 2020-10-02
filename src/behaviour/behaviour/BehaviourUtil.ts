//TODO: stop hier alle functies in die niet perse in je behaviour class hoeven staan zodat deze makkelijker te lezen is
import {SunCalc} from "SunCalc";

// TODO: globals in all caps maakt het duidelijk dat ze niet een locale variabele zijn
const WEEKDAY_MAP = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"}

export const BehaviourUtil = {

  // voorbeeld, er kunnen er meer volgen.
  getWeekday: function(timestamp, offsetDay: number = 0): string {
    const dayNumber = ((new Date(timestamp).getDay()) + offsetDay) % 7 // TODO: modulo is niet nodig, dit geeft per definitie 0-6 terug
    return WEEKDAY_MAP[dayNumber];
  },

  mapBehaviourActionToHue: function(value: number) {
    return value * 2.54
  },


  /**
   * TODO:
   * Wij gebruiken de volgende tijden:
   * let sunriseTime = times.sunriseEnd
   let sunsetTime  = times.sunset
   * @param tick
   */
  getSunsetTimeInMinutes: function(timestamp : number, sphereLocation : SphereLocation): Number {
    const sunTimes = SunCalc.getTimes(new Date(timestamp), sphereLocation.latitude,sphereLocation.longitude);
    return (sunTimes.sunset.getHours() * 60) + sunTimes.sunset.getMinutes();
  },

  getSunriseTimeInMinutes: function(timestamp : number, sphereLocation : SphereLocation): Number {
    const sunTimes = SunCalc.getTimes(new Date(timestamp),sphereLocation.latitude,sphereLocation.longitude);
    return (sunTimes.sunrise.getHours() * 60) + sunTimes.sunrise.getMinutes() ;
  }

}