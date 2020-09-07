const hueModule = require('./index').CrownstoneHueModule;

const hue = new hueModule();
hue.init();
test('Testing the test.', () => {
    return hue.discoverBridges().then(data => {expect(data.length).toBe(1) });
});


