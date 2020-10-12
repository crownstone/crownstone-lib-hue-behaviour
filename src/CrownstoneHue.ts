import {promises as fs} from 'fs';
import {Bridge} from "./hue/Bridge";
import {Light} from "./hue/Light";
import {CrownstoneHueError} from "./util/CrownstoneHueError";
import {persistence} from "./util/Persistence";
import {eventBus} from "./util/EventBus";
import {ON_DUMB_HOUSE_MODE_SWITCH, ON_PRESENCE_CHANGE} from "./constants/EventConstants";
import {PresenceEvent, SphereLocation} from "./declarations/declarations";

//config locations/names
const CONF_BRIDGE_LOCATION: string = "Bridges";

/**
 * CrownstoneHue object
 *
 * @remarks
 * init() should be called before using this object.
 *
 * @param configSettings - Contains the settings from config file
 * @param connectedBridges - List of connected bridges
 *
 */
export class CrownstoneHue {
  bridges: Bridge[] = [];
  sphereLocation: SphereLocation;

  constructor() {
  }

  /**
   * To be called for initialization of the CrownstoneHue.
   *
   * @returns a List of Bridge objects configured from the config file.
   *
   */
  async init(sphereLocation: SphereLocation): Promise<Bridge[]> {
    this.sphereLocation = sphereLocation
    await persistence.loadConfiguration();
    await this._setupModule();

    return this.bridges;
  }

  //TODO Change, less nested loops. Error passing.
  async _setupModule() {
    let errors = [];
    if ("Bridges" in persistence.configuration) {
      for (const uniqueId of Object.keys(persistence.configuration["Bridges"])) {
        const bridge = persistence.configuration.Bridges[uniqueId]
        let bridgeObject = this.createBridgeFromConfig(uniqueId);
        try {
          await bridgeObject.init();
          for (const lightId of Object.keys(bridge.lights)) {
            const light = await bridgeObject.configureLight(bridge.lights[lightId].id);
            if ("behaviours" in bridge.lights[lightId]) {
              for (const behaviour of bridge.lights[lightId].behaviours) {
                light.behaviourAggregator.addBehaviour(behaviour, this.sphereLocation);
              }
            }
            light.behaviourAggregator.init();

          }
          this.bridges.push(bridgeObject);
        } catch (e) {
          errors.push(e);
        }
      }
    }

  }

  setDumbHouseMode(on: boolean) {
    eventBus.emit(ON_DUMB_HOUSE_MODE_SWITCH, on);
  }

  addBehaviour(behaviour: HueBehaviourWrapper) {
    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined) {
        light.behaviourAggregator.addBehaviour(behaviour, this.sphereLocation);
        break;
      }
    }
  };

  updateBehaviour(behaviour: HueBehaviourWrapper) {
    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined) {
        light.behaviourAggregator.updateBehaviour(behaviour);
        break;
      }
    }
  }

  removeBehaviour(behaviour: HueBehaviourWrapper) {
    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined) {
        light.behaviourAggregator.removeBehaviour(behaviour.cloudId);
        break;
      }
    }
};

presenceChange(data
:
PresenceEvent
)
{
  eventBus.emit(ON_PRESENCE_CHANGE, data);
}

addBridge(bridgeId
:
string
)
{
}

removeBridge(bridgeId
:
string
)
{
}

addLight()
{
}
;

removeLight()
{
}
;


getConnectedBridges()
:
Bridge[]
{
  return this.bridges;
}

createBridgeFromConfig(bridgeId
:
string
):
Bridge
{
  const bridgeConfig = persistence.configuration[CONF_BRIDGE_LOCATION][bridgeId]
  if (bridgeConfig.name != "", bridgeConfig.macAddress != "", bridgeConfig.ipAddress != "") {
    if (bridgeConfig.username === undefined || bridgeConfig.username === null) {
      bridgeConfig.username = "";
    }
    if (bridgeConfig.clientKey === undefined || bridgeConfig.clientKey === null) {
      bridgeConfig.clientKey = "";
    }
    let bridge = new Bridge(bridgeConfig.name, bridgeConfig.username, bridgeConfig.clientKey, bridgeConfig.macAddress, bridgeConfig.ipAddress, bridgeId);
    return bridge;
  }
}


}
