/**
 * @jest-environment node
 */
import {eventBus} from "../src/util/EventBus";

const Behaviour = require('../src/behaviour/behaviour/Behaviour').Behaviour
const BehaviourSupport = require('../src/behaviour/behaviour/BehaviourSupport').BehaviourSupport
const BehaviourUtil = require('../src/behaviour/behaviour/BehaviourUtil')
const sphereLocation = {
  latitude: 51.916064, longitude: 4.472683
}
const PRESENCE_DETECT_TOPIC = "onPresenceDetect"
const EVENT_ENTER_SPHERE = {type: "ENTER", data: {type: "SPHERE", profileIdx: 0}}
const EVENT_ENTER_LOCATION = {type: "ENTER", data: {type: "LOCATION", profileIdx: 0, locationId: 1}}
const EVENT_LEAVE_LOCATION = {type: "LEAVE", data: {type: "LOCATION", profileIdx: 0, locationId: 1}}
const EVENT_LEAVE_SPHERE = {type: "LEAVE", data: {type: "SPHERE", profileIdx: 0}}

test('Behaviour should be active when user is in sphere and activation is all day.', () => {
  const behaviourSupport = new BehaviourSupport()
  behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceInSphere();
  const behaviour = new Behaviour(behaviourSupport.rule, sphereLocation);
  const timestamp = Date.now()
  eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
  behaviour.tick(timestamp);

  return expect(behaviour.isActive).toBeTruthy();
});


test('Behaviour should be active when user is in location and activation between sunset -> sunrise.', () => {
  const behaviourSupport = new BehaviourSupport()
  behaviourSupport.setTimeFromSunset().setTimeToSunrise().setDimPercentage(90).setPresenceSomebodyInLocations([1]);
  const behaviour = new Behaviour(behaviourSupport.rule, sphereLocation);
  const time = new Date()
  time.setHours(0);
  time.setMinutes(10);
  eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_LOCATION);
  behaviour.tick(Date.parse(time.toString()));
  return expect(behaviour.isActive).toBeTruthy();
});


test('Behaviour should be active when multiple users are in the sphere, after someone left.', () => {
  const behaviourSupport = new BehaviourSupport()
  behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceInSphere();
  const behaviour = new Behaviour(behaviourSupport.rule, sphereLocation);
  const timestamp = Date.now()
  eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
  eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_ENTER_SPHERE);
  behaviour.tick(timestamp);
  eventBus.emit(PRESENCE_DETECT_TOPIC, EVENT_LEAVE_SPHERE);

  return expect(behaviour.isActive).toBeTruthy();
});

test('Behaviour should be inactive when user is not in sphere and activation is all day.', () => {
  const behaviourSupport = new BehaviourSupport()
  behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceInSphere();
  const behaviour = new Behaviour(behaviourSupport.rule, sphereLocation);
  const timestamp = Date.now()
  behaviour.tick(timestamp);

  return expect(behaviour.isActive).toBeFalsy();
});

test('Behaviour should be active when user is still in sphere as End condition, activation time expired.', () => {
  const behaviourSupport = new BehaviourSupport()
  behaviourSupport.setTimeFromClock(9, 10).setTimeToClock(16, 10).setDimPercentage(90).setPresenceIgnore().setEndConditionWhilePeopleInSphere();
  const behaviour = new Behaviour(behaviourSupport.rule, sphereLocation);
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
  const behaviour = new Behaviour(behaviourSupport.rule, sphereLocation);
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