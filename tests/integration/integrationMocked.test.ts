import {v3} from "node-hue-api";
import {fakeBridge, fakeCreateLocal, fakeLightsOnBridge, fakeNupnpSearch} from "../helpers/mockHueApi";
import {CrownstoneHue, Discovery} from "../../src";
import {
  EVENT_ENTER_SPHERE, EVENT_LEAVE_SPHERE,
  SPHERE_LOCATION
} from "../constants/testConstants";
import {BehaviourSupport} from "../../src/behaviour/behaviour/BehaviourSupport";
import {eventBus} from "../../src/util/EventBus";

/**
 * Makes the test wait until all async operations are executed.
 */
const flushPromises = () => new Promise(setImmediate);

describe('Integration Test with mocks', () => {
  let fakeSaveFile = {};

  afterEach(() => {
    jest.clearAllMocks()
    fakeSaveFile = {}
    eventBus.reset();
  })
  beforeEach(() => {
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


  test('Init with discovery', async () => {

    jest.useFakeTimers();
    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const crownstoneHue = new CrownstoneHue();
    const bridge = await crownstoneHue.addBridge({ipAddress:(await Discovery.discoverBridges())[0].ipAddress});
    const lights = await bridge.getAllLightsFromBridge();

    const light = Object.values(lights)[0]
    await crownstoneHue.addLight( {bridgeId:fakeBridge.bridgeid, id: light.id, uniqueId: light.uniqueId});
    await crownstoneHue.setBehaviour(behaviourA.rule);
    await crownstoneHue.setBehaviour(behaviourB.rule);
    jest.advanceTimersToNextTimer(1);
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 20 * 2.54})
    return expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 20 * 2.54})
  })
  test('Init from config', async () => {
    jest.useFakeTimers();

    const bridgeConfig = [{
      "name": "Philips Hue Fake Bridge",
      "ipAddress": "192.168.178.26", // Should change itself to the right one
      "macAddress": "AB:DC:FA:KE:91",
      "username": "FakeUsername",
      "bridgeId": "ABDCFFFEAKE91",
      "clientKey": "FakeKey"
    }]
    const lightsConfig =  [{
        "id": 0,
      "bridgeId": "ABDCFFFEAKE91",
        "uniqueId": "ABCD123"
      },
        {
          "uniqueId": "XYZ0987",
          "bridgeId": "ABDCFFFEAKE91",
          "id": 1
        }
      ]

    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const crownstoneHue = new CrownstoneHue();
    const bridge = await crownstoneHue.addBridge(bridgeConfig[0]);
    await crownstoneHue.addLight(lightsConfig[0]);
    await crownstoneHue.addLight(lightsConfig[1]);
    await crownstoneHue.setBehaviour(behaviourA.rule);
    await crownstoneHue.setBehaviour(behaviourB.rule);
    const lights = crownstoneHue.getAllConnectedLights();
    jest.advanceTimersToNextTimer(1);
    await flushPromises();

    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 20 * 2.54})
    return expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 20 * 2.54})
  })

  test('Scenario', async () => {
    jest.useFakeTimers();

    const bridgeConfig = [{
      "name": "Philips Hue Fake Bridge",
      "ipAddress": "192.168.178.26", // Should change itself to the right one
      "macAddress": "AB:DC:FA:KE:91",
      "username": "FakeUsername",
      "bridgeId": "ABDCFFFEAKE91",
      "clientKey": "FakeKey"
    }]
    const lightsConfig =  [{
      "id": 0,
      "bridgeId": "ABDCFFFEAKE91",
      "uniqueId": "ABCD123"
    },
      {
        "uniqueId": "XYZ0987",
        "bridgeId": "ABDCFFFEAKE91",
        "id": 1
      }
    ]

    const crownstoneHue = new CrownstoneHue();
    await crownstoneHue.addBridge(bridgeConfig[0]);
    await crownstoneHue.addLight(lightsConfig[0]);
    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHue.setBehaviour(behaviourA.rule);
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHue.setBehaviour(behaviourB.rule);
    const behaviourC = new BehaviourSupport().setCloudId("id2").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    await crownstoneHue.setBehaviour(behaviourC.rule);
    const behaviourD = new BehaviourSupport().setCloudId("id3").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    await crownstoneHue.setBehaviour(behaviourD.rule);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    const lights = crownstoneHue.getAllConnectedLights();
//Init, lights should be at 20%.
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 20 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 20 * 2.54})
    expect(crownstoneHue.lights[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.currentLightState).toMatchObject({
      on: true,
      bri: 20 * 2.54
    })

//User enters house, light should be 80%
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    jest.advanceTimersToNextTimer();
    await flushPromises();

    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 80 * 2.54})
    expect(crownstoneHue.lights[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.currentLightState).toMatchObject({
      on: true,
      bri: 80 * 2.54
    })

//User has a a visitor and sets dumb House mode on.
    crownstoneHue.setDumbHouseMode(true);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 80 * 2.54})
    expect(crownstoneHue.lights[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.currentLightState).toMatchObject({
      on: true,
      bri: 80 * 2.54
    })

//Everyone leaves the house, lights should stay 80%, forgot to turn off dumb house mode.
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_LEAVE_SPHERE);
    jest.advanceTimersToNextTimer();
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 80 * 2.54})
    expect(crownstoneHue.lights[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.currentLightState).toMatchObject({
      on: true,
      bri: 80 * 2.54
    })
    expect(crownstoneHue.lights[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("DIM_STATE_OVERRIDE");

//User turns off dumbhouse mode, lights should stay the same.
    crownstoneHue.setDumbHouseMode(false);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(fakeLightsOnBridge[0].state).toMatchObject({on: true, bri: 80 * 2.54})
    expect(crownstoneHue.lights[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("DIM_STATE_OVERRIDE")

//User enters house again
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(crownstoneHue.lights[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("NO_OVERRIDE")
    await crownstoneHue.stop();
    return;
  })


  test('Removing and updating', async () => {
    jest.useFakeTimers()
    const bridgeConfig = [{
      "name": "Philips Hue Fake Bridge",
      "ipAddress": "192.168.178.26", // Should change itself to the right one
      "macAddress": "AB:DC:FA:KE:91",
      "username": "FakeUsername",
      "bridgeId": "ABDCFFFEAKE91",
      "clientKey": "FakeKey"
    }]
    const lightsConfig =  [{
      "id": 0,
      "bridgeId": "ABDCFFFEAKE91",
      "uniqueId": "ABCD123"
    },
      {
        "uniqueId": "XYZ0987",
        "bridgeId": "ABDCFFFEAKE91",
        "id": 1
      }
    ]

    const crownstoneHue = new CrownstoneHue();
    await crownstoneHue.addBridge(bridgeConfig[0]);
    await crownstoneHue.addLight(lightsConfig[0]);
    await crownstoneHue.addLight(lightsConfig[1]);
    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHue.setBehaviour(behaviourA.rule);
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHue.setBehaviour(behaviourB.rule);
    const behaviourC = new BehaviourSupport().setCloudId("id2").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    await crownstoneHue.setBehaviour(behaviourC.rule);
    crownstoneHue.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    const lights = crownstoneHue.getAllConnectedLights();
    await crownstoneHue.removeBehaviour(behaviourC.rule.lightId, behaviourC.rule.cloudId);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 20 * 2.54})
    expect(crownstoneHue.lights[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("NO_OVERRIDE")
    await crownstoneHue.removeLight("XYZ0987");
    const behaviourD = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceIgnore();
    await crownstoneHue.setBehaviour(behaviourD.rule)
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(crownstoneHue.bridges.length).toBe(1);
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(Object.keys(crownstoneHue.getAllConnectedLights()).length).toBe(1);
    await crownstoneHue.stop();
  })


})