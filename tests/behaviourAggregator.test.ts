/**
 * @jest-environment node
 */
import {eventBus} from "../src/util/EventBus";
import {ON_PRESENCE_CHANGE} from "../src/constants/EventConstants";

import {
  switchOnAllDayIgnorePresence,
  switchOnBetweenRangeWithSpherePresence,
  switchOnWhenAny1Home, twilight40BetweenSunriseSunset, twilightDim50AllDay
} from "./mockBehaviours";

const Behaviour = require('../src/behaviour/behaviour/Behaviour').Behaviour
const BehaviourAggregator = require('../src/behaviour/BehaviourAggregator').BehaviourAggregator
const BehaviourSupport = require('../src/behaviour/behaviour/BehaviourSupport').BehaviourSupport
const BehaviourUtil = require('../src/behaviour/behaviour/BehaviourUtil')

class Light {
  constructor() {
  }
}

const fakeLight = new Light();

const SPHERE_LOCATION = {latitude: 51.916064, longitude: 4.472683} // Rotterdam
const EVENT_ENTER_SPHERE = {type: "ENTER", data: {type: "SPHERE", profileIdx: 0}}

describe("Overlapping checks", () => {
  describe("Behaviour only", () => {
    test("Single behaviour all day", () => {
      const behaviourAggregator = new BehaviourAggregator(fakeLight);
      const behaviourSupport = new BehaviourSupport()
      behaviourSupport.setTimeAllDay().setDimPercentage(90).setPresenceIgnore()
      behaviourSupport.rule.cloudId = "T3STB3H3V10_r";
      behaviourAggregator.addBehaviour(behaviourSupport.rule, SPHERE_LOCATION);
      const time = new Date(2020, 9, 4, 10, 0);
      behaviourAggregator.timestamp  = Date.parse(time.toString());
      behaviourAggregator._sendTickToBehaviours();
      behaviourAggregator._checkBehaviours();
      console.log(behaviourAggregator.prioritizedBehaviour.behaviour.cloudId);
      return expect(behaviourAggregator.prioritizedBehaviour.behaviour.cloudId.toString()).toBe(behaviourSupport.rule.cloudId.toString());
    });
    test("Multiple behaviours | time vs all day", () => {
      const behaviourAggregator = new BehaviourAggregator(fakeLight);
      const behaviourSupportA = new BehaviourSupport(switchOnWhenAny1Home)
      const behaviourSupportB = new BehaviourSupport(switchOnAllDayIgnorePresence)
      const behaviourSupportC = new BehaviourSupport(switchOnBetweenRangeWithSpherePresence)  //Should be active.
      behaviourAggregator.addBehaviour(behaviourSupportA.rule, SPHERE_LOCATION);
      behaviourAggregator.addBehaviour(behaviourSupportB.rule, SPHERE_LOCATION);
      behaviourAggregator.addBehaviour(behaviourSupportC.rule, SPHERE_LOCATION);
      const time = new Date(2020, 9, 4, 13, 0);
      behaviourAggregator.timestamp =  Date.parse(time.toString());
      behaviourAggregator._sendTickToBehaviours();
      eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
      behaviourAggregator._sendTickToBehaviours();
      behaviourAggregator._checkBehaviours();

      return expect(behaviourAggregator.prioritizedBehaviour.behaviour.cloudId === behaviourSupportC.rule.cloudId).toBeTruthy();
    })
  });
  describe("Twilight only", () => {
    test("Single twilight", () => {
      const behaviourAggregator = new BehaviourAggregator(fakeLight);
      const behaviourSupport = new BehaviourSupport(twilight40BetweenSunriseSunset)
      behaviourAggregator.addBehaviour(behaviourSupport.rule, SPHERE_LOCATION);
      const time = new Date(2020, 9, 4, 14, 0);
      behaviourAggregator.timestamp  = Date.parse(time.toString());
      behaviourAggregator._sendTickToBehaviours();
      behaviourAggregator._checkBehaviours();
      console.log(behaviourAggregator.prioritizedBehaviour.behaviour.cloudId);
      return expect(behaviourAggregator.prioritizedBehaviour.behaviour.cloudId.toString()).toBe(behaviourSupport.rule.cloudId.toString());
    });
    test("Multiple twilights | time vs all day", () => {
      const behaviourAggregator = new BehaviourAggregator(fakeLight);
      const behaviourSupportA = new BehaviourSupport(twilightDim50AllDay)
      const behaviourSupportB = new BehaviourSupport(twilight40BetweenSunriseSunset)  //Should be active.
      behaviourAggregator.addBehaviour(behaviourSupportA.rule, SPHERE_LOCATION);
      behaviourAggregator.addBehaviour(behaviourSupportB.rule, SPHERE_LOCATION);
      const time = new Date(2020, 9, 4, 13, 0);
      behaviourAggregator.timestamp =  Date.parse(time.toString());
      behaviourAggregator._sendTickToBehaviours();
      eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
      behaviourAggregator._sendTickToBehaviours();
      behaviourAggregator._checkBehaviours();

      return expect(behaviourAggregator.prioritizedBehaviour.behaviour.cloudId === behaviourSupportB.rule.cloudId).toBeTruthy();
    })
  });
  describe("Combination of Twilights and Behaviours", () => {
    test("Multiple behaviours & Twilights | time vs all day", () => {
      const behaviourAggregator = new BehaviourAggregator(fakeLight);
      const behaviourSupportA = new BehaviourSupport(switchOnWhenAny1Home)
      const behaviourSupportB = new BehaviourSupport(switchOnAllDayIgnorePresence)
      const behaviourSupportC = new BehaviourSupport(switchOnBetweenRangeWithSpherePresence)
      const behaviourSupportD = new BehaviourSupport(twilightDim50AllDay)
      const behaviourSupportE = new BehaviourSupport(twilight40BetweenSunriseSunset)
      behaviourAggregator.addBehaviour(behaviourSupportA.rule, SPHERE_LOCATION);
      behaviourAggregator.addBehaviour(behaviourSupportB.rule, SPHERE_LOCATION);
      behaviourAggregator.addBehaviour(behaviourSupportC.rule, SPHERE_LOCATION);
      behaviourAggregator.addBehaviour(behaviourSupportD.rule, SPHERE_LOCATION);
      behaviourAggregator.addBehaviour(behaviourSupportE.rule, SPHERE_LOCATION);
      const time = new Date(2020, 9, 4, 13, 0);
      behaviourAggregator.timestamp =  Date.parse(time.toString());
      behaviourAggregator._sendTickToBehaviours();
      eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
      behaviourAggregator._sendTickToBehaviours();
      behaviourAggregator._checkBehaviours();

      return expect(behaviourAggregator.prioritizedBehaviour.behaviour.cloudId === behaviourSupportE.rule.cloudId).toBeTruthy();
    })
  });
})