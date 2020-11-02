import {CrownstoneHue, Discovery} from "../../src";
import {persistence} from "../../src/util/Persistence";
import {v3} from "node-hue-api"
import {
  EVENT_ENTER_LOCATION,
  EVENT_ENTER_SPHERE, EVENT_LEAVE_LOCATION,
  EVENT_LEAVE_SPHERE,
  SPHERE_LOCATION
} from "../constants/testConstants";
import {BehaviourSupport} from "../../src/behaviour/behaviour/BehaviourSupport";
import {fakeBridge, fakeCreateLocal, fakeNupnpSearch} from "../helpers/mockHueApi";
import {discovery} from "node-hue-api/lib/v3";
import {bri} from "node-hue-api/lib/model/lightstate/stateParameters";


function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


describe('Test over network with actual bridges and lights', () => {
  persistence.loadConfiguration = jest.fn(async () => {
    const config = {
      "Bridges":
        {
          "001788FFFE292AF4": {
            "name": "Philips Hue",
            "ipAddress": "192.168.178.26", // Should change itself to the right one
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
  //Uses Hue Api library to connect to bridge, make sure a bridge is running in network before running this test.
  test('Uses HUE Api, Rediscovers, connects and manipulates light on behaviour', async () => {
    let behaviour = new BehaviourSupport();
    let behaviour2 = new BehaviourSupport();
    behaviour.setLightId("00:17:88:01:10:4a:cd:c8-0b").setPresenceSomebodyInSphere().setActionState(50).setTimeAllDay().setPresenceDelay(0)
    behaviour2.setLightId("00:17:88:01:10:25:5d:16-0b").setPresenceSomebodyInLocations([1]).setActionState(50).setTimeAllDay().setPresenceDelay(0)
    const crownstoneHue = new CrownstoneHue();
    const bridges = await crownstoneHue.init(SPHERE_LOCATION);
    const lights = bridges[0].getConnectedLights();
    await crownstoneHue.addBehaviour(<HueBehaviourWrapper>behaviour.rule);
    await crownstoneHue.addBehaviour(<HueBehaviourWrapper>behaviour2.rule);
    await lights[1].setState({on: false, transitiontime: 0})
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_ENTER_LOCATION);
    await timeout(2000);

    expect(lights[1].getState()["bri"]).toBe(50 * 2.54);
    expect(lights[0].getState()["bri"]).toBe(50 * 2.54);
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_LEAVE_SPHERE);
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_LEAVE_LOCATION);
    await timeout(2000);
    expect(lights[1].getState()["on"]).toBeFalsy();
    bridges.forEach((bridge) => bridge.cleanup())
    return;
  }, 60000)
});

