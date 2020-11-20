import {
  switchOn100Range,
  switchOn30Range, switchOn50Range23500500, switchOn70Range1310sunset, switchOn80Range13001500,
  twilight60BetweenRange, twilight70Range12001500,
  twilight80BetweenSunriseSunset
} from "./constants/mockBehaviours";
import {SPHERE_LOCATION} from "./constants/testConstants";
import {mockLight} from "./helpers/Light";
import {mockApi} from "./helpers/Api";
import {CrownstoneHueBehaviour} from "../src";
import {CrownstoneHue} from "../../crownstone-lib-hue"
import {eventBus} from "../src/util/EventBus";
import {BehaviourAggregator} from "../src/behaviour/BehaviourAggregator";


describe("Scenarios", () =>{
//  Scenario 0
// setup
// No active SwitchBehaviours
// Active Twilight at 80%
// Current Aggregated state off
//
// events
// user switches
// result: next aggregated state: 80%
// Active Twilight changes to 60%
// result: next aggregated state: 60%
// a SwitchBehaviour becomes active (100%)
// result: next aggregated state: 60% ( == min(60,100) )
// Another SwitchBehaviour becomes active, BehaviourHandler prioritizes this one. BehaviourState: 30%
// result: next aggregated state: 30% == min(60,30)
//

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("Scenario 0",  async ()=>{
    const light = new mockLight("5f4e47660bc0da0004b4fe16",0,{on:false, bri:100})
    const behaviourAggregator = new BehaviourAggregator(light.setState.bind(light),{on:false, bri:100});
    light.setStateUpdateCallback(behaviourAggregator.onStateChange.bind(behaviourAggregator))
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn30Range,SPHERE_LOCATION)
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn100Range,SPHERE_LOCATION)
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperTwilight>twilight60BetweenRange,SPHERE_LOCATION)
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperTwilight>twilight80BetweenSunriseSunset,SPHERE_LOCATION)
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));

    await behaviourAggregator._loop();
    light.apiState.on = false;
    await light.renewState();
    await behaviourAggregator._loop();
    // End setup;
    //User turns on light
    light.apiState.on = true;
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:80*2.54});
    //Twilight gets active
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 10).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:60*2.54});

    //SwitchBehaviour  with 100% gets active.
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 15).toString()));
    await behaviourAggregator._loop();
    expect(light.state.bri/2.54).toBe(60);

    //SwitchBehaviour  with 30% gets active.
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 20).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:30*2.54});
  })
  //
  test("Scenario 1", async () =>{
    const light = new mockLight("5f4e47660bc0da0004b4fe16",0,{on:false, bri:100})
    const behaviourAggregator = new BehaviourAggregator(light.setState.bind(light),{on:false, bri:100});
    light.setStateUpdateCallback(behaviourAggregator.onStateChange.bind(behaviourAggregator))
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn70Range1310sunset,SPHERE_LOCATION)
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperTwilight>twilight80BetweenSunriseSunset,SPHERE_LOCATION)
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    await behaviourAggregator._loop();
    light.apiState.on = false;
    await light.renewState();
    await behaviourAggregator._loop();
    // End setup;
    //User turns on light
    light.apiState.on = true;
    await light.renewState();
    await behaviourAggregator._loop();
    expect(light.state.bri/2.54).toBe(80);

    //User turns off light
    light.apiState.on = false;
    await light.renewState();
    await behaviourAggregator._loop();
    expect(light.state.on).toBeFalsy();

    //SwitchBehaviour activates
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 10).toString()));
    await behaviourAggregator._loop();
    expect(light.state.bri/2.54).toBe(70);

  });

  test("Scenario 2", async () =>{
    const light = new mockLight("5f4e47660bc0da0004b4fe16",0,{on:false, bri:100})
    const behaviourAggregator = new BehaviourAggregator(light.setState.bind(light),{on:false, bri:100});
    light.setStateUpdateCallback(behaviourAggregator.onStateChange.bind(behaviourAggregator))
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperTwilight>twilight80BetweenSunriseSunset,SPHERE_LOCATION)
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn70Range1310sunset,SPHERE_LOCATION)
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn30Range,SPHERE_LOCATION)
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn50Range23500500,SPHERE_LOCATION)
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    await behaviourAggregator._loop();
    light.apiState.on = false;
    await light.renewState();
    await behaviourAggregator._loop();
    // End setup;

    //User turns on light
    light.apiState.on = true;
    await light.renewState();
    await behaviourAggregator._loop();
    expect(light.state).toStrictEqual({on:true,bri:80*2.54});
    //SwitchBehaviour activates
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 10).toString()));
    await behaviourAggregator._loop();
    expect(light.state).toStrictEqual({on:true,bri:70*2.54});

    //User turns off light
    light.apiState.on = false;
    await light.renewState();
    await behaviourAggregator._loop();
    expect(light.state.on).toBeFalsy();

    //SwitchBehaviour activates
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 20).toString()));
    await behaviourAggregator._loop();
    expect(light.state.on).toBeFalsy();

    //All behaviours inactive
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 23, 20).toString()));
    await behaviourAggregator._loop();
    expect(light.state.on).toBeFalsy();

    //new behaviour active
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 23, 50).toString()));
    await behaviourAggregator._loop();
    expect(light.state).toStrictEqual({on:true,bri:50*2.54});
  });

  test("Scenario 3",async ()=>{
    const light = new mockLight("5f4e47660bc0da0004b4fe16",0,{on:false, bri:100})
    const behaviourAggregator = new BehaviourAggregator(light.setState.bind(light),{on:false, bri:100});
    light.setStateUpdateCallback(behaviourAggregator.onStateChange.bind(behaviourAggregator))
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperTwilight>twilight70Range12001500,SPHERE_LOCATION);
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn80Range13001500,SPHERE_LOCATION);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    await behaviourAggregator._loop();
    //End setup
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:70*2.54});
    //Users dims light to 50.
    light.apiState.bri = 50*2.54;
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:50*2.54});
    expect(behaviourAggregator.override === "DIM_STATE_OVERRIDE")

    //All behaviours inactive
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 15, 0).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState.on).toBeFalsy();
    expect(behaviourAggregator.override === "NO_OVERRIDE")
  })

  test("Scenario 4",async ()=>{
    const light = new mockLight("5f4e47660bc0da0004b4fe16",0,{on:false, bri:100})
    const behaviourAggregator = new BehaviourAggregator(light.setState.bind(light),{on:false, bri:100});
    light.setStateUpdateCallback(behaviourAggregator.onStateChange.bind(behaviourAggregator))
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperTwilight>twilight70Range12001500,SPHERE_LOCATION);
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn80Range13001500,SPHERE_LOCATION);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 12, 0).toString()));
    await behaviourAggregator._loop();
    //End setup
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:70*2.54});
    //Users dims light to 50.
    light.apiState.bri = 50*2.54
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:50*2.54});
    expect(behaviourAggregator.override === "DIM_STATE_OVERRIDE")
    //Behaviour gets active
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 0).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:50*2.54});
    //All behaviours inactive
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 15, 0).toString()));
    await behaviourAggregator._loop();
    expect(behaviourAggregator.currentLightState.on).toBeFalsy();
    expect(behaviourAggregator.override === "NO_OVERRIDE")
  })

  test("Scenario 5",async ()=>{
    const light = new mockLight("5f4e47660bc0da0004b4fe16",0,{on:false, bri:100})
    const behaviourAggregator = new BehaviourAggregator(light.setState.bind(light),{on:false, bri:100});
    light.setStateUpdateCallback(behaviourAggregator.onStateChange.bind(behaviourAggregator))
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperTwilight>twilight70Range12001500,SPHERE_LOCATION);
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn100Range,SPHERE_LOCATION);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 14, 0).toString()));
    await behaviourAggregator._loop();
    //End setup
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:70*2.54});
    //Users dims light to 50.
    light.apiState.bri = 50 * 2.54
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:50*2.54});
    expect(behaviourAggregator.override === "DIM_STATE_OVERRIDE")
    //User turns off light
    light.apiState.on = false
    await light.renewState();
    expect(behaviourAggregator.currentLightState.on).toBeFalsy();
    //User turns on light
    light.apiState.on = true;
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:70*2.54});
    expect(behaviourAggregator.override === "NO_OVERRIDE")
  })

  test("Scenario 6",async ()=>{
    const light = new mockLight("5f4e47660bc0da0004b4fe16",0,{on:false, bri:100})
    const behaviourAggregator = new BehaviourAggregator(light.setState.bind(light),{on:false, bri:100});
    light.setStateUpdateCallback(behaviourAggregator.onStateChange.bind(behaviourAggregator))
    behaviourAggregator.setBehaviour(<HueBehaviourWrapperBehaviour>switchOn80Range13001500,SPHERE_LOCATION);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 14, 0).toString()));
    await behaviourAggregator._loop();
    //End setup
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:80*2.54});
    //User turns off light
    light.apiState.on = false
    await light.renewState();
    expect(behaviourAggregator.currentLightState.on).toBeFalsy();
    expect(behaviourAggregator.override === "SWITCH_STATE_OVERRIDE")
    //User turns on light
    light.apiState.on = true
    await light.renewState();
    expect(behaviourAggregator.currentLightState).toStrictEqual({on:true,bri:80*2.54});
    expect(behaviourAggregator.override === "NO_OVERRIDE")
  })
})

