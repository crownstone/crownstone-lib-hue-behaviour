import {Bridge} from "./hue/Bridge";
import {CrownstoneHueError} from "./util/CrownstoneHueError";
import {persistence} from "./util/Persistence";
import {eventBus} from "./util/EventBus";
import {ON_BRIDGE_PERSISTENCE_UPDATE, ON_DUMB_HOUSE_MODE_SWITCH, ON_PRESENCE_CHANGE} from "./constants/EventConstants";
import {Discovery} from "./hue/Discovery";
import {GenericUtil} from "./util/GenericUtil";
import {LightAggregatorWrapper} from "./wrapper/LightAggregatorWrapper";
import {Light} from "./hue/Light";

/**
 * CrownstoneHue object
 *
 * @remarks
 * init() should be called before using this object.
 *
 * @param sphereLocation - Longitude and Latitude of the location of where the Sphere is.
 * @param bridges - List of connected bridges
 * @param lights - List of a wrapped light and aggregator
 *
 */
export class CrownstoneHue {
  bridges: Bridge[] = [];
  lights: {  [uniqueId: string]: LightAggregatorWrapper } = {};
  sphereLocation: SphereLocation;
  unsubscribe: EventUnsubscriber
  /**
   * To be called for initialization of the CrownstoneHue.
   *
   * @returns a List of Bridge objects configured from the config file.
   *
   */
  async init(sphereLocation: SphereLocation): Promise<Bridge[]> {
    this.sphereLocation = sphereLocation
    this.unsubscribe = eventBus.subscribe(ON_BRIDGE_PERSISTENCE_UPDATE, this._handleUpdateEvent.bind(this));
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
      const light = await bridgeObject.configureLightById(bridge.lights[lightId].id);
      const lightAggregatorWrapper = new LightAggregatorWrapper(light)
      if ("behaviours" in bridge.lights[lightId]) {
        for (const behaviour of bridge.lights[lightId].behaviours) {
          lightAggregatorWrapper.behaviourAggregator.addBehaviour(behaviour, this.sphereLocation);
        }
      }
      lightAggregatorWrapper.init();
      this.lights[lightId]  = lightAggregatorWrapper;
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

 async addBehaviour(newBehaviour: HueBehaviourWrapper):Promise<void> {
    const behaviour = GenericUtil.deepCopy(newBehaviour) as HueBehaviourWrapper;

    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined) {
        this.lights[behaviour.lightId].behaviourAggregator.addBehaviour(behaviour, this.sphereLocation);
        await persistence.appendBehaviour(bridge.bridgeId,behaviour.lightId,behaviour);
        break;
      }
    }
  };

  async updateBehaviour(behaviour: HueBehaviourWrapper):Promise<void>{
    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined) {
        this.lights[behaviour.lightId].behaviourAggregator.updateBehaviour(behaviour);
        persistence.updateBehaviour(bridge.bridgeId,behaviour.lightId,behaviour)
        await persistence.saveConfiguration();

        break;
      }
    }
  }

  async _handleUpdateEvent(info){
    const bridgeInfo = JSON.parse(info);
    persistence.appendBridge(bridgeInfo);
    await persistence.saveConfiguration()

  }

  async removeBehaviour(behaviour: HueBehaviourWrapper):Promise<void> {
    for (const bridge of this.bridges) {
      const light = bridge.lights[behaviour.lightId];
      if (light !== undefined) {
        this.lights[behaviour.lightId].behaviourAggregator.removeBehaviour(behaviour.cloudId);
        persistence.removeBehaviour(bridge.bridgeId,behaviour.lightId,behaviour.cloudId);
        await persistence.saveConfiguration();
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
        persistence.removeBridge(bridgeId);
        await persistence.saveConfiguration();
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
   *
   *
   * @param bridgeId - The id of the bridge of which the light have to be added to.
   * @param idOnBridge - The id of the light on the bridge.
   */
  async addLight(bridgeId:string, idOnBridge: number):Promise<void> {
    for(const bridge of this.bridges){
      if (bridge.bridgeId === bridgeId){
        const light = await bridge.configureLightById(idOnBridge);
        const lightAggregatorWrapper = new LightAggregatorWrapper(light);
        this.lights[light.getUniqueId()]  = lightAggregatorWrapper;
        lightAggregatorWrapper.init();
        persistence.appendLight(bridge.bridgeId, light)
        await persistence.saveConfiguration();//
        break;
      }
    }
  };

  async removeLight(lightId:string) {
    for (const bridge of this.bridges) {
      const light = bridge.lights[lightId];
      if (light !== undefined) {
        await bridge.removeLight(lightId);
        this.lights[lightId].cleanup();
        delete this.lights[lightId];
        persistence.removeLightFromConfig(bridge, lightId); //
        await persistence.saveConfiguration();
        break;
      }
    }
  }

  getAllWrappedLights(): LightAggregatorWrapper[]{
    return Object.values(this.lights);
  }

  getAllConnectedLights():Light[]{
    let lights = []
    for(const wrappedLight of  Object.values(this.lights)){
      lights.push(wrappedLight.light);
    }
    return lights;
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

  async stop():Promise<void>{
    this.unsubscribe();
    for(const bridge of this.bridges){
      bridge.cleanup()
    }
    Object.values(this.lights).forEach(wrappedLight => {
      wrappedLight.cleanup();
  });
  }
}
