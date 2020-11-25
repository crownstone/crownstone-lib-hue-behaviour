import {CrownstoneHueBehaviour} from "../../src";
import {
  EVENT_ENTER_SPHERE, EVENT_LEAVE_SPHERE,
  SPHERE_LOCATION
} from "../constants/testConstants";
import {BehaviourSupport} from "../../src/behaviour/behaviour/BehaviourSupport";
import {eventBus} from "../../src/util/EventBus";
import {CrownstoneHue} from "../../../crownstone-lib-hue/"
import {mockLight} from "../helpers/Light";

/**
 * Makes the test wait until all async operations are executed.
 */
const flushPromises = () => new Promise(setImmediate);

describe('Integration Test with mocks', () => {
  const fakeLightsOnBridge = [{
    uniqueid: "ABCD123",
    state: {
      "on": true,
      "bri": 190,
      "alert": "select",
      "mode": "homeautomation",
      "reachable": true
    },
    id: 0
  }, {
    uniqueid: "XYZ0987",
    state: {
      "on": true,
      "bri": 190,
      "alert": "select",
      "mode": "homeautomation",
      "reachable": true
    },
    id: 1
  }]

  let crownstoneHue = new CrownstoneHue();

  afterEach(() => {
    jest.clearAllMocks()
    eventBus.reset();
  })
  beforeEach(() => {
    crownstoneHue.addLight = jest.fn().mockImplementation((data) =>{ return new mockLight(fakeLightsOnBridge[data.id].uniqueid,data.id,fakeLightsOnBridge[data.id].state)})
  })


  test('Basic Usage', async () => {

    jest.useFakeTimers();
    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const crownstoneHueBehaviour = new CrownstoneHueBehaviour();
    let light = await crownstoneHue.addLight({id:0})

    crownstoneHueBehaviour.addDevice(light);
    await crownstoneHueBehaviour.setBehaviour(behaviourA.rule);
    await crownstoneHueBehaviour.setBehaviour(behaviourB.rule);
    jest.advanceTimersToNextTimer(1);
    await flushPromises();
   return expect(light.getState()).toMatchObject({on: true, bri: 20 * 2.54})
  })

  test('Scenario', async () => {
    jest.useFakeTimers();

    const crownstoneHueBehaviour = new CrownstoneHueBehaviour();
    const light = await crownstoneHue.addLight({id:0});
    crownstoneHueBehaviour.addDevice(light);

    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHueBehaviour.setBehaviour(behaviourA.rule);
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHueBehaviour.setBehaviour(behaviourB.rule);
    const behaviourC = new BehaviourSupport().setCloudId("id2").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    await crownstoneHueBehaviour.setBehaviour(behaviourC.rule);
    const behaviourD = new BehaviourSupport().setCloudId("id3").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    await crownstoneHueBehaviour.setBehaviour(behaviourD.rule);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    const lights = crownstoneHueBehaviour.getAllDevices();
//Init, lights should be at 20%.
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 20 * 2.54})


//User enters house, light should be 80%
    crownstoneHueBehaviour.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    jest.advanceTimersToNextTimer();
    await flushPromises();

    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})


//User has a a visitor and sets dumb House mode on.
    crownstoneHueBehaviour.setDumbHouseMode(true);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})

//Everyone leaves the house, lights should stay 80%, forgot to turn off dumb house mode.
    crownstoneHueBehaviour.presenceChange(<PresenceEvent>EVENT_LEAVE_SPHERE);
    jest.advanceTimersToNextTimer();
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(crownstoneHueBehaviour.wrappers[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("DIM_STATE_OVERRIDE");

//User turns off dumbhouse mode, lights should stay the same.
    crownstoneHueBehaviour.setDumbHouseMode(false);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(crownstoneHueBehaviour.wrappers[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("DIM_STATE_OVERRIDE")

//User enters house again
    crownstoneHueBehaviour.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(crownstoneHueBehaviour.wrappers[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("NO_OVERRIDE")
    await crownstoneHueBehaviour.stop();
    return;
  })


  test('Removing and updating', async () => {
    jest.useFakeTimers()
    const crownstoneHueBehaviour = new CrownstoneHueBehaviour();
    crownstoneHueBehaviour.addDevice(await crownstoneHue.addLight({id:0}));
    crownstoneHueBehaviour.addDevice(await crownstoneHue.addLight({id:1}));

    const behaviourA = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHueBehaviour.setBehaviour(behaviourA.rule);
    const behaviourB = new BehaviourSupport().setCloudId("id1").setLightId(fakeLightsOnBridge[1].uniqueid).setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    await crownstoneHueBehaviour.setBehaviour(behaviourB.rule);
    const behaviourC = new BehaviourSupport().setCloudId("id2").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    await crownstoneHueBehaviour.setBehaviour(behaviourC.rule);
    crownstoneHueBehaviour.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    const lights = crownstoneHueBehaviour.getAllDevices();
    await crownstoneHueBehaviour.removeBehaviour(behaviourC.rule.lightId, behaviourC.rule.cloudId);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 20 * 2.54})
    expect(crownstoneHueBehaviour.wrappers[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("NO_OVERRIDE")
    await crownstoneHueBehaviour.removeDevice("XYZ0987");
    const behaviourD = new BehaviourSupport().setCloudId("id0").setLightId(fakeLightsOnBridge[0].uniqueid).setTimeAllDay().setDimPercentage(80).setPresenceIgnore();
    await crownstoneHueBehaviour.setBehaviour(behaviourD.rule)
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(lights[fakeLightsOnBridge[0].uniqueid].getState()).toMatchObject({on: true, bri: 80 * 2.54})
    expect(Object.keys(crownstoneHueBehaviour.getAllDevices()).length).toBe(1);
    await crownstoneHue.stop();
  })


})