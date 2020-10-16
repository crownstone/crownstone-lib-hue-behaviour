/**
 * @jest-environment node
 */
import {eventBus} from "../src/util/EventBus";
import {ON_PRESENCE_CHANGE} from "../src/constants/EventConstants";
import {
  switchOn10AllDay,
  switchOn20Between19002200, switchOn40WhenInRoom5n6,
  switchOn50Sphere,
  switchOn60AllDayRoom3,
  switchOn80AllDayRoom1n2,
  switchOnAllDayIgnorePresence, switchOnAllDayRoom1,
  switchOnBetweenRangeWithSpherePresence,
  switchOnWhenAny1Home
} from "./constants/mockBehaviours";

import {HueBehaviourWrapper} from "../src/declarations/behaviourTypes"

import {SwitchBehaviourAggregator} from "../src/behaviour/SwitchBehaviourAggregator";
import {Api} from "./helpers/Api";
import {Light} from "./helpers/Light";
import {
  EVENT_ENTER_LOCATION, EVENT_ENTER_LOCATION_FIVE,
  EVENT_ENTER_LOCATION_FOUR, EVENT_ENTER_LOCATION_SIX,
  EVENT_ENTER_LOCATION_THREE,
  EVENT_ENTER_LOCATION_TWO,
  EVENT_ENTER_SPHERE,
  EVENT_LEAVE_LOCATION, EVENT_LEAVE_LOCATION_FIVE,
  EVENT_LEAVE_LOCATION_FOUR,
  EVENT_LEAVE_LOCATION_THREE,
  EVENT_LEAVE_LOCATION_TWO,
  EVENT_LEAVE_SPHERE,
  SPHERE_LOCATION
} from "./constants/testConstants";
import {SwitchBehaviour} from "../src/behaviour/behaviour/SwitchBehaviour";
import exp = require("constants");

const BehaviourSupport = require('../src/behaviour/behaviour/BehaviourSupport').BehaviourSupport

//    behaviourAggregator.addBehaviour(twilight80BetweenSunriseSunset,SPHERE_LOCATION)  >> Throws error..
//     const behaviourA = new BehaviourSupport(twilight80BetweenSunriseSunset)
//     behaviourAggregator.addBehaviour(behaviourA.rule,SPHERE_LOCATION)    >> Throws no Error?!
//


describe("Function checks", () => {
  test("Add behaviour", () => {
    const behaviourAggregator = new SwitchBehaviourAggregator();
    const behaviourSupport = new BehaviourSupport(switchOn10AllDay)
    behaviourAggregator.addBehaviour(behaviourSupport.rule, SPHERE_LOCATION);
    expect(behaviourAggregator.behaviours[0].behaviour.cloudId).toBe(switchOn10AllDay.cloudId);
  })

  test("Remove behaviour", () => {
    const behaviourAggregator = aggregatorCreator([switchOn10AllDay])
    behaviourAggregator.removeBehaviour("ACTUALCLOUDID-149");
    expect(behaviourAggregator.behaviours.length).toBe(0);
  })

  test("Update behaviour", () => {
    const behaviourAggregator = aggregatorCreator([switchOn10AllDay])
    let updatedBehaviour = <HueBehaviourWrapper>{...switchOn10AllDay};
    updatedBehaviour.data.action.data = 100;
    behaviourAggregator.updateBehaviour(updatedBehaviour);
    expect(behaviourAggregator.behaviours.length).toBe(1);
    expect(behaviourAggregator.behaviours[0].behaviour.data.action.data).toBe(100);
  })

  test("Loop", () => {
    jest.useFakeTimers();
    const behaviourAggregator = aggregatorCreator([switchOn10AllDay])
    behaviourAggregator.init();
    jest.advanceTimersByTime(500);
    expect(setInterval).toBeCalledTimes(1);
    expect(behaviourAggregator.prioritizedBehaviour).toBeDefined();
  })

  describe("Overlapping checks", () => {

    test("Multiple behaviours | time vs all day", async () => {
      const behaviourAggregator = aggregatorCreator([switchOnWhenAny1Home, switchOnAllDayIgnorePresence, switchOnBetweenRangeWithSpherePresence]);
      behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 13, 0).toString());
      behaviourAggregator._sendTickToBehaviours();
      eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
      behaviourAggregator._sendTickToBehaviours();
      behaviourAggregator._prioritizeBehaviour();

      return expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 100 * 2.54});
    })
  });


})


function aggregatorCreator(behaviours): SwitchBehaviourAggregator {
  const behaviourAggregator = new SwitchBehaviourAggregator();
  for (const behaviour of behaviours) {
    behaviourAggregator.addBehaviour(<HueBehaviourWrapper>{...behaviour}, SPHERE_LOCATION);
  }
  return behaviourAggregator;
}


describe('Scenarios', function () {
  test("Scenario 1", () => {
    const behaviourAggregator = aggregatorCreator([switchOnAllDayRoom1, switchOn80AllDayRoom1n2, switchOn60AllDayRoom3, switchOn50Sphere, switchOn20Between19002200, switchOn10AllDay])
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 30).toString());
    behaviourAggregator._sendTickToBehaviours();
    //End setup
    //User is in room 1. Light should be 100%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION);
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 100 * 2.54})

    //User walks over to room 2. Light should be 80%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 35).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 80 * 2.54})

    //User walks over to room 4. Light should be 50%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_FOUR);
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 40).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 50 * 2.54})

    //User walks over to room 3. Light should be 60%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_FOUR);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_THREE);
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 45).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 60 * 2.54})

    //User leaves the house. Light should be 20%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_THREE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_SPHERE);
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 50).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 20 * 2.54})
  })

  test("Scenario 2", () => {
    const behaviourAggregator = aggregatorCreator([switchOn80AllDayRoom1n2, switchOn50Sphere])
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 30).toString());
    behaviourAggregator._sendTickToBehaviours();
    //End setup
    //User is in room 1. Light should be 80%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION);
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 80 * 2.54})

    //User walks over to room 2. Light should be 80%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 35).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 80 * 2.54})

    //User walks over to room 4. Light should be 50%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_FOUR);
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 40).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 50 * 2.54})
  })

  //1 = living
  //2 = hallway
  //3 = kitchen
  //4 = basement
  //5 = bedroom
  //6 = bathroom
  test("Scenario 3", () => {
    const behaviourAggregator = aggregatorCreator([switchOnAllDayRoom1, switchOn80AllDayRoom1n2, switchOn40WhenInRoom5n6, switchOn60AllDayRoom3, switchOn50Sphere, switchOn10AllDay])
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 30).toString());
    behaviourAggregator._sendTickToBehaviours();
    //End setup
    //User 1 is in room 1  & User 2 is in room 1. Light should be 100%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION);
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 100 * 2.54})

    //User 1 stays & User 2 walks over to room 2. Light should be 100%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 35).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 100 * 2.54})

    //User 1 walks over to room 2 & User 2 walks over to room 3. Light should be 60%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_THREE);
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 40).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 60 * 2.54})

    //User 1 walks over to room 5 & User 2 walks to room 2. Light should be 40%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_THREE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_FIVE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 45).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 40 * 2.54})

    //User 1 walks over to room 4 & User 2 leaves the house. Light should be 50%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_FIVE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_FOUR);

    behaviourAggregator.timestamp = Date.parse(new Date(2020, 9, 4, 20, 50).toString());
    behaviourAggregator._sendTickToBehaviours();
    behaviourAggregator._prioritizeBehaviour();
    expect(behaviourAggregator.composedState).toStrictEqual({on: true, bri: 50 * 2.54})
  })
});
