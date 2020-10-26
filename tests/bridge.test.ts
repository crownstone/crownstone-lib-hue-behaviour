/**
 * @jest-environment node
 */
import {CrownstoneHueError} from "../src/util/CrownstoneHueError";
import {persistence} from "../src/util/Persistence";
import {Discovery} from "../src/hue/Discovery";
import {SPHERE_LOCATION} from "./constants/testConstants";

const CrownstoneHue = require('../src/CrownstoneHue').CrownstoneHue;
const Bridge = require('../src/hue/Bridge').Bridge;

const crownstoneHue = new CrownstoneHue();
persistence.saveConfiguration = jest.fn(async () => {
});
persistence.loadConfiguration = jest.fn(async () => {
  const config = {
    "Bridges":
      {
        "001788FFFE292AF4": {
          "name": "Philips Hue",
          "ipAddress": "192.168.178.26",
          "macAddress": "00:17:88:29:2a:f4",
          "username": "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo",
          "clientKey": "F713C35839453184BA3B148E5504C74B",
          "lights": {
            "00:17:88:01:10:25:5d:16-0b": {
              "name": "Hue color lamp 1",
              "id": 4,
              "behaviours": []
            },
            "00:17:88:01:10:4a:cd:c8-0b": {
              "name": "Hue color lamp 2",
              "id": 5,
              "behaviours": []
            }
          }
        }
      }
  }
  persistence.configuration = config;
  return config;
});

describe("Bridge", () => {
  let bridge, bridges
  beforeEach(async () => {
    bridges = await crownstoneHue.init(SPHERE_LOCATION);
    bridge = bridges[0]
    bridge.init();
    return;
  })

  test('Returns the amount of bridges.', async () => {
    return expect(bridges.length).toBe(1);
  });

  test('Returns discovery result bridges of bridge in network.', async () => {
    jest.setTimeout(55000);
    return await Discovery.discoverBridges().then(data => {
      expect(data.length).toBeGreaterThan(0)
    });
  });

  test('Returns bridge info', () => {
    const notWorkingBridge = new Bridge("Hue color lamp 3", "user", "key", "mac", "192.168.178.12", "-1", crownstoneHue);
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
    const notWorkingBridge = new Bridge("Hue color lamp 3", "user", "key", "mac", "192.168.178.12", "-1", crownstoneHue);
    try {
      await notWorkingBridge.init();
    } catch (e) {
      return expect(e).toEqual(new CrownstoneHueError(404))
    }
  });

  test('Save bridge', async () => {
    await bridge.populateLights()
    await persistence.saveFullBridgeInformation(bridge);
    return expect(bridge.getConnectedLights).toBeUndefined();
  });

  test('Get light by id. fail', async () => {
    return expect(bridge.getLightById("00:17:88:01:10:4a:cd:c8-Db")).toBeUndefined();
  });

  test('Manipulate light by id.', async () => {
    jest.setTimeout(55000);
    const light = bridge.getLightById("00:17:88:01:10:4a:cd:c8-0b");
    return expect(light.setState({on: true})).toBeTruthy();
  });

  test('Remove light by id.', async () => {
    await persistence.removeLightFromConfig(bridge, "00:17:88:01:10:4a:cd:c8-0b");
    return expect(persistence.configuration["Bridges"][bridge.bridgeId]["lights"]["00:17:88:01:10:4a:cd:c8-0b"]).toBeUndefined();
  });

  test('configure light by id.', async () => {
    await bridge.configureLight(5);
    return expect(persistence.configuration["Bridges"][bridge.bridgeId]["lights"]["00:17:88:01:10:4a:cd:c8-0b"]).toBeDefined();
  });


})



