/**
 * @jest-environment node
 */

const Framework = require('./Framework').Framework;
const Bridge = require('./Bridge').Bridge;

const framework = new Framework();
const notWorkingBridge = new Bridge("Hue color lamp 3","user","key","mac","192.168.178.12","-1",framework);

test('Returns the amount of bridges.', async () => {
    const bridges =  await framework.init();
    return  expect(bridges.length).toBeGreaterThan(0);
});

test('Returns discovery result bridges.', async () => {
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
    return expect(await notWorkingBridge.init()).toStrictEqual( Error("NO_BRIDGES_DISCOVERED"))
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






