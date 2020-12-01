/**
 * @jest-environment node
 */
import {twilight40BetweenSunriseSunset, twilight80BetweenSunriseSunset, twilightDim50AllDay
} from "./constants/mockBehaviours";

import {SPHERE_LOCATION} from "./constants/testConstants";
import {TwilightPrioritizer} from "../src/behaviour/TwilightPrioritizer";

function aggregatorCreator(behaviours):TwilightPrioritizer{
  const behaviourAggregator = new TwilightPrioritizer();
  for(const behaviour of behaviours){
    behaviourAggregator.setBehaviour({...behaviour},SPHERE_LOCATION);
  }
  return behaviourAggregator;
}



describe("Function checks", () =>{
  test("Add twilight", ()=>{
    const behaviourAggregator = aggregatorCreator([twilightDim50AllDay])
    expect(behaviourAggregator.behaviours[0].behaviour.cloudId).toBe(twilightDim50AllDay.cloudId);
  })

  test("Remove twilight", ()=>{
    const behaviourAggregator = aggregatorCreator([twilightDim50AllDay])
    behaviourAggregator.removeBehaviour("CLOUD-ID-123123");
    expect(behaviourAggregator.behaviours.length).toBe(0);
  })

  test("Update twilight", ()=>{
    const behaviourAggregator = aggregatorCreator([twilightDim50AllDay])
    let updatedBehaviour = {...twilightDim50AllDay};
    updatedBehaviour.data.action.data = 100;
    behaviourAggregator.setBehaviour(<BehaviourWrapperTwilight>updatedBehaviour,SPHERE_LOCATION);
    expect(behaviourAggregator.behaviours.length).toBe(1);
    return expect(behaviourAggregator.behaviours[0].behaviour.data.action.data).toBe(100);
  })


  describe("Overlapping checks", () => {
    test("Multiple twilights | time vs all day", async () => {
      const behaviourAggregator = aggregatorCreator([twilightDim50AllDay,twilight40BetweenSunriseSunset,twilight80BetweenSunriseSunset]);
      behaviourAggregator.tick(Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
      return  expect(behaviourAggregator.getComposedState()).toStrictEqual({type: "RANGE", value: 40});
    })
  });

})

