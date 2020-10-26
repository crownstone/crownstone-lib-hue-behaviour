/**
 * @jest-environment node
 */
import {CrownstoneHueError} from "../src/util/CrownstoneHueError";
import {persistence} from "../src/util/Persistence";
import {Discovery} from "../src/hue/Discovery";
const CrownstoneHue = require('../src/CrownstoneHue').CrownstoneHue;
const Bridge = require('../src/hue/Bridge').Bridge;
const SPHERE_LOCATION = {latitude: 51.916064, longitude: 4.472683} // Rotterdam

const framework = new CrownstoneHue();
const notWorkingBridge = new Bridge("Hue color lamp 3","user","key","mac","192.168.178.12","-1",framework);
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

test('Returns the amount of bridges.', async () => {
    const bridges =  await framework.init(SPHERE_LOCATION);
    return  expect(bridges.length).toBeGreaterThan(0);
});




