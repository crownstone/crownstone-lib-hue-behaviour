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


import {SwitchBehaviourPrioritizer} from "../src/behaviour/SwitchBehaviourPrioritizer";
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
import {GenericUtil} from "../src/util/GenericUtil";
afterEach(() => {
  eventBus.reset();
});
const BehaviourSupport = require('../src/behaviour/behaviour/BehaviourSupport').BehaviourSupport

describe("Function checks", () => {
  test("Add behaviour", () => {
    const behaviourAggregator = new SwitchBehaviourPrioritizer();
    const behaviourSupport = new BehaviourSupport(switchOn10AllDay)
    behaviourAggregator.setBehaviour(behaviourSupport.rule, SPHERE_LOCATION);
    return expect(behaviourAggregator.behaviours[0].behaviour.cloudId).toBe(switchOn10AllDay.cloudId);
  })

  test("Remove behaviour", () => {
    const behaviourAggregator = aggregatorCreator([switchOn10AllDay])
    behaviourAggregator.removeBehaviour("ACTUALCLOUDID-149");
    return  expect(behaviourAggregator.behaviours.length).toBe(0);
  })

  test("Update behaviour", () => {
    const behaviourAggregator = aggregatorCreator([switchOn10AllDay])
    let updatedBehaviour = <BehaviourWrapperBehaviour>GenericUtil.deepCopy(switchOn10AllDay);
    updatedBehaviour.data.action.data = 100;
    behaviourAggregator.setBehaviour(updatedBehaviour,SPHERE_LOCATION);
    expect(behaviourAggregator.behaviours.length).toBe(1);
    return expect(behaviourAggregator.behaviours[0].behaviour.data.action.data).toBe(100);
  })


  describe("Overlapping checks", () => {

    test("Multiple behaviours | time vs all day", async () => {
      const behaviourAggregator = aggregatorCreator([switchOnWhenAny1Home, switchOnAllDayIgnorePresence, switchOnBetweenRangeWithSpherePresence]);
      behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
      eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);

      return expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 100 });
    })
  });


})


function aggregatorCreator(behaviours): SwitchBehaviourPrioritizer {
  const behaviourAggregator = new SwitchBehaviourPrioritizer();
  for (const behaviour of behaviours) {
    behaviourAggregator.setBehaviour({...behaviour}, SPHERE_LOCATION);
  }
  return behaviourAggregator;
}


describe('Scenarios', function () {
  test("Scenario 1", () => {
    const behaviourAggregator = aggregatorCreator([switchOnAllDayRoom1, switchOn80AllDayRoom1n2, switchOn60AllDayRoom3, switchOn50Sphere, switchOn20Between19002200, switchOn10AllDay])
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 30).toString()));
    //End setup
    //User is in room 1. Light should be 100%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 30).toString()));
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type:"RANGE", value: 100})

    //User walks over to room 2. Light should be 80%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 35).toString()));
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type:"RANGE", value: 80})

    //User walks over to room 4. Light should be 50%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_FOUR);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 40).toString()));
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type:"RANGE", value: 50})

    //User walks over to room 3. Light should be 60%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_FOUR);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_THREE);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 45).toString()));
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 60 })

    //User leaves the house. Light should be 20%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_THREE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_SPHERE);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 50).toString()));
    return expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 20 })
  })

  test("Scenario 2", () => {
    const behaviourAggregator = aggregatorCreator([switchOn80AllDayRoom1n2, switchOn50Sphere])
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 30).toString()));
    //End setup
    //User is in room 1. Light should be 80%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 30).toString()));
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 80 })

    //User walks over to room 2. Light should be 80%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 35).toString()));
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 80 })

    //User walks over to room 4. Light should be 50%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_FOUR);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 40).toString()));
    return expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 50 })
  })

  //1 = living
  //2 = hallway
  //3 = kitchen
  //4 = basement
  //5 = bedroom
  //6 = bathroom
  test("Scenario 3", () => {
    const behaviourAggregator = aggregatorCreator([switchOnAllDayRoom1, switchOn80AllDayRoom1n2, switchOn40WhenInRoom5n6, switchOn60AllDayRoom3, switchOn50Sphere, switchOn10AllDay])
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 30).toString()));
    //End setup
    //User 1 is in room 1  & User 2 is in room 1. Light should be 100%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 30).toString()));
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 100 })

    //User 1 stays & User 2 walks over to room 2. Light should be 100%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 35).toString()))
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 100 })

    //User 1 walks over to room 2 & User 2 walks over to room 3. Light should be 60%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_THREE);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 40).toString()));
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 60 })

    //User 1 walks over to room 5 & User 2 walks to room 2. Light should be 40%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_THREE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_FIVE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_TWO);
    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 45).toString()));
    expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 40 })

    //User 1 walks over to room 4 & User 2 leaves the house. Light should be 50%
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_TWO);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_LOCATION_FIVE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_LEAVE_SPHERE);
    eventBus.emit(ON_PRESENCE_CHANGE, EVENT_ENTER_LOCATION_FOUR);

    behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 20, 50).toString()));
    return expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE" , value: 50 })
  })
});
