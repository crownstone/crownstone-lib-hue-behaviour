import {CrownstoneHueBehaviour} from "../../src";
import {
  EVENT_ENTER_SPHERE, EVENT_LEAVE_SPHERE,
  SPHERE_LOCATION
} from "../constants/testConstants";
import {BehaviourSupport} from "../../src/behaviour/behaviour/BehaviourSupport";
import {eventBus} from "../../src/util/EventBus";
import {CrownstoneHue,BehaviourWrapper as DeviceWrapper} from "../../../crownstone-lib-hue/"
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
    const behaviourA = new BehaviourSupport().setCloudId("id0").setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const behaviourB = new BehaviourSupport().setCloudId("id1").setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    const crownstoneHueBehaviour = new CrownstoneHueBehaviour();
    let light = await crownstoneHue.addLight({id:0})
    const wrapped = new DeviceWrapper(light)
    crownstoneHueBehaviour.addDevice(wrapped);
    crownstoneHueBehaviour.setBehaviour(light.getUniqueId(),behaviourA.rule);
    crownstoneHueBehaviour.setBehaviour(light.getUniqueId(),behaviourB.rule);
    jest.advanceTimersToNextTimer(1);
    await flushPromises();
   return expect(light.getState()).toMatchObject({on: true, bri: Math.round(20 * 2.54)})

  })

  test('Scenario', async () => {
    jest.useFakeTimers();

    const crownstoneHueBehaviour = new CrownstoneHueBehaviour();
    const light = await crownstoneHue.addLight({id:0});
    crownstoneHueBehaviour.addDevice(new DeviceWrapper(light));

    const behaviourA = new BehaviourSupport().setCloudId("id0").setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    crownstoneHueBehaviour.setBehaviour(light.getUniqueId(),behaviourA.rule);
    const behaviourB = new BehaviourSupport().setCloudId("id1").setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    crownstoneHueBehaviour.setBehaviour(light.getUniqueId(),behaviourB.rule);
    const behaviourC = new BehaviourSupport().setCloudId("id2").setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    crownstoneHueBehaviour.setBehaviour(light.getUniqueId(),behaviourC.rule);
    const behaviourD = new BehaviourSupport().setCloudId("id3").setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    crownstoneHueBehaviour.setBehaviour(light.getUniqueId(),behaviourD.rule);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    const lights = crownstoneHueBehaviour.getAllDevices();
//Init, lights should be at 20%.
    expect(light.getState()).toMatchObject({on: true, bri: Math.round(20 * 2.54)})


//User enters house, light should be 80%
    crownstoneHueBehaviour.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    jest.advanceTimersToNextTimer();
    await flushPromises();

    expect(light.getState()).toMatchObject({on: true, bri: Math.round(80 * 2.54)})


//User has a a visitor and sets dumb House mode on.
    crownstoneHueBehaviour.setDumbHouseMode(true);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(light.getState()).toMatchObject({on: true, bri: Math.round(80 * 2.54)})

//Everyone leaves the house, lights should stay 80%, forgot to turn off dumb house mode.
    crownstoneHueBehaviour.presenceChange(<PresenceEvent>EVENT_LEAVE_SPHERE);
    jest.advanceTimersToNextTimer();
    await flushPromises();
    expect(light.getState()).toMatchObject({on: true, bri: Math.round(80 * 2.54)})
    expect(crownstoneHueBehaviour.wrappers[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("DIM_STATE_OVERRIDE");

//User turns off dumbhouse mode, lights should stay the same.
    crownstoneHueBehaviour.setDumbHouseMode(false);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(light.getState()).toMatchObject({on: true, bri: Math.round(80 * 2.54)})
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
    const light = await crownstoneHue.addLight({id:0})
    crownstoneHueBehaviour.addDevice(new DeviceWrapper(light));
    crownstoneHueBehaviour.addDevice(new DeviceWrapper(await crownstoneHue.addLight({id:1})));

    const behaviourA = new BehaviourSupport().setCloudId("id0").setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    crownstoneHueBehaviour.setBehaviour(light.getUniqueId(),behaviourA.rule);
    const behaviourB = new BehaviourSupport().setCloudId("id1").setTimeAllDay().setDimPercentage(20).setPresenceIgnore()
    crownstoneHueBehaviour.setBehaviour("XYZ0987",behaviourB.rule);
    const behaviourC = new BehaviourSupport().setCloudId("id2").setTimeAllDay().setDimPercentage(80).setPresenceSomebodyInSphere().setPresenceDelay(0)
    crownstoneHueBehaviour.setBehaviour(light.getUniqueId(),behaviourC.rule);
    crownstoneHueBehaviour.presenceChange(<PresenceEvent>EVENT_ENTER_SPHERE);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    await crownstoneHueBehaviour.removeBehaviour(light.getUniqueId(), behaviourC.rule.cloudId);
    jest.advanceTimersToNextTimer()
    await flushPromises();
    const lights = Object.values(crownstoneHueBehaviour.getAllDevices());
    expect(light.getState()).toMatchObject({on: true, bri: Math.round(20 * 2.54)})
    expect(crownstoneHueBehaviour.wrappers[fakeLightsOnBridge[0].uniqueid].behaviourAggregator.override).toBe("NO_OVERRIDE")
    crownstoneHueBehaviour.removeDevice("XYZ0987");
    const behaviourD = new BehaviourSupport().setCloudId("id0").setTimeAllDay().setDimPercentage(80).setPresenceIgnore();
    crownstoneHueBehaviour.setBehaviour(light.getUniqueId(),behaviourD.rule)
    jest.advanceTimersToNextTimer()
    await flushPromises();
    expect(light.getState()).toMatchObject({on: true, bri: Math.round(80 * 2.54)})
    expect(Object.keys(crownstoneHueBehaviour.getAllDevices()).length).toBe(1);
    await crownstoneHue.stop();
  })
})