import {Bridge} from "./hue/Bridge";
import {CrownstoneHueError} from "./util/CrownstoneHueError";
import {persistence} from "./util/Persistence";
import {eventBus} from "./util/EventBus";
import {ON_DUMB_HOUSE_MODE_SWITCH, ON_PRESENCE_CHANGE} from "./constants/EventConstants";
import {Discovery} from "./hue/Discovery";

/**
 * CrownstoneHue object
 *
 * @remarks
 * init() should be called before using this object.
 *
 * @param sphereLocation - Longitude and Latitude of the location of where the Sphere is.
 * @param bridges - List of connected bridges
 *
 */
export class CrownstoneHue {
  bridges: Bridge[] = [];
  sphereLocation: SphereLocation;

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

  async _setupModule() {
    if ("Bridges" in persistence.configuration) {
      for (const uniqueId of Object.keys(persistence.getAllBridges())) {
          await this._setupBridgeById(uniqueId);
      }
    }
  }

  async _setupBridgeById(uniqueId){
    const bridge = persistence.getBridgeById(uniqueId);
    let bridgeObject = this.createBridgeFromConfig(uniqueId);
    await bridgeObject.init();
    for (const lightId of Object.keys(bridge.lights)) {
      const light = await bridgeObject.configureLight(bridge.lights[lightId].id);
      if ("behaviours" in bridge.lights[lightId]) {
        for (const behaviour of bridge.lights[lightId].behaviours) {
          light.behaviourAggregator.addBehaviour(behaviour, this.sphereLocation);
        }
      }
      light.init();
    }
    this.bridges.push(bridgeObject);
  }

  /** Call to turn on/off Dumb house mode.
   *
   * @param on - Boolean whether Dumb house mode should be on or off.
   */
  setDumbHouseMode(on: boolean):void {
    eventBus.emit(ON_DUMB_HOUSE_MODE_SWITCH, on);
  }

 async addBehaviour(behaviour: HueBehaviourWrapper):Promise<void> {
    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined) {
        light.behaviourAggregator.addBehaviour(behaviour, this.sphereLocation);
        await persistence.saveBehaviour(bridge.bridgeId,behaviour.lightId,behaviour);
        break;
      }
    }
  };

  async updateBehaviour(behaviour: HueBehaviourWrapper):Promise<void>{
    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined) {
        light.behaviourAggregator.updateBehaviour(behaviour);
        await persistence.updateBehaviour(bridge.bridgeId,behaviour.lightId,behaviour)
        break;
      }
    }
  }

  async removeBehaviour(behaviour: HueBehaviourWrapper):Promise<void> {
    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined) {
        light.behaviourAggregator.removeBehaviour(behaviour.cloudId);
        await persistence.removeBehaviour(bridge.bridgeId,behaviour.lightId,behaviour.cloudId);
        break;
      }
    }
  };

  presenceChange(data: PresenceEvent):void {
    eventBus.emit(ON_PRESENCE_CHANGE, data);
  }

  async addBridgeByBridgeId(bridgeId: string):Promise<void> {
    const discoveryResult = await Discovery.discoverBridgeById(bridgeId);
    if(discoveryResult.internalipaddress !== "-1"){
      const bridge = new Bridge("","","","",discoveryResult.internalipaddress,discoveryResult.id);
      await bridge.init();
      this.bridges.push(bridge);
    } else {
      throw new CrownstoneHueError(404, "Bridge with id " + bridgeId + " not found.");
    }
  }

  async addBridgeByIpAddress(ipAddress: string):Promise<void> {
      const bridge = new Bridge("","","","",ipAddress,"");
      await bridge.init();
      this.bridges.push(bridge);
  }

  async removeBridge(bridgeId: string) {
    for(let i = 0; i < this.bridges.length; i++){
      if(this.bridges[i].bridgeId === bridgeId){
        this.bridges[i].cleanup();
        this.bridges.splice(i,1);
        await persistence.removeBridge(bridgeId);
        break;
      }
    }
  }

  /**
   * Adds a light to the bridge.
   *
   * @remarks
   * id refers to the id of the light on the bridge and NOT the uniqueId of a light.
   * Gets info of the light from Bridge and creates a Light object and pushes it to the list.
   * Throws error on invalid Id.
   *
   * @param bridgeId - The id of the bridge of which the light have to be added to.
   * @param idOnBridge - The id of the light on the bridge.
   */
  async addLight(bridgeId:string, idOnBridge: number):Promise<void> {
    for(const bridge of this.bridges){
      if (bridge.bridgeId === bridgeId){
        await bridge.configureLight(idOnBridge);
        break;
      }
    }
  };

  async removeLight(lightId:string) {
    for (const bridge of this.bridges) {
      const light = bridge.lights[lightId];
      if (light !== undefined) {
        light.cleanup();
        delete bridge.lights[lightId];
        await persistence.removeLightFromConfig(bridge,lightId);
        break;
      }
    }
  }


  getConnectedBridges(): Bridge[] {
    return this.bridges;
  }

  createBridgeFromConfig(bridgeId: string): Bridge {
    const bridgeConfig = persistence.getBridgeById(bridgeId);
    if (bridgeConfig.name != "", bridgeConfig.macAddress != "", bridgeConfig.ipAddress != "") {
      if (bridgeConfig.username === undefined || bridgeConfig.username === null) {
        bridgeConfig.username = "";
      }
      if (bridgeConfig.clientKey === undefined || bridgeConfig.clientKey === null) {
        bridgeConfig.clientKey = "";
      }
      return new Bridge(bridgeConfig.name, bridgeConfig.username, bridgeConfig.clientKey, bridgeConfig.macAddress, bridgeConfig.ipAddress, bridgeId);
    }
  }
}
