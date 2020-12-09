/**
 * @jest-environment node
 */
import {
  colorOn10AllDay,
  switchOn10AllDay,
  switchOn50Range23500500,
  twilight40BetweenSunriseSunset,
  twilight80BetweenSunriseSunset,
  twilightDim50AllDay
} from "./constants/mockBehaviours";


import {mockApi} from "./helpers/Api";
import {mockLight, mockWrapper} from "./helpers/Light";
import {SPHERE_LOCATION} from "./constants/testConstants";
import {eventBus} from "../src/util/EventBus";
import {ON_DUMB_HOUSE_MODE_SWITCH} from "../src/constants/EventConstants";
import exp = require("constants");
import {BehaviourAggregator} from "../src/behaviour/BehaviourAggregator";


describe("Function checks", () => {
  test("Add behaviours", () => {
    const light = new mockLight("5f4e47660bc0da0004b4fe16", 0, {on: true, bri: 100})
    const wrapper = new mockWrapper(light)
    const behaviourAggregator = new BehaviourAggregator(wrapper.setState.bind(wrapper), wrapper.getState());
    behaviourAggregator.setBehaviour(<BehaviourWrapperTwilight>twilightDim50AllDay, SPHERE_LOCATION);
    behaviourAggregator.setBehaviour(<BehaviourWrapperBehaviour>switchOn10AllDay, SPHERE_LOCATION);
    expect(behaviourAggregator.twilightPrioritizer.behaviours[0].behaviour.cloudId).toBe(twilightDim50AllDay.cloudId);
    return expect(behaviourAggregator.switchBehaviourPrioritizer.behaviours[0].behaviour.cloudId).toBe(switchOn10AllDay.cloudId);
  })

  test("Remove behaviour", () => {
    const light = new mockLight("5f4e47660bc0da0004b4fe16", 0, {on: true, bri: 100})
    const wrapper = new mockWrapper(light)
    const behaviourAggregator = new BehaviourAggregator(wrapper.setState.bind(wrapper), wrapper.getState());
    behaviourAggregator.setBehaviour(<BehaviourWrapperTwilight>twilightDim50AllDay, SPHERE_LOCATION)
    behaviourAggregator.removeBehaviour("CLOUD-ID-123123");
    return expect(behaviourAggregator.twilightPrioritizer.behaviours.length).toBe(0);
  })

  test("Update twilight", () => {
    const light = new mockLight("5f4e47660bc0da0004b4fe16", 0, {on: true, bri: 100})
    const wrapper = new mockWrapper(light)
    const behaviourAggregator = new BehaviourAggregator(wrapper.setState.bind(wrapper), wrapper.getState());
    behaviourAggregator.setBehaviour(<BehaviourWrapperTwilight>twilightDim50AllDay, SPHERE_LOCATION)
    let updatedBehaviour = <BehaviourWrapperTwilight>{...twilightDim50AllDay};
    updatedBehaviour.data.action.data = 100;
    behaviourAggregator.setBehaviour(updatedBehaviour, SPHERE_LOCATION);
    expect(behaviourAggregator.twilightPrioritizer.behaviours.length).toBe(1);
    return expect(behaviourAggregator.twilightPrioritizer.behaviours[0].behaviour.data.action.data).toBe(100);
  })

  test("Dumb house mode", () => {
    const light = new mockLight("5f4e47660bc0da0004b4fe16", 0, {on: false, bri: 100})
    const wrapper = new mockWrapper(light)
    const behaviourAggregator = new BehaviourAggregator(wrapper.setState.bind(wrapper), wrapper.getState());
    behaviourAggregator.setBehaviour(<BehaviourWrapperBehaviour>switchOn50Range23500500, SPHERE_LOCATION)
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    behaviourAggregator._loop();
    eventBus.emit(ON_DUMB_HOUSE_MODE_SWITCH, true);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 23, 55).toString()));
    behaviourAggregator._loop();

    expect(behaviourAggregator.dumbHouseModeActive).toBeTruthy();
    return expect(light.state.on).toBeFalsy();

  })

  test('Loop', () => {
    jest.useFakeTimers();
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    const light = new mockLight("5f4e47660bc0da0004b4fe16", 0, {on: true, bri: 100})
    const wrapper = new mockWrapper(light)
    const behaviourAggregator = new BehaviourAggregator(wrapper.setState.bind(wrapper), wrapper.getState());
    behaviourAggregator.setBehaviour(<BehaviourWrapperBehaviour>switchOn10AllDay, SPHERE_LOCATION)
    behaviourAggregator.init();
    jest.advanceTimersByTime(500);
    expect(setInterval).toBeCalledTimes(1);

    return expect(behaviourAggregator.switchBehaviourPrioritizer.prioritizedBehaviour).toBeDefined();
  })

  test('Light should stay off', () => {
    jest.useFakeTimers();
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    const light = new mockLight("5f4e47660bc0da0004b4fe16", 0, {on: true, bri: 100})
    const wrapper = new mockWrapper(light)
    const behaviourAggregator = new BehaviourAggregator(wrapper.setState.bind(wrapper), wrapper.getState());
    behaviourAggregator.setBehaviour(<BehaviourWrapperBehaviour>switchOn10AllDay, SPHERE_LOCATION)
    behaviourAggregator._loop();
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 1).toString()));
    expect(light.state.bri).toBe(10 * 2.54);
    behaviourAggregator._loop();
    light.apiState.on = false;
    light.renewState();
    behaviourAggregator._loop();

    return expect(light.state.on).toBeFalsy()
  })

  test("Add wrong supported behaviour", () => {
    const light = new mockLight("5f4e47660bc0da0004b4fe16", 0, {on: true, bri: 100})
    const wrapper = new mockWrapper(light)
    const behaviourAggregator = new BehaviourAggregator(wrapper.setState.bind(wrapper), wrapper.getState());
    try {
      behaviourAggregator.setBehaviour(colorOn10AllDay, SPHERE_LOCATION)
      expect(true).toBe(false); // Failsafe
    }
    catch (e) {
      expect(e.errorCode).toBe(433);
    }
  })

})

