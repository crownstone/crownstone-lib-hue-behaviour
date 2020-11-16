/**
 * @jest-environment node
 */

import {Discovery} from "../src";
import {v3} from "node-hue-api"
import {Bridge} from "../src";
import {fakeCreateLocal} from "./helpers/mockHueApi";
afterEach(() =>{
  jest.clearAllMocks()
})
beforeEach(()=>{
  v3.api.createLocal = jest.fn().mockImplementation(fakeCreateLocal);
})
describe("Bridge", () => {
  test("Bridge init > Connect", async () => {
    const bridge = new Bridge("Philips Hue Fake Bridge", "FakeUsername", "FakeKey", "AB:DC:FA:KE:91", "192.168.178.10", "ABDCFFFEAKE91")
    await bridge.init();
    return expect(bridge.authenticated).toBeTruthy();
  })

  test("Bridge init > Link", async () => {
    const bridge = new Bridge("", "", "", "", "192.168.178.10", "")
    await bridge.init();
    return expect(bridge.name).toBe("Philips Hue Fake Bridge");
  })

  test('Returns bridge info', async () => {
    const bridge = new Bridge("Philips Hue Fake Bridge", "FakeUsername", "FakeKey", "AB:DC:FA:KE:91", "192.168.178.10", "ABDCFFFEAKE91")
    await bridge.init();
    return expect(bridge.getInfo()).toStrictEqual({
      name: "Philips Hue Fake Bridge",
      ipAddress: "192.168.178.10",
      macAddress: "AB:DC:FA:KE:91",
      username: "FakeUsername",
      clientKey: "FakeKey",
      bridgeId: "ABDCFFFEAKE91",
      reconnecting: false,
      lights: [],
      authenticated: true,
      reachable: true
    });
  });

  test('getAllLightsFromBridge', async () => {
    const bridge = new Bridge("Philips Hue Fake Bridge", "FakeUsername", "FakeKey", "AB:DC:FA:KE:91", "192.168.178.10", "ABDCFFFEAKE91")
    await bridge.init();
    return bridge.getAllLightsFromBridge().then(lights => expect(lights[0].name).toBe("Light 1"))
  })

  test('Configure light by Id', async () => {
    const bridge = new Bridge("Philips Hue Fake Bridge", "FakeUsername", "FakeKey", "AB:DC:FA:KE:91", "192.168.178.10", "ABDCFFFEAKE91")
    await bridge.init();
    await bridge.configureLightById(0).then(light => {
      expect(light.uniqueId).toBe("ABCD123")
    })
  })

  test('Get all connected lights', async () => {
    const bridge = new Bridge("Philips Hue Fake Bridge", "FakeUsername", "FakeKey", "AB:DC:FA:KE:91", "192.168.178.10", "ABDCFFFEAKE91")
    await bridge.init();
    await bridge.populateLights();
    return expect(bridge.getConnectedLights().length).toBe(2);
  })

  test('Rediscovery', async () => {
    Discovery.discoverBridgeById = jest.fn().mockImplementation((id) =>{return {bridgeId:"ABDCFFFEAKE91",internalipaddress:"192.168.178.10"}})
    const bridge = new Bridge("Philips Hue Fake Bridge", "FakeUsername", "FakeKey", "AB:DC:FA:KE:91", "192.168.178.26", "ABDCFFFEAKE91")
    await bridge.init();
    return expect(bridge.ipAddress).toBe("192.168.178.10");
  })

  test('Get light by Id',async ()=>{
    const bridge = new Bridge("Philips Hue Fake Bridge", "FakeUsername", "FakeKey", "AB:DC:FA:KE:91", "192.168.178.26", "ABDCFFFEAKE91")
    await bridge.init();
    await bridge.configureLightById(0)
    return expect(bridge.getLightById("ABCD123").name).toBe("Light 1")
  })
  test('Remove light by Id',async ()=>{
    const bridge = new Bridge("Philips Hue Fake Bridge", "FakeUsername", "FakeKey", "AB:DC:FA:KE:91", "192.168.178.26", "ABDCFFFEAKE91")
    await bridge.init();
    await bridge.configureLightById(0)
    expect(bridge.getLightById("ABCD123").name).toBe("Light 1")
    await bridge.removeLight("ABCD123");
    expect(bridge.getConnectedLights().length).toBe(0);
  })
})

