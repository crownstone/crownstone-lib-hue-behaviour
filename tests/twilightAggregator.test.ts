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
  switchOnWhenAny1Home, twilightDim50AllDay
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
import {TwilightAggregator} from "../src/behaviour/TwilightAggregator";
import {BehaviourSupport} from "../src/behaviour/behaviour/BehaviourSupport";

//    behaviourAggregator.addBehaviour(twilight80BetweenSunriseSunset,SPHERE_LOCATION)  >> Throws error..
//     const behaviourA = new BehaviourSupport(twilight80BetweenSunriseSunset)
//     behaviourAggregator.addBehaviour(behaviourA.rule,SPHERE_LOCATION)    >> Throws no Error?!
//


describe("Function checks", () =>{
  test("Add behaviour", ()=>{
    const behaviourAggregator = aggregatorCreator(twilightDim50AllDay)
    expect(behaviourAggregator.behaviours[0].behaviour.cloudId).toBe(twilightDim50AllDay.cloudId);
  })

  test("Remove behaviour", ()=>{
    const behaviourAggregator = aggregatorCreator([twilightDim50AllDay])
    behaviourAggregator.removeBehaviour("ACTUALCLOUDID-149");
    expect(behaviourAggregator.behaviours.length).toBe(0);
  })

  test("Update behaviour", ()=>{
    const behaviourAggregator = aggregatorCreator([twilightDim50AllDay])
    let updatedBehaviour = <HueBehaviourWrapper>{...twilightDim50AllDay};
    updatedBehaviour.data.action.data = 100;
    behaviourAggregator.updateBehaviour(updatedBehaviour);
    expect(behaviourAggregator.behaviours.length).toBe(1);
    expect(behaviourAggregator.behaviours[0].behaviour.data.action.data).toBe(100);
  })

  test("Loop", ()=>{
    jest.useFakeTimers();
    const behaviourAggregator = aggregatorCreator([twilightDim50AllDay])
    behaviourAggregator.init();
    jest.advanceTimersByTime(500);
    expect(setInterval).toBeCalledTimes(1);
    expect(behaviourAggregator.prioritizedBehaviour).toBeDefined();
  })


})


function aggregatorCreator(behaviours):TwilightAggregator{
  const behaviourAggregator = new TwilightAggregator();
  for(const behaviour of behaviours){
    behaviourAggregator.addBehaviour(<HueBehaviourWrapper>{...behaviour},SPHERE_LOCATION);
  }
  return behaviourAggregator;
}

