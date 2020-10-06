/**
 * @jest-environment node
 */
import {CrownstoneHueError} from "../src/util/CrownstoneHueError";
import {persistence} from "../src/util/Persistence";
import {Discovery} from "../src/hue/Discovery";
const CrownstoneHue = require('../src/CrownstoneHue').CrownstoneHue;
const Bridge = require('../src/hue/Bridge').Bridge;
const SPHERE_LOCATION = {latitude: 51.916064, longitude: 4.472683} // Rotterdam

const framework = new CrownstoneHue();
const notWorkingBridge = new Bridge("Hue color lamp 3","user","key","mac","192.168.178.12","-1",framework);

test('Returns the amount of bridges.', async () => {
    jest.setTimeout(55000);
    const bridges =  await framework.init(SPHERE_LOCATION);
    return  expect(bridges.length).toBeGreaterThan(0);
});

test('Returns discovery result bridges.', async () => {
    jest.setTimeout(55000);
    return await Discovery.discoverBridges().then(data => {expect(data.length).toBeGreaterThan(0) });
});

test('Returns bridge info', () => {
    return expect(notWorkingBridge.getInfo()).toStrictEqual({
        name: "Hue color lamp 3",
        ipAddress: "192.168.178.12",
        macAddress: "mac",
        username: "user",
        clientKey: "key",
        bridgeId: "-1",
        reachable: false
    });
});

test('Returns no bridge discovered', async () => {
    jest.setTimeout(20000);
    try {
        await notWorkingBridge.init();
    } catch (e) {
        expect(e).toEqual(new CrownstoneHueError(404))
    }
});

test('Save bridge', async () => {
    const bridge = await framework.init(SPHERE_LOCATION).then(bridges => {return bridges[0]});
    await bridge.populateLights()
    await persistence.saveFullBridgeInformation(bridge);
    return expect(bridge.getConnectedLights).toBeUndefined();
});

test('Get light by id. fail', async () => {
    const bridge = await framework.init(SPHERE_LOCATION).then(bridges => {return bridges[0]});
    return expect(bridge.getLightById("00:17:88:01:10:4a:cd:c8-Db")).toBeUndefined();
});

test('Manipulate light by id.', async () => {
    jest.setTimeout(55000);
    const bridge = await framework.init(SPHERE_LOCATION).then(bridges => {return bridges[0]});
    const light = bridge.getLightById("00:17:88:01:10:4a:cd:c8-0b");
    return expect(light.setState({on: true})).toBeTruthy();
});

test('Remove light by id.', async () => {
    const bridge = await framework.init(SPHERE_LOCATION).then(bridges => {return bridges[0]});
    await persistence.removeLightFromConfig(bridge,"00:17:88:01:10:4a:cd:c8-0b");
    return expect(persistence.configuration["Bridges"][bridge.bridgeId]["lights"]["00:17:88:01:10:4a:cd:c8-0b"]).toBeUndefined();
});

test('configure light by id.', async () => {
    const bridge = await framework.init(SPHERE_LOCATION).then(bridges => {return bridges[0]});
    await bridge.configureLight(5);
    return expect(persistence.configuration["Bridges"][bridge.bridgeId]["lights"]["00:17:88:01:10:4a:cd:c8-0b"]).toBeDefined();
});





