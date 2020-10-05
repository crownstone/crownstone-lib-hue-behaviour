// // Deze hoort niet in de src
//
//
//
//
// import {Bridge} from "./index";
// import {Framework} from "./index";
// import {BehaviourModule} from "./BehaviourModule";
// import {Light} from "./index";
// import {setLightState} from "node-hue-api/lib/api/http/endpoints/lights";
// import {Behaviour} from "./Behaviour";
// import {EventBus} from "./util/EventBus";
// const eventBus = new EventBus();
//
// let SimulatedPersonIsInRoom = true;
// const BehaviourWrapperSim = {
//     "type": "BEHAVIOUR",
//     "data": {
//         "action": {"type": "BE_ON", "data": 100},
//         "time": {
//             "type": "RANGE",
//             "from": {"type": "CLOCK", "data": {"hours": 10, "minutes": 10}},
//             "to": {"type": "CLOCK", "data":{ "hours": 13, "minutes": 10}}
//         },
//         "presence": {"type": "SOMEBODY", "data":{"type":"SPHERE"} }
//     },
//     "idOnCrownstone": 0,
//     "profileIndex": 0,
//     "syncedToCrownstone": true,
//     "deleted": false,
//     "activeDays": {
//         "Mon": true,
//         "Tue": true,
//         "Wed": true,
//         "Thu": true,
//         "Fri": true,
//         "Sat": true,
//         "Sun": true
//     },
//     "id": "5f649e889280050004952618",
//     "stoneId": "5f4e47660bc0da0004b4fe16",
//     "sphereId": "5f4d08bbbfeb1e000422a462",
//     "createdAt": "2020-09-18T11:48:24.813Z",
//     "updatedAt": "2020-09-18T11:48:24.489Z"
// }
//
// let simulatedBehaviours = {};
// const framework = new Framework();
// const module = new BehaviourModule();
// let lights = [];
// async function simulation() {
//     const behaviour = new Behaviour(BehaviourWrapperSim,eventBus);
//
//     let date = new Date(2020,8 ,30,20,10,0);
//     behaviour.tick(Date.parse(date.toISOString()))
//
//     console.log(behaviour.isActive);
//
//
//     // await module.init();
//
//     // module.addBehaviour(BehaviourWrapperSim,"Bedroom");
//
//     // const mod = module._loop();
//     // await cycle(500);
//     // await mod;
// }
//
//
// const cycle = async (ms) => {
//     try {
//         await simulatePresence();
//         await delay(ms);
//
//         return cycle(ms);
//     } catch(err){
//         console.log(err);
//         return cycle(ms);
//
//     }
// };
//
// const delay = ms => {
//     return new Promise(resolve => setTimeout(resolve, ms));
// };
//
//
// simulation();
//
//
// async function simulatePresence() {
//     if (Math.floor(Math.random() * Math.floor(15)) === 2) {
//         console.log("Person walks " + ((SimulatedPersonIsInRoom)?"into":"out of") + " the room" )
//         module.detectPresence({room: "Bedroom", presence: SimulatedPersonIsInRoom});
//         SimulatedPersonIsInRoom = !SimulatedPersonIsInRoom;
//         await delay(500);
//
//     }
// }
