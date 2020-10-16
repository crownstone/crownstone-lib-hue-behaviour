// TODO: add a few util functions here which persist your config.
// TODO: inject these into the constructor of your main class, so we can use the database ones later on.


import {promises as fs} from "fs";
import {Bridge, CrownstoneHueError, Light} from "..";
import {EventBus} from "./EventBus";
import {BridgeFormat} from "../declarations/declarations";
import {ConfBridgeObject, ConfigurationObject} from "../declarations/configTypes";

const CONF_NAME: string = "saveConfig.json";
const CONF_BRIDGE_LOCATION: string = "Bridges";
let configuration: ConfigurationObject;

interface BridgeToConfig {
  bridge: BridgeFormat;
}

class Persistence {
  configuration: ConfigurationObject

  constructor() {
  }

  async loadConfiguration(): Promise<ConfigurationObject> {
    await fs.readFile(CONF_NAME, 'utf8').then((data) => {
      this.configuration = JSON.parse(data);
    }).catch(err => {
      if (err.code === "ENOENT") {
        // @ts-ignore
        this.configuration = {CONF_BRIDGE_LOCATION: {}};
        this.saveConfiguration()
      }
      throw err;
    });
    return this.configuration;
  }

  async saveConfiguration(): Promise<void> {
    await fs.writeFile(CONF_NAME, JSON.stringify(this.configuration, null, 2));
  }


  /**
   * Saves the given Bridge into the config file.
   * Including it's lights and their behaviour.
   *
   */
  async saveFullBridgeInformation(bridge: Bridge) {
    let config = bridge.getInfo();
    let bridgeId = config["bridgeId"];
    delete config["reachable"];
    delete config["bridgeId"];
    this.configuration[CONF_BRIDGE_LOCATION][bridgeId] = config;
    if (bridge.lights != {}) {
      bridge.getConnectedLights().forEach(light => {
        this.addLightInfo(bridge.bridgeId, light)
      })
    }
    await this.saveConfiguration()
  }

  /**
   * Adds the given Light to the configSettings variable
   * call this.updateConfigFile() to save into the config file.
   *
   * @param bridgeId - The id of the bridge the light is connected to.
   * @param light - Light object of the light to be saved
   */
  addLightInfo(bridgeId: string, light: Light): void {
    if (this.configuration != undefined) {
      this.configuration[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light["uniqueId"]] = {};
      this.configuration[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light["uniqueId"]]["name"] = light["name"];
      this.configuration[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light["uniqueId"]]["id"] = light["id"];
    } else {
      throw new CrownstoneHueError(410)
    }
  }

  async removeLightFromConfig(bridge: Bridge, uniqueLightId) {
    delete this.configuration[CONF_BRIDGE_LOCATION][bridge.bridgeId]["lights"][uniqueLightId];
    await this.saveConfiguration();
  }
  async updateBridgeIpAddress(bridgeId, ipAddress): Promise<void> {
    if (persistence.configuration[CONF_BRIDGE_LOCATION][bridgeId]["ipAddress"] != undefined) {
      persistence.configuration[CONF_BRIDGE_LOCATION][bridgeId]["ipAddress"] = ipAddress;
      await persistence.saveConfiguration();
    }
  }


  async addBridgeToConfig({bridge}: BridgeToConfig): Promise<void> {
    if (persistence.configuration != undefined) {
      persistence.configuration[CONF_BRIDGE_LOCATION][bridge.bridgeId] = {
        name: bridge.name,
        username: bridge.username,
        clientKey: bridge.clientKey,
        macAddress: bridge.macAddress,
        ipAddress: bridge.ipAddress,
        bridgeId: bridge.bridgeId,
        lights: {}
      }
      if (bridge.lights != undefined || bridge.lights != {}) {
        Object.values(bridge.lights).forEach((light) => {
          this.addLightInfo(bridge.bridgeId, light)
        });
      }
      await persistence.saveConfiguration();
    } else {
      throw new CrownstoneHueError(410);
    }
  }
  /**
   * Retrieves the bridges from the config file.
   *
   * @Returns array of Bridge
   */
  getConfiguredBridges(): ConfBridgeObject[] {
    const bridges: string[] = Object.keys(this.configuration[CONF_BRIDGE_LOCATION]);
    if (bridges === undefined || bridges === null || bridges.length === 0) {
      return [];
    } else if (bridges.length >= 0) {
      let confBridges = [];
      for (const bridgeId of bridges) {
        confBridges.push(this.configuration[CONF_BRIDGE_LOCATION][bridgeId]);
      }
      return confBridges;
    } else {
      throw new CrownstoneHueError(999,bridges);
    }
  }

  /**
   * Saves all lights from the connected bridges into the config file.
   *
   */
  async saveAllLightsFromConnectedBridges(bridges): Promise<void> {
    bridges.forEach(bridge => {
      Object.keys(bridge.lights).forEach(light => {
        this.addLightInfo(bridge.bridgeId, bridge.lights[light])
      })
    });
    await persistence.saveConfiguration()
  }
}
export const persistence = new Persistence();
