/**
 * @jest-environment node
 */
import {CrownstoneHueError} from "../src/util/CrownstoneHueError";
import {persistence} from "../src/util/Persistence";
import {Discovery} from "../src/hue/Discovery";
import {v3} from "node-hue-api"


import {SPHERE_LOCATION} from "./constants/testConstants";
import exp = require("constants");
import {bri} from "node-hue-api/lib/model/lightstate/stateParameters";
import {APP_NAME, DEVICE_NAME} from "../src/constants/HueConstants";
import {Bridge} from "../src";

const CrownstoneHue = require('../src/CrownstoneHue').CrownstoneHue;
const crownstoneHue = new CrownstoneHue();

const allLights = [{
  name: "Light 1",
  uniqueid: "ABCD123",
  state: {},
  id: 0,
  bridgeId: "ABDCFFFEAKE91",
  capabilities: {control: {}},
  getSupportedStates: (() => {
    return {}
  })
}]
afterEach(() =>{
  jest.clearAllMocks()
})
beforeEach(()=>{
  v3.api.createLocal = jest.fn().mockImplementation(ignore => {
    return {
      connect: ((ignore?) => {
        return {
          users: {
            createUser: ((a, b) => {
              return {clientkey: "FakeKey", username: "FakeUsername"}
            })
          },
          configuration: {
            getConfiguration: (() => {
              return {
                bridgeid: "ABDCFFFEAKE91",
                name: "Philips Hue Fake Bridge",
                mac: "AB:DC:FA:KE:91"
              }
            })
          },
          lights: {
            getAll: (() => {
              return allLights;
            }),
            getLight: ((id) => {
              return allLights[id]
            })

          }
        }
      })
    }
  });
  persistence.removeLightFromConfig = jest.fn();
  persistence.saveConfiguration = jest.fn()
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
  persistence.appendBridge = jest.fn(async (ignore) => {
  });
  persistence.appendBridge = jest.fn(async (ignore) => {
  });
})
describe("Bridge", () => {
  test("Bridge init > Connect", async () => {
    const bridge = new Bridge("Philips Hue", "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo", "F713C35839453184BA3B148E5504C74B", "00:17:88:29:2a:f4", "192.168.178.26", "001788FFFE292AF4")
    await bridge.init();
    return expect(bridge.authenticated).toBeTruthy();
  })

  test("Bridge init > Link", async () => {
    const bridge = new Bridge("", "", "", "", "192.168.178.26", "")
    await bridge.init();
    return expect(bridge.name).toBe("Philips Hue Fake Bridge");
  })

  test('Returns bridge info', async () => {
    const bridge = new Bridge("", "", "", "", "192.168.178.26", "")
    await bridge.init();
    return expect(bridge.getInfo()).toStrictEqual({
      name: "Philips Hue Fake Bridge",
      ipAddress: "192.168.178.26",
      macAddress: "AB:DC:FA:KE:91",
      username: "FakeUsername",
      clientKey: "FakeKey",
      bridgeId: "ABDCFFFEAKE91",
      reachable: true
    });
  });

  test('getAllLightsFromBridge', async () => {
    const bridge = new Bridge("", "", "", "", "192.168.178.26", "")
    await bridge.init();
    return bridge.getAllLightsFromBridge().then(lights => expect(lights[0].name).toBe("Light 1"))
  })

  test('Configure light by Id', async () => {
    const bridge = new Bridge("", "", "", "", "192.168.178.26", "")
    await bridge.init();
    await bridge.configureLightById(0).then(light => {
      expect(light.uniqueId).toBe("ABCD123")
    })
  })

  test('Get all connected lights', async () => {
    const bridge = new Bridge("", "", "", "", "192.168.178.26", "")
    await bridge.init();
    await bridge.populateLights();
    return expect(bridge.getConnectedLights().length).toBe(1);
  })

  test('Rediscovery', async () => {
    v3.api.createLocal = jest.fn().mockImplementation((ipaddress) => {
      if(ipaddress === "192.168.178.26") {
        return {connect: (() => Promise.reject({code: "ETIMEDOUT"}))};
      } else if(ipaddress === "192.168.178.10"){
        return {connect: (() => Promise.resolve(""))};
      }
    });
    persistence.appendBridge = jest.fn();
    Discovery.discoverBridgeById = jest.fn().mockImplementation((id) =>{return {bridgeId:"001788FFFE292AF4",internalipaddress:"192.168.178.10"}})
    const bridge = new Bridge("Philips Hue", "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo", "F713C35839453184BA3B148E5504C74B", "00:17:88:29:2a:f4", "192.168.178.26", "001788FFFE292AF4")
    await bridge.init();
    return expect(bridge.ipAddress).toBe("192.168.178.10");
  })

  test('Get light by Id',async ()=>{
    const bridge = new Bridge("Philips Hue", "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo", "F713C35839453184BA3B148E5504C74B", "00:17:88:29:2a:f4", "192.168.178.26", "001788FFFE292AF4")
    await bridge.init();
    await bridge.configureLightById(0)
    return expect(bridge.getLightById("ABCD123").name).toBe("Light 1")
  })
  test('Remove light by Id',async ()=>{
    const bridge = new Bridge("Philips Hue", "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo", "F713C35839453184BA3B148E5504C74B", "00:17:88:29:2a:f4", "192.168.178.26", "001788FFFE292AF4")
    await bridge.init();
    await bridge.configureLightById(0)
    expect(bridge.getLightById("ABCD123").name).toBe("Light 1")
    await bridge.removeLight("ABCD123");
    expect(bridge.getConnectedLights().length).toBe(0);
  })
})

