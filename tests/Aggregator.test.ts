/**
 * @jest-environment node
 */
import {
  switchOn10AllDay,
  switchOn50Range23500500,
  twilight40BetweenSunriseSunset,
  twilight80BetweenSunriseSunset,
  twilightDim50AllDay
} from "./constants/mockBehaviours";

import {HueBehaviourWrapperBehaviour, HueBehaviourWrapperTwilight} from "../src/declarations/behaviourTypes"

import {Api} from "./helpers/Api";
import {Light} from "./helpers/Light";
import {SPHERE_LOCATION} from "./constants/testConstants";
import {eventBus} from "../src/util/EventBus";
import {ON_DUMB_HOUSE_MODE_SWITCH} from "../src/constants/EventConstants";
import exp = require("constants");




describe("Function checks", () =>{
  test("Add behaviours", ()=>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilightDim50AllDay,SPHERE_LOCATION);
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn10AllDay,SPHERE_LOCATION);
    expect(behaviourAggregator.twilightPrioritizer.behaviours[0].behaviour.cloudId).toBe(twilightDim50AllDay.cloudId);
    expect(behaviourAggregator.switchBehaviourPrioritizer.behaviours[0].behaviour.cloudId).toBe(switchOn10AllDay.cloudId);
  })

  test("Remove behaviour", ()=>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilightDim50AllDay,SPHERE_LOCATION)
    behaviourAggregator.removeBehaviour("CLOUD-ID-123123");
    expect(behaviourAggregator.twilightPrioritizer.behaviours.length).toBe(0);
  })

  test("Update twilight", ()=>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperTwilight>twilightDim50AllDay,SPHERE_LOCATION)
    let updatedBehaviour = <HueBehaviourWrapperTwilight>{...twilightDim50AllDay};
    updatedBehaviour.data.action.data = 100;
    behaviourAggregator.updateBehaviour(updatedBehaviour);
    expect(behaviourAggregator.twilightPrioritizer.behaviours.length).toBe(1);
    expect(behaviourAggregator.twilightPrioritizer.behaviours[0].behaviour.data.action.data).toBe(100);
  })

  test("Dumb house mode",() =>{
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn50Range23500500,SPHERE_LOCATION)
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    behaviourAggregator._loop();
    eventBus.emit(ON_DUMB_HOUSE_MODE_SWITCH,true);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 23, 55).toString()));
    behaviourAggregator._loop();

    expect(behaviourAggregator.dumbHouseModeActive).toBeTruthy();
    expect(light.state.on).toBeFalsy();

  })

  test('Loop', () =>{
    jest.useFakeTimers();
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    const api = new Api();
    const light = new Light(api);
    const behaviourAggregator = light.behaviourAggregator;
    behaviourAggregator.addBehaviour(<HueBehaviourWrapperBehaviour>switchOn10AllDay,SPHERE_LOCATION)
    behaviourAggregator.init();
    jest.advanceTimersByTime(500);
    expect(setInterval).toBeCalledTimes(1);
    expect(behaviourAggregator.switchBehaviourPrioritizer.prioritizedBehaviour).toBeDefined();
  })


})

