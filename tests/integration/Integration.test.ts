import {CrownstoneHue} from "../../src";
import {persistence} from "../../src/util/Persistence";
import {
  EVENT_ENTER_LOCATION,
  EVENT_ENTER_SPHERE, EVENT_LEAVE_LOCATION,
  EVENT_LEAVE_SPHERE,
  SPHERE_LOCATION
} from "../constants/testConstants";
import {switchOn80WhenAny1Home} from "./constants/Behaviours";
import {BehaviourSupport} from "../../src/behaviour/behaviour/BehaviourSupport";
//Make sure Bridge is up and running in the network.
persistence.loadConfiguration = jest.fn(async () => {
  const config = {
    "Bridges":
      {
        "001788FFFE292AF4": {
          "name": "Philips Hue",
          "ipAddress": "192.168.178.26",
          "macAddress": "00:17:88:29:2a:f4",
          "username": "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo",
          "clientKey": "F713C35839453184BA3B148E5504C74B",
          "lights": {
            "00:17:88:01:10:25:5d:16-0b": {
              "name": "Hue color lamp 1",
              "id": 4,
              "behaviours": []
            },
            "00:17:88:01:10:4a:cd:c8-0b": {
              "name": "Hue color lamp 2",
              "id": 5,
              "behaviours": []
            }
          }
        }
      }
  }
  persistence.configuration = config;
  return config;
});

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


//TODO Fake timers.
describe('Integration Test', () => {
  test('Full', async () => {
    let behaviour = new BehaviourSupport();
    let behaviour2 = new BehaviourSupport();
    behaviour.setLightId("00:17:88:01:10:4a:cd:c8-0b").setPresenceSomebodyInSphere().setActionState(50).setTimeAllDay().setPresenceDelay(10)
    behaviour2.setLightId("00:17:88:01:10:25:5d:16-0b").setPresenceSomebodyInLocations([1]).setActionState(50).setTimeAllDay().setPresenceDelay(10)
    const crownstoneHue = new CrownstoneHue();
    const bridges = await crownstoneHue.init(SPHERE_LOCATION);
    const lights = bridges[0].getConnectedLights();
    await crownstoneHue.addBehaviour(<HueBehaviourWrapper>behaviour.rule);
    await crownstoneHue.addBehaviour(<HueBehaviourWrapper>behaviour2.rule);
    await lights[1].setState({on: false, transitiontime:0})
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_ENTER_LOCATION);
    await timeout(5000);
    expect(lights[1].getState()["bri"]).toBe(50*2.54);
    expect(lights[0].getState()["bri"]).toBe(50*2.54);
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_LEAVE_SPHERE);
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_LEAVE_LOCATION);
    await timeout(1000*12);
    expect(lights[1
      ].getState()["on"]).toBeFalsy();
    bridges.forEach((bridge)=> bridge.cleanup())
  }, 60000)

  test('Test', async () => {
    let behaviour = new BehaviourSupport();
    behaviour.setLightId("00:17:88:01:10:4a:cd:c8-0b").setActionState(10).setTimeAllDay().setPresenceIgnore()
    const crownstoneHue = new CrownstoneHue();
    const bridges = await crownstoneHue.init(SPHERE_LOCATION);
    await crownstoneHue.addBehaviour(behaviour.rule);
    const lights = bridges[0].getConnectedLights();
    console.log(lights[1].getState());
    await timeout(1000*12);
    console.log(lights[1].getState());
    await timeout(1000*12);
    console.log(lights[1].getState());

    bridges.forEach((bridge)=> bridge.cleanup())
  }, 60000)
})