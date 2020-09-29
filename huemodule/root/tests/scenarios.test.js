/**
 * @jest-environment node
 */

import {switchOnWhenAny1Home} from "./mockBehaviours"
const BehaviourModule = require('../dist/BehaviourModule').BehaviourModule
const behaviourModule = new BehaviourModule();
const numberToWeekDay = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"}



const setup = async (behaviour) => {
    await behaviourModule.init()
    behaviourModule.addBehaviour(behaviour, "Bedroom");
}


test('Stopping module', async () => {
    await setup(switchOnWhenAny1Home);
    const running = behaviourModule._loop();
    behaviourModule.stop();
    const res = await running;
    return  expect(res).toBe("STOPPED");
});

test('On presence detect', async () => {
    await setup(switchOnWhenAny1Home);
    behaviourModule.detectPresence({room: "Bedroom", presence: true});
    return  expect(behaviourModule.lightsInRoom["Bedroom"][0].getState().on).toBe(true);
});

test('On presence detect', async () => {
    await setup(switchOnWhenAny1Home);
    behaviourModule.detectPresence({room: "Bedroom", presence: true});
    behaviourModule.lightsInRoom["Bedroom"][0].setState({on:false})
    behaviourModule.detectPresence({room: "Bedroom", presence: false});
    behaviourModule.detectPresence({room: "Bedroom", presence: true});
    return  expect(behaviourModule.lightsInRoom["Bedroom"][0].getState().on).toBe(true);
});

test('Overrides after lights off.', async () => {
    await setup(switchOnWhenAny1Home);
    const light = behaviourModule.lightsInRoom["Bedroom"][0]
    const lightBehaviourWrapper = behaviourModule.behaviours[light.uniqueId]
    behaviourModule.detectPresence({room: "Bedroom", presence: true});
    light.setState({on:false})
    behaviourModule._handleLightStateChange(lightBehaviourWrapper);
    return  expect(lightBehaviourWrapper.overrideActive).toBe(true);
});


test('Overrides after lights off.', async () => {
    await setup(switchOnWhenAny1Home);
    const light = behaviourModule.lightsInRoom["Bedroom"][0]
    const lightBehaviourWrapper = behaviourModule.behaviours[light.uniqueId]
    behaviourModule.detectPresence({room: "Bedroom", presence: true});
    light.setState({on:false})
    behaviourModule._handleLightStateChange(lightBehaviourWrapper);
    return  expect(lightBehaviourWrapper.overrideActive).toBe(true);
});


