import {v3} from "node-hue-api";
import {fakeBridge, fakeCreateLocal, fakeLightsOnBridge, fakeNupnpSearch} from "../helpers/mockHueApi";
import {CrownstoneHue, Discovery} from "../../src";
import {
  EVENT_ENTER_SPHERE, EVENT_LEAVE_SPHERE,
  SPHERE_LOCATION
} from "../constants/testConstants";
import {persistence} from "../../src/util/Persistence";
import {BehaviourSupport} from "../../src/behaviour/behaviour/BehaviourSupport";
import {eventBus} from "../../src/util/EventBus";

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Integration Test with mocks', () => {
  let fakeSaveFile = {};

  afterEach(() => {
    jest.clearAllMocks()
    fakeSaveFile = {}
    eventBus.reset();
  })
  beforeEach(() => {
    persistence.saveConfiguration = jest.fn().mockImplementation(() => fakeSaveFile = persistence.configuration);
    v3.api.createLocal = jest.fn().mockImplementation((ipaddress) => {
      return fakeCreateLocal(ipaddress)
    })
    v3.discovery.nupnpSearch = jest.fn().mockImplementation(() => {
      return fakeNupnpSearch()
    })
    Discovery.discoverBridgeById = jest.fn().mockImplementation(() => {
      return {bridgeid: fakeBridge.bridgeid, internalipaddress: fakeBridge.ipaddress}
    })
  })


  test('Init from empty config', async () => {
    persistence.loadConfiguration = jest.fn().mockImplementation( () => {
      const config = {
        "Bridges":
          {}
      }
      persistence.configuration = config;
      return config;
    });
    jest.useFakeTimers();
    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const crownstoneHue = new CrownstoneHue();
    let bridges = await crownstoneHue.init(SPHERE_LOCATION);
    await crownstoneHue.addBridgeByIpAddress((await Discovery.discoverBridges())[0].ipAddress);
    await crownstoneHue.addLight(fakeBridge.bridgeid, 0);
    await crownstoneHue.addBehaviour(behaviourA.rule);
    await crownstoneHue.addBehaviour(behaviourB.rule);
    await jest.advanceTimersToNextTimer(1);
    const lights = crownstoneHue.bridges[0].getConnectedLights();
    expect(lights[0].getState()).toMatchObject({on: true, bri: 20 * 2.54})
    return expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 20 * 2.54})
  })
  test('Init from config', async () => {
    persistence.loadConfiguration = jest.fn().mockImplementation(() => {
      const config = {
        "Bridges":
          {
            "ABDCFFFEAKE91": {
              "name": "Philips Hue Fake Bridge",
              "ipAddress": "192.168.178.26", // Should change itself to the right one
              "macAddress": "AB:DC:FA:KE:91",
              "username": "FakeUsername",
              "clientKey": "FakeKey",
              "lights": {
                "ABCD123": {
                  "name": "Light 1",
                  "id": 0,
                  "behaviours": []
                },
                "XYZ0987": {
                  "name": "Light 2",
                  "id": 1,
                  "behaviours": []
                }
              }
            }
          }
      }
      persistence.configuration = config;
      return config;
    });
    jest.useFakeTimers();
    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const crownstoneHue = new CrownstoneHue();
    let bridges = await crownstoneHue.init(SPHERE_LOCATION);
    await crownstoneHue.addBehaviour(behaviourA.rule);
    await crownstoneHue.addBehaviour(behaviourB.rule);
    await jest.advanceTimersToNextTimer(1);
    const lights = bridges[0].getConnectedLights();
    expect(lights[0].getState()).toMatchObject({on: true, bri: 20 * 2.54})
    return expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 20 * 2.54})
  })

  test('Scenario', async () => {
    persistence.loadConfiguration = jest.fn().mockImplementation(() => {
      const config = {
        "Bridges":
          {
            "ABDCFFFEAKE91": {
              "name": "Philips Hue Fake Bridge",
              "ipAddress": "192.168.178.26", // Should change itself to the right one
              "macAddress": "AB:DC:FA:KE:91",
              "username": "FakeUsername",
              "clientKey": "FakeKey",
              "lights": {
                "ABCD123": {
                  "name": "Light 1",
                  "id": 0,
                  "behaviours": []
                }
              }
            }
          }
      }
      persistence.configuration = config;
      return config;
    })
    const crownstoneHue = new CrownstoneHue();
    let bridges = await crownstoneHue.init(SPHERE_LOCATION);

    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHue.addBehaviour(behaviourA.rule);
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHue.addBehaviour(behaviourB.rule);
    const behaviourC = new BehaviourSupport().setCloudId("id2").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    await crownstoneHue.addBehaviour(behaviourC.rule);
    const behaviourD = new BehaviourSupport().setCloudId("id3").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    await crownstoneHue.addBehaviour(behaviourD.rule);
    await timeout(500);
    const lights = bridges[0].getConnectedLights();
    //Init, lights should be at 20%.
    expect(lights[0].getState()).toMatchObject({on: true, bri: 20 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 20 * 2.54})
    expect(lights[0].behaviourAggregator.currentLightState).toMatchObject({on: true, bri: 20 * 2.54})

    //User enters house, light should be 80%
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    await timeout(500);
    expect(lights[0].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 80 * 2.54})
    expect(lights[0].behaviourAggregator.currentLightState).toMatchObject({on: true, bri: 80 * 2.54})

    //User has a a visitor and sets dumb House mode on.
    crownstoneHue.setDumbHouseMode(true);
    await timeout(500);
    expect(lights[0].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 80 * 2.54})
    expect(lights[0].behaviourAggregator.currentLightState).toMatchObject({on: true, bri: 80 * 2.54})
    console.log("NEXT")
    //Everyone leaves the house, lights should stay 80%, forgot to turn off dumb house mode.
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_LEAVE_SPHERE);
    await timeout(500);
    console.log(lights[0].behaviourAggregator.override)
    expect(lights[0].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 80 * 2.54})
    expect(lights[0].behaviourAggregator.currentLightState).toMatchObject({on: true, bri: 80 * 2.54})
    expect(lights[0].behaviourAggregator.override).toBe("DIM_STATE_OVERRIDE");

    //User turns off dumbhouse mode, lights should stay the same.
    crownstoneHue.setDumbHouseMode(false);
    await timeout(500);
    console.log(lights[0].behaviourAggregator.override)
    expect(lights[0].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 80 * 2.54})
    expect(lights[0].behaviourAggregator.override).toBe("DIM_STATE_OVERRIDE")

    //User enters house again
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    await timeout(500);
    expect(lights[0].behaviourAggregator.override).toBe("NO_OVERRIDE")
    await crownstoneHue.stop();
  })

})