import {promises as fs} from "fs";
import {Bridge, CrownstoneHueError, Light} from "..";
import {GenericUtil} from "./GenericUtil";

const CONF_NAME: string = "saveConfig.json";
const CONF_BRIDGE_LOCATION: string = "Bridges";

/** Persistence class.
 * Call loadConfiguration before using.
 * Usage: Call functions to edit configuration then afterwards call saveConfiguration to save configuration.
 */
class Persistence {
  configuration: ConfigurationObject

  async loadConfiguration(): Promise<ConfigurationObject> {
    await fs.readFile(CONF_NAME, 'utf8').then((data) => {
      this.configuration = JSON.parse(data);
    }).catch(async err => {
      if (err.code === "ENOENT") {
        this.configuration = <ConfigurationObject>{"Bridges": {}};
        await this.saveConfiguration()
      }
      throw err;
    });
    return this.configuration;
  }

  async saveConfiguration(): Promise<void> {
    this.isConfiguredCheck();
    await fs.writeFile(CONF_NAME, JSON.stringify(this.configuration, null, 2));
  }


  /**
   * Adds/Updates the given Light to the configSettings variable
   *
   * @param bridgeId - The id of the bridge the light is connected to.
   * @param light - the light to be appended
   */
  appendLight(bridgeId: string, light: Light | LightInfoObject): void {
    this.isConfiguredCheck();
    if (this.configuration[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light.uniqueId] == undefined) {
      this._appendNewLight(bridgeId, light);
    } else {
      this.configuration[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light.uniqueId]["name"] = light.name;
      this.configuration[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light.uniqueId]["id"] = light.id;
    }
  }

  removeLightFromConfig(bridge: Bridge, uniqueLightId): void {
    this.isConfiguredCheck();
    delete this.configuration[CONF_BRIDGE_LOCATION][bridge.bridgeId]["lights"][uniqueLightId];
  }

  getBridgeById(bridgeId: string): ConfBridgeObject {
    this.isConfiguredCheck();
    return this.configuration[CONF_BRIDGE_LOCATION][bridgeId];
  }

  getAllBridges(): ConfBridges {
    this.isConfiguredCheck();
    return this.configuration["Bridges"];
  }


  /**
   * Retrieves the bridges from the config file.
   *
   * @Returns array of Bridge
   */
  getConfiguredBridges(): ConfBridgeObject[] {
    this.isConfiguredCheck();
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
      throw new CrownstoneHueError(999, bridges);
    }
  }

  appendBridge(bridgeInfo:BridgeInfo): void {
    this.isConfiguredCheck();
    if (bridgeInfo["bridgeId"] != undefined) {
      if (this.configuration[CONF_BRIDGE_LOCATION][bridgeInfo["bridgeId"]] == undefined) {
        this._appendFullBridge(bridgeInfo);
      } else {
        this.configuration[CONF_BRIDGE_LOCATION][bridgeInfo["bridgeId"]]["name"] = bridgeInfo.name || ""
        this.configuration[CONF_BRIDGE_LOCATION][bridgeInfo["bridgeId"]]["ipAddress"] = bridgeInfo.ipAddress || ""
        this.configuration[CONF_BRIDGE_LOCATION][bridgeInfo["bridgeId"]]["macAddress"] = bridgeInfo.macAddress || ""
        this.configuration[CONF_BRIDGE_LOCATION][bridgeInfo["bridgeId"]]["clientKey"] = bridgeInfo.clientKey || ""
        this.configuration[CONF_BRIDGE_LOCATION][bridgeInfo["bridgeId"]]["username"] = bridgeInfo.username || ""
        if (bridgeInfo.lights != []) {
          for (const light of bridgeInfo.lights) {
            this.appendLight(bridgeInfo.bridgeId, light);
          }
        }
      }
    }
  }

  removeBridge(bridgeId: string): void {
    this.isConfiguredCheck();
    delete this.configuration[CONF_BRIDGE_LOCATION][bridgeId];
  }


  _appendFullBridge(bridgeInfo): void {
    this.configuration[CONF_BRIDGE_LOCATION][bridgeInfo.bridgeId] = {
      name: bridgeInfo.name,
      username: bridgeInfo.username,
      clientKey: bridgeInfo.clientKey,
      macAddress: bridgeInfo.macAddress,
      ipAddress: bridgeInfo.ipAddress,
      lights: {}
    }
    if (bridgeInfo.lights != []) {
      for (const light of bridgeInfo.lights) {
        this.appendLight(bridgeInfo.bridgeId, light);
      }
    }
  }

  _appendNewLight(bridgeId:string, light:LightInfoObject): void {
    this.configuration[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light.uniqueId] = {
      name: light.name,
      id: light.id,
      behaviours: []
    }
  }

  appendBehaviour(bridgeId:string, lightId:string, behaviour:HueBehaviourWrapper): void {
    this.isConfiguredCheck();
    this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[behaviour].behaviours.push(GenericUtil.deepCopy(behaviour));
  }

  updateBehaviour(bridgeId:string, lightId:string, updatedBehaviour:HueBehaviourWrapper): void {
    this.isConfiguredCheck();
    for (let i = 0; i < this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[lightId].behaviours.length; i++) {
      const behaviour = this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[lightId].behaviours[i];
      if (behaviour.cloudId === updatedBehaviour.cloudId) {
        this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[lightId].behaviours[i] = GenericUtil.deepCopy(updatedBehaviour);
        break;
      }
    }
  }

  removeBehaviour(bridgeId:string, lightId:string, cloudId:string): void {
    this.isConfiguredCheck();
    for (let i = 0; i < this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[lightId].behaviours.length; i++) {
      const behaviour = this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[lightId].behaviours[i];
      if (behaviour.cloudId === cloudId) {
        this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[lightId].behaviours.splice([i], 1);
        break;
      }
    }
  }

  /**
   * appends all lights from the connected bridges into the config file.
   *
   */
  appendAllLightsFromConnectedBridges(bridges:Bridge[]): void {
    this.isConfiguredCheck();
    bridges.forEach(bridge => {
      Object.keys(bridge.lights).forEach(light => {
        this.appendLight(bridge.bridgeId, bridge.lights[light])
      })
    });
  }

  isConfiguredCheck(): void {
    if (persistence.configuration == undefined) {
      throw new CrownstoneHueError(410);
    }
  }
}

export const persistence = new Persistence();
