// import {
//   switchOn100Range,
//   switchOn30Range, switchOn50Range23500500, switchOn70Range1310sunset,
//   twilight60BetweenRange,
//   twilight80BetweenSunriseSunset
// } from "./constants/mockBehaviours";
// import {SPHERE_LOCATION} from "./constants/testConstants";
// import {BehaviourSupport} from "../src/behaviour/behaviour/BehaviourSupport";
// import {Light} from "./helpers/Light";
// import {Api} from "./helpers/Api";
//
// describe("Scenarios", () =>{
// //  Scenario 0
// // setup
// // No active SwitchBehaviours
// // Active Twilight at 80%
// // Current Aggregated state off
// //
// // events
// // user switchcrafts
// // result: next aggregated state: 80%
// // Active Twilight changes to 60%
// // result: next aggregated state: 60%
// // a SwitchBehaviour becomes active (100%)
// // result: next aggregated state: 60% ( == min(60,100) )
// // Another SwitchBehaviour becomes active, BehaviourHandler prioritizes this one. BehaviourState: 30%
// // result: next aggregated state: 30% == min(60,30)
// //
//   test("Scenario 0", async ()=>{
//     const api = new Api();
//     const light = new Light(api);
//     const behaviourAggregator = light.behaviourAggregator;
//     const behaviourA = new BehaviourSupport(twilight80BetweenSunriseSunset)
//     const behaviourB = new BehaviourSupport(twilight60BetweenRange)
//     const behaviourC = new BehaviourSupport(switchOn100Range);
//     const behaviourD = new BehaviourSupport(switchOn30Range);
//     behaviourAggregator.addBehaviour(behaviourA.rule,SPHERE_LOCATION)
//     behaviourAggregator.addBehaviour(behaviourB.rule,SPHERE_LOCATION)
//     behaviourAggregator.addBehaviour(behaviourC.rule,SPHERE_LOCATION)
//     behaviourAggregator.addBehaviour(behaviourD.rule,SPHERE_LOCATION)
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 13, 0).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     api.user.turnLightOff();
//     light.renewState();
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._prioritizeBehaviour();
//     // End setup;
//     //User turns on light
//     api.user.turnLightOn();
//     light.renewState();
//     expect(light.state.bri/2.54).toBe(80);
//
//     //Twilight gets active
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 13, 10).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.bri/2.54).toBe(60);
//
//     //SwitchBehaviour  with 100% gets active.
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 13, 15).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.bri/2.54).toBe(60);
//
//     //SwitchBehaviour  with 30% gets active.
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 13, 20).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.bri/2.54).toBe(30);
//   })
//
//   test("Scenario 1", async () =>{
//     let savedStatesInTime = [];
//     const api = new Api();
//     const light = new Light(api);
//     const behaviourAggregator = light.behaviourAggregator;
//     const behaviourA = new BehaviourSupport(twilight80BetweenSunriseSunset)
//     const behaviourB = new BehaviourSupport(switchOn70Range1310sunset)
//     behaviourAggregator.addBehaviour(behaviourA.rule,SPHERE_LOCATION)
//     behaviourAggregator.addBehaviour(behaviourB.rule,SPHERE_LOCATION)
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 13, 0).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     api.user.turnLightOff();
//     light.renewState();
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     // End setup;
//     //User turns on light
//     api.user.turnLightOn();
//     light.renewState();
//
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.bri/2.54).toBe(80);
//
//     //User turns off light
//     api.user.turnOffLight();
//     light.renewState();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.on).toBeFalsy();
//
//     //SwitchBehaviour activates
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 13, 10).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.bri/2.54).toBe(70);
//
//   });
//
//   test("Scenario 2", async () =>{
//     const api = new Api();
//     const light = new Light(api);
//     const behaviourAggregator = light.behaviourAggregator;
//     const behaviourA = new BehaviourSupport(twilight80BetweenSunriseSunset)
//     const behaviourB = new BehaviourSupport(switchOn70Range1310sunset)
//     const behaviourC = new BehaviourSupport(switchOn30Range)
//     const behaviourD = new BehaviourSupport(switchOn50Range23500500)
//     behaviourAggregator.addBehaviour(behaviourA.rule,SPHERE_LOCATION)
//     behaviourAggregator.addBehaviour(behaviourB.rule,SPHERE_LOCATION)
//     behaviourAggregator.addBehaviour(behaviourC.rule,SPHERE_LOCATION)
//     behaviourAggregator.addBehaviour(behaviourD.rule,SPHERE_LOCATION)
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 13, 0).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     api.user.turnLightOff();
//     light.renewState();
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     // End setup;
//
//     //User turns on light
//     api.user.turnLightOn();
//     light.renewState();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.bri/2.54).toStrictEqual(80);
//     //SwitchBehaviour activates
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 13, 10).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.bri/2.54).toStrictEqual(70);
//
//     //User turns off light
//     api.user.turnLightOff();
//     light.renewState();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.on).toBeFalsy();
//
//     //SwitchBehaviour activates
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 13, 20).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.on).toBeFalsy();
//
//     //All behaviours inactive
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 23, 20).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.on).toBeFalsy();
//
//     //new behaviour active
//     behaviourAggregator.timestamp  = Date.parse(new Date(2020, 9, 4, 23, 50).toString());
//     behaviourAggregator._sendTickToBehaviours();
//     await behaviourAggregator._handleBehaviours();
//     expect(light.state.bri/2.54).toStrictEqual(50);
//   });
//
// })
//
