/**
 * @jest-environment node
 */

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
    const bridgeIp = await hue.getConfiguredBridges().then(res => {return res[0]});
    const result = await hue.switchToBridge(bridgeIp).then(data => {return data.value});
    expect(result).toBe(true);
}); 