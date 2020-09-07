const hueModule = require('./index').CrownstoneHueModule;
const hue = new hueModule();


test('Returns the amount of bridges.', async () => {
     await hue.init();
    return await hue.getConfiguredBridges().then(data => {expect(data.length).toBe(1) });
});

test('Returns discovery result bridges.', async () => {
     await hue.init();
    return await hue.discoverBridges().then(data => {expect(data.length).toBeGreaterThan(0) });
});

test('Switch to bridge', async () => {
    await hue.init();
    return await hue.switchToBridge(await hue.getConfiguredBridges().then(res => {return res[0]})).then(data => {expect(data.value).toBeTruthy() });
});
