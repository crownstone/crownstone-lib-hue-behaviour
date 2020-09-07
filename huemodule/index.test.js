const hueModule = require('./index').CrownstoneHueModule;
const hue = new hueModule();


test('Returns the amount of bridges.', async () => {
     await hue.init();
    return await hue.getConfiguredBridges().then(data => {expect(data.length).toBe(1) });
});

test('Returns discovery result bridges.', async () => {
    const hue = new hueModule();
    await hue.init();
    return await hue.discoverBridges().then(data => {expect(data.length).toBeGreaterThan(0) });
});

test('Returns a list of lights', async () => {
    await hue.init();
    console.log(hue);
    await hue.switchToBridge(await hue.getConfiguredBridges().then(res => {return res[0]}));
    console.log(await hue.getConnectedBridge());
    return await hue.getAllLights().then(data => {expect(data.length).toBeGreaterThan(0) });
});
