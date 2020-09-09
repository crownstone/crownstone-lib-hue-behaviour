/**
 * @jest-environment node
 */

const hueModule = require('./index').Framework;

const hue = new hueModule();

test('Returns the amount of bridges.', async () => {
     await hue.init();
    return await hue.getConfiguredBridges().then(data => {expect(data.length).toBe(1) });
});

test('Returns discovery result bridges.', async () => {
     await hue.init();
    return await hue.discoverBridges().then(data => {expect(data.length).toBeGreaterThan(0) });
});
