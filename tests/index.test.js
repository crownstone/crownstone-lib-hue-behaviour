/**
 * @jest-environment node
 */

const Framework = require('../dist').Framework;
const Bridge = require('../dist').Bridge;

const framework = new Framework();
const notWorkingBridge = new Bridge("Hue color lamp 3","user","key","mac","192.168.178.12","-1",framework);

test('Returns the amount of bridges.', async () => {
    const bridges =  await framework.init();
    return  expect(bridges.length).toBeGreaterThan(0);
});

test('Returns discovery result bridges.', async () => {
    jest.setTimeout(55000);
    await framework.init();
    return await framework.discoverBridges().then(data => {expect(data.length).toBeGreaterThan(0) });
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
        expect(e).toEqual(Error("BRIDGE_NOT_DISCOVERED"))
    }
});

test('Save bridge', async () => {
    const bridge = await framework.init().then(bridges => {return bridges[0]});
    await bridge.init();
    await bridge.populateLights()
    await framework.saveBridgeInformation(bridge);
    return expect(bridge.getConnectedLights).toBeUndefined();
});

test('Get light by id. fail', async () => {
    const bridge = await framework.init().then(bridges => {return bridges[0]});
    await bridge.init();
    return expect(bridge.getLightById("A00:17:88:01:10:4a:cd:c8-Db")).toBeUndefined();
});

test('Manipulate light by id.', async () => {
    const bridge = await framework.init().then(bridges => {return bridges[0]});
    await bridge.init();
    const light = bridge.getLightById("00:17:88:01:10:4a:cd:c8-0b");
    return expect(light.setState({on: false})).toBeTruthy();
});

test('Remove light by id.', async () => {
    const bridge = await framework.init().then(bridges => {return bridges[0]});
    await bridge.init();
    const light = await framework.removeLightFromConfig(bridge,"00:17:88:01:10:4a:cd:c8-0b");
    return expect(framework.configSettings["Bridges"][bridge.bridgeId]["lights"]["00:17:88:01:10:4a:cd:c8-0b"]).toBeUndefined();
});

test('configure light by id.', async () => {
    const bridge = await framework.init().then(bridges => {return bridges[0]});
    await bridge.init();
    await bridge.configureLight(5);
    return expect(framework.configSettings["Bridges"][bridge.bridgeId]["lights"]["00:17:88:01:10:4a:cd:c8-0b"]).toBeDefined();
});




