/**
 * @jest-environment node
 */
import {eventBus} from "../src/util/EventBus";

const Behaviour = require('../src/behaviour/behaviour/Behaviour').Behaviour
const BehaviourSupport = require('../src/behaviour/behaviour/BehaviourSupport').BehaviourSupport
const BehaviourUtil = require('../src/behaviour/behaviour/BehaviourUtil')

const SPHERE_LOCATION = {latitude: 51.916064, longitude: 4.472683} // Rotterdam
const PRESENCE_DETECT_TOPIC = "onPresenceDetect"
const EVENT_ENTER_SPHERE = {type: "ENTER", data: {type: "SPHERE", profileIdx: 0}}
const EVENT_ENTER_LOCATION = {type: "ENTER", data: {type: "LOCATION", profileIdx: 0, locationId: 1}}
const EVENT_ENTER_LOCATION_TWO = {type: "ENTER", data: {type: "LOCATION", profileIdx: 0, locationId: 2}}
const EVENT_LEAVE_LOCATION = {type: "LEAVE", data: {type: "LOCATION", profileIdx: 0, locationId: 1}}
const EVENT_LEAVE_LOCATION_TWO = {type: "LEAVE", data: {type: "LOCATION", profileIdx: 0, locationId: 2}}
const EVENT_LEAVE_SPHERE = {type: "LEAVE", data: {type: "SPHERE", profileIdx: 0}}


describe("End Condition testing", () => {
  test('Behaviour should be active when user is still in sphere as End condition, activation time expired.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeFromClock(9, 10).setTimeToClock(16, 10).setDimPercentage(90).setPresenceIgnore().setEndConditionWhilePeopleInSphere();
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    const time = new Date()
    time.setHours(9);
    time.setMinutes(10);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
    behaviour.tick(Date.parse(time.toString()));
    time.setHours(16);
    behaviour.tick(Date.parse(time.toString()));
    return expect(behaviour.isActive).toBeTruthy();

  });

  test('Behaviour should be inactive when user leaves sphere as End condition, activation time expired.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeFromClock(9, 10).setTimeToClock(16, 10).setDimPercentage(90).setPresenceIgnore().setEndConditionWhilePeopleInSphere();
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    const time = new Date()
    time.setHours(9);
    time.setMinutes(10);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
    behaviour.tick(Date.parse(time.toString()));
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_LEAVE_SPHERE);
    time.setHours(16);
    behaviour.tick(Date.parse(time.toString()));
    return expect(behaviour.isActive).toBeFalsy();
  });
});

describe("Location testing", () => {
  test('Behaviour should be active when user is in location.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceSomebodyInLocations([1]);
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_LOCATION);
    behaviour.tick(Date.now());
    return expect(behaviour.isActive).toBeTruthy();
  });
  test('Behaviour should be inactive when user is not in location.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceSomebodyInLocations([1]);
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    behaviour.tick(Date.now());
    return expect(behaviour.isActive).toBeFalsy();
  });
  test('Behaviour should be active when multiple users are in location and one left.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceSomebodyInLocations([1]);
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_LOCATION);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_LOCATION);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_LOCATION_TWO);
    behaviour.tick(Date.now());
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_LEAVE_LOCATION)
    behaviour.tick(Date.now());
    return expect(behaviour.isActive).toBeTruthy();
  });
  test('Behaviour should be active when nobody is in location.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceNobodyInLocations([1]);
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    behaviour.tick(Date.parse(new Date(2020, 9, 5, 10, 10).toString()));
    return expect(behaviour.isActive).toBeTruthy();
  });
});

describe("Sphere testing", () => {
  test('Behaviour should be active when user is in sphere.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceSomebodyInSphere();
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
    behaviour.tick(Date.now());
    return expect(behaviour.isActive).toBeTruthy();
  });
  test('Behaviour should be inactive when user is not in sphere.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceSomebodyInSphere();
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    behaviour.tick(Date.now());
    return expect(behaviour.isActive).toBeFalsy();
  });
  test('Behaviour should be active when multiple users are in sphere and one left.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceSomebodyInSphere();
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
    behaviour.tick(Date.now());
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_LEAVE_SPHERE);
    behaviour.tick(Date.now());
    return expect(behaviour.isActive).toBeTruthy();
  });

  test('Behaviour should be active when nobody is in sphere.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceNobodyInSphere();
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    behaviour.tick(Date.now());
    return expect(behaviour.isActive).toBeTruthy();
  });

  test('Behaviour should be inactive when somebody is in sphere.', () => {
    const behaviourSupport = new BehaviourSupport()
    behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceNobodyInSphere();
    const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
    eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
    behaviour.tick(Date.now());
    return expect(behaviour.isActive).toBeFalsy();
  });
});

describe('Delay testing', () => {
  describe('Somebody', () => {
    test('Behaviour should be active when user just left sphere', () => {
      const behaviourSupport = new BehaviourSupport()
      behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceSomebodyInSphere();
      const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
      const time = new Date()
      time.setHours(0);
      time.setMinutes(10);
      behaviour.tick(Date.parse(time.toString()));
      eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
      time.setMinutes(20);
      behaviour.tick(Date.parse(time.toString()));
      eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_LEAVE_SPHERE);
      time.setMinutes(21);
      behaviour.tick(Date.parse(time.toString()));
      return expect(behaviour.isActive).toBeTruthy();
    });

    test('Behaviour should be inactive when user left location and delay period is exceeded.', () => {
      const behaviourSupport = new BehaviourSupport()
      behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceSomebodyInSphere(); // 5 Minutes delay per default.
      const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
      eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_LOCATION);
      const time = new Date()
      time.setHours(0);
      time.setMinutes(20);
      behaviour.tick(Date.parse(time.toString()));
      eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_LEAVE_LOCATION);
      time.setMinutes(25);
      behaviour.tick(Date.parse(time.toString()));
      return expect(behaviour.isActive).toBeFalsy();
    });
  });

  describe('Nobody', () => {
    test('Behaviour should be inactive when user just left the sphere', () => {
      const behaviourSupport = new BehaviourSupport()
      behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceNobodyInSphere();
      const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
      const time = new Date()
      time.setHours(0);
      time.setMinutes(10);
      behaviour.tick(Date.parse(time.toString()));
      eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
      time.setMinutes(11);
      behaviour.tick(Date.parse(time.toString()));
      eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_LEAVE_SPHERE);
      behaviour.tick(Date.parse(time.toString()));
      return expect(behaviour.isActive).toBeFalsy();
    });

    test('Behaviour should be active when user left the sphere and timeout expired', () => {
      const behaviourSupport = new BehaviourSupport()
      behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceNobodyInSphere();
      const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
      const time = new Date()
      time.setHours(0);
      time.setMinutes(10);
      behaviour.tick(Date.parse(time.toString()));
      eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
      behaviour.tick(Date.parse(time.toString()));
      eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_LEAVE_SPHERE);
      time.setMinutes(15);
      behaviour.tick(Date.parse(time.toString()));
      return expect(behaviour.isActive).toBeTruthy();
    });
  });
});

describe('Time testing', () => {
  describe('All day testing', () => {
    test('Behaviour should be active as it started today', () => {
      const behaviourSupport = new BehaviourSupport()
      behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceIgnore().setActiveDays({
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: true
      });
      const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
      const time = new Date(2020, 9, 4, 10, 0);
      behaviour.tick(Date.parse(time.toString()));
      return expect(behaviour.isActive).toBeTruthy();
    });
    test('Behaviour should be active as it started yesterday', () => {
      const behaviourSupport = new BehaviourSupport()
      behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceIgnore().setActiveDays({
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: true
      });
      const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
      const time = new Date(2020, 9, 5, 3, 59);
      behaviour.tick(Date.parse(time.toString()));
      return expect(behaviour.isActive).toBeTruthy();
    });
    test('Behaviour should be inactive because it is a new day', () => {
      const behaviourSupport = new BehaviourSupport()
      behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceIgnore().setActiveDays({
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: true
      });
      const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
      const time = new Date(2020, 9, 5, 4, 0);
      behaviour.tick(Date.parse(time.toString()));
      return expect(behaviour.isActive).toBeFalsy();
    });

  })

  describe('Range testing', () => {
    describe('Sunset, Sunrise testing', () => {
      test('Behaviour should be active when activation is between sunset -> sunrise.', () => {
        const behaviourSupport = new BehaviourSupport()
        behaviourSupport.setTimeFromSunset().setTimeToSunrise().setDimPercentage(90).ignorePresence().setActiveDays({
          Mon: true,
          Tue: true,
          Wed: true,
          Thu: true,
          Fri: true,
          Sat: true,
          Sun: true
        });
        const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
        const time = new Date(2020, 9, 5, 19, 12);
        behaviour.tick(Date.parse(time.toString()));
        return expect(behaviour.isActive).toBeTruthy();
      });

      test('Behaviour should be active when activation between sunrise +10 offset -> sunset.', () => {
        const behaviourSupport = new BehaviourSupport()
        behaviourSupport.setTimeToSunset().setTimeFromSunrise(10).setDimPercentage(90).ignorePresence().setActiveDays({
          Mon: true,
          Tue: false,
          Wed: false,
          Thu: false,
          Fri: false,
          Sat: false,
          Sun: true
        });
        const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
        const time = new Date(2020, 9, 5, 8, 4);
        behaviour.tick(Date.parse(time.toString()));
        return expect(behaviour.isActive).toBeTruthy();
      });
      test('Behaviour should be active when  time between sunrise -10 offset -> sunset.', () => {
        const behaviourSupport = new BehaviourSupport()
        behaviourSupport.setTimeToSunset().setTimeFromSunrise(-10).setDimPercentage(90).ignorePresence().setActiveDays({
          Mon: true,
          Tue: true,
          Wed: true,
          Thu: true,
          Fri: true,
          Sat: true,
          Sun: false
        });
        const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
        const time = new Date(2020, 9, 5, 7, 44);
        behaviour.tick(Date.parse(time.toString()));
        return expect(behaviour.isActive).toBeTruthy();
      });
      test('Behaviour should be inactive when time is before start time, sunrise  -> sunset.', () => {
        const behaviourSupport = new BehaviourSupport()
        behaviourSupport.setTimeToSunset().setTimeFromSunrise().setDimPercentage(90).ignorePresence().setActiveDays({
          Mon: true,
          Tue: true,
          Wed: true,
          Thu: true,
          Fri: true,
          Sat: true,
          Sun: false
        });
        const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
        const time = new Date(2020, 9, 5, 7, 53);
        behaviour.tick(Date.parse(time.toString()));
        return expect(behaviour.isActive).toBeFalsy();
      });
      test('Behaviour should be inactive when time is after sunset end time, sunrise -> sunset + 10 offset.', () => {
        const behaviourSupport = new BehaviourSupport()
        behaviourSupport.setTimeToSunset(+10).setTimeFromSunrise().setDimPercentage(90).ignorePresence().setActiveDays({
          Mon: true,
          Tue: true,
          Wed: true,
          Thu: true,
          Fri: true,
          Sat: true,
          Sun: true
        });
        const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
        const time = new Date(2020, 9, 5, 19, 22);
        behaviour.tick(Date.parse(time.toString()));
        return expect(behaviour.isActive).toBeFalsy();
      });
    });

    describe('Clock testing',()=>{
      test('Behaviour should be active when activation is between 22:00 -> 23:59, Time 22:00.', () => {
        const behaviourSupport = new BehaviourSupport()
        behaviourSupport.setTimeFromClock(22,0).setTimeToClock(23,59).setDimPercentage(90).ignorePresence();
        const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
        const time = new Date(2020, 9, 5, 22, 0);
        behaviour.tick(Date.parse(time.toString()));
        return expect(behaviour.isActive).toBeTruthy();
      });

      test('Behaviour should be active when activation is between 22:00 -> 6:59, Time 6.58.', () => {
        const behaviourSupport = new BehaviourSupport()
        behaviourSupport.setTimeFromClock(22,0).setTimeToClock(6,59).setDimPercentage(90).ignorePresence().setActiveDays({
          Mon: false,
          Tue: false,
          Wed: false,
          Thu: false,
          Fri: false,
          Sat: false,
          Sun: true
        });;
        const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
        const time = new Date(2020, 9, 5, 6, 58);
        behaviour.tick(Date.parse(time.toString()));
        return expect(behaviour.isActive).toBeTruthy();
      });

      test('Behaviour should be inactive when time is after end time, 22:00 -> 6:59', () => {
        const behaviourSupport = new BehaviourSupport()
        behaviourSupport.setTimeFromClock(22,0).setTimeToClock(6,59).setDimPercentage(90).ignorePresence().setActiveDays({
          Mon: false,
          Tue: false,
          Wed: false,
          Thu: false,
          Fri: false,
          Sat: false,
          Sun: true
        });;
        const behaviour = new Behaviour(behaviourSupport.rule, SPHERE_LOCATION);
        const time = new Date(2020, 9, 5, 6, 59);
        behaviour.tick(Date.parse(time.toString()));
        return expect(behaviour.isActive).toBeFalsy();
      });

    });
  });
});
