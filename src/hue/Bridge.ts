import {Light} from "./Light"
import {v3} from "node-hue-api";
import {CrownstoneHueError} from "..";
import {APP_NAME, DEVICE_NAME} from "../constants/HueConstants"  //Device naming for on the Hue Bridge.
import {persistence} from "../util/Persistence";
import {Discovery} from "./Discovery";
import {GenericUtil} from "../util/GenericUtil";
import Api from "node-hue-api/lib/api/Api";  // Only used for types.
const hueApi = v3.api;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Bridge object
 *
 * @remarks
 * init() should be called before using this object.
 *
 * @param lights - Key/Value List of Light objects, Where key is the uniqueId of a list and value the Light object itself
 * @param api - An Api from the Hue Library that is used to connect to the Bridge itself. Empty before init.
 * @param name - Name of the Bridge.
 * @param username - The username that is whitelisted on the Hue Bridge. Should be empty if not Bridge isn't linked. May be empty on construct.
 * @param clientKey - The client key that is whitelisted on the Hue Bridge for the Entertainment Api. Should be empty if not Bridge isn't linked. Currently unused. May be empty on construct.
 * @param macAddress - The mac-address of the bridge itself
 * @param ipAddress - The last known ip-address of the bridge.
 * @param bridgeId - The unique id of the bridge.
 * @param reachable - Boolean if Bridge is reachable or not.
 *
 */
export class Bridge {
  lights: object = {};
  api: Api;
  authenticated: boolean = false;
  name: string;
  username: string;
  clientKey: string;
  macAddress: string;
  ipAddress: string;
  bridgeId: string
  reachable: boolean = false;


  constructor(name: string, username: string, clientKey: string, macAddress: string, ipAddress: string, bridgeId: string) {
    this.name = name;
    this.username = username;
    this.ipAddress = ipAddress;
    this.clientKey = clientKey;
    this.macAddress = macAddress;
    this.bridgeId = bridgeId;
  }

  /**
   * To be called for initialization of a bridge.
   * If username is empty, attempts to create user on bridge.
   * If button not pressed: throws Error that link button have not been pressed.
   *
   * If Bridge can't be found, it will attempt to rediscover itself every 10 seconds.
   */
  async init(): Promise<void> {
    try {
      if (this.username == "") {
        await this.link();
      } else {
        await this.connect();
      }
    } catch (err) {
      if (typeof (err.getHueErrorType) === "function" && err.getHueErrorType() === 1) {
        throw new CrownstoneHueError(401)
      } else if (typeof(err.errorCode) !== "undefined" && err.errorCode === 404){
        await this._attemptReconnection();
      }else {
        throw err;
      }
    }
  }

  /**
   * Links and connects the bridge to the module. Bridge link button should be pressed before being called.
   *
   * @remarks
   * Attempts to create a user on the bridge.
   * Throws error from createNewUser() when link button is not pressed before linking.
   *
   */
  async link(): Promise<void> {
    await this.createNewUser()
    await this.connect();
    await this.updateBridgeInfo();
    await persistence.saveFullBridgeInformation(this);
  }

  /**
   * Connects the bridge and updates the api variable.
   *
   * @remarks
   * Connects the bridge and updates the api.
   * In case bridge is not found, it starts to rediscover itself through _rediscoveryMyself()
   *
   */
  async connect(): Promise<void> {
    try {
      await this._createAuthenticatedApi()
    } catch (err) {
      if (err.code == "ENOTFOUND" || err.code == "ECONNREFUSED" || err.code == "ETIMEDOUT" || err.code == "ECONNRESET") {
        await this._rediscoverMyself()
      } else {
        throw err;
      }
    }
  }
 //Todo remove save
  /**
   * Adds a light to the lights list of this bridge.
   *
   * @remarks
   * Used to add a light that is connected to the Hue bridge to the list of this class.
   * id refers to the id of the light on the bridge and NOT the uniqueId of a light.
   * Gets info of the light from Bridge and creates a Light object and pushes it to the list.
   * Throws error on invalid Id.
   *
   * @Returns uninitialized light object. (Call .init())
   */
  async configureLightById(id: number): Promise<Light> {
    if (this.authenticated) {
      try {
        const lightInfo = await this._useApi("getLightById",id);
        const light = new Light(lightInfo.name, lightInfo.uniqueid, lightInfo.state, id, this.bridgeId, lightInfo.capabilities.control, lightInfo.getSupportedStates(), this._useApi.bind(this))
        this.lights[lightInfo.uniqueid] = light;
        persistence.saveLight(this.bridgeId, light)
        await persistence.saveConfiguration();
        return light;
      } catch (err) {
        if (typeof (err.getHueErrorType) === "function") {
          if (err.message.includes(`Light ${id} not found`)) {
            throw new CrownstoneHueError(422, id)
          } else {
            throw new CrownstoneHueError(999, err.message);
          }
        } else {
          throw err;
        }
      }
    } else {
      throw new CrownstoneHueError(405);

    }
  }

  //Todo remove save
  async removeLight(uniqueLightId: string): Promise<void> {
    await persistence.removeLightFromConfig(this, uniqueLightId);
    this.lights[uniqueLightId].cleanup();
    delete this.lights[uniqueLightId];
  }

  //todo if all reconnecting? return: Continue;
  //todo while loop, niet recursief.
  //todo alle commands voor lampen niet queuen
  async _attemptReconnection(){
    try{
      this.reachable = false;
      console.log("ATTEMPTING RECONNECTION...")
      await this._rediscoverMyself();
    } catch(err){
      if (GenericUtil.isConnectionError(err)){
        await timeout(10000);
        await this._attemptReconnection();
      }
    }
  }

  /** Retrieves all the lights that are connected through the module.
   *
   */
  getConnectedLights(): Light[] {
    return Object.values(this.lights);
  }

  async updateBridgeInfo(){
    const bridgeConfig = await this._useApi("getBridgeConfiguration") as {name:string, bridgeid: string, mac:string};
    await this.update({
      "bridgeId": bridgeConfig.bridgeid,
      "name": bridgeConfig.name,
      "macAddress": bridgeConfig.mac,
      "reachable": true
    })
  }

  isReachable(){
    return this.reachable;
  }


  /** Retrieves all lights from the bridge.
   *
   */
  async getAllLightsFromBridge(): Promise<Light[]> {
    if (this.authenticated) {
      const lights = await this._useApi("getAllLights");
      if(typeof(lights) === "undefined"){
        return []
      }
      return lights.map(light => {
        return new Light(light.name, light.uniqueid, light.state, light.id, this.bridgeId, light.capabilities.control, light.getSupportedStates(), this._useApi.bind(this))
      });
    } else {
      throw new CrownstoneHueError(405);
    }
  }

  /**
   * Connects to the bridge and creates an API that has full access to the bridge.
   * Bridge should be linked and a username should be present before calling.
   *
   */
  async _createAuthenticatedApi(): Promise<void> {
    this.api = await hueApi.createLocal(this.ipAddress).connect(this.username);
    this.reachable = true;
    this.authenticated = true;
  }

  /**
   * Connects to the bridge and creates an API that has limited access to the bridge.
   * @remarks
   * Mainly used to create a user
   */
   async _createUnAuthenticatedApi(): Promise<void> {
    this.api = await hueApi.createLocal(this.ipAddress).connect();
    this.reachable = true;
    this.authenticated = false;

  }

  /**
   * Creates a user on the Bridge.
   *
   * @remarks
   * Creates a user on the Bridge, link button on bridge should be pressed before being called.
   * Throws error if link button is not pressed
   *
   */
  async createNewUser(): Promise<void> {
    await this._createUnAuthenticatedApi();
    try {
      let createdUser = await this._useApi("createUser");
      this.update({"username": createdUser.username, "clientKey": createdUser.clientkey})

    } catch (err) {
      if (typeof (err.getHueErrorType) === "function" && err.getHueErrorType() === 101) {
        throw new CrownstoneHueError(406)
      } else {
        throw err;
      }
    }
  }
  //Queue voor reconnect
  //Extra layer for error handling, in case bridge fails or is turned off.
  async _useApi(call,extra?){
    try{
      switch(call){
        case "getAllLights":
          return await this.api.lights.getAll();
        case "createUser":
          return await this.api.users.createUser(APP_NAME, DEVICE_NAME);
        case "getBridgeConfiguration":
         return await this.api.configuration.getConfiguration();
        case "getLightById":
          return await this.api.lights.getLight(extra);
        case "setLightState":
          return await this.api.lights.setLightState(extra[0], extra[1]);  // Niet uitvoeren na reconnect.
        case "getLightState":
          return await this.api.lights.getLightState(extra);
        default:
          return false;
      }
    } catch(err){
      if(GenericUtil.isConnectionError(err)){
        await this._attemptReconnection();
      }
      else {
        throw err;
      }

    }
  }



  /**
   * Retrieves all lights from the bridge and adds them to lights list.
   * Does not save the lights into the config.
   */
  async populateLights(): Promise<void> {
    if (this.authenticated) {
      let lights = await this._useApi("getAllLights");
      lights.forEach(light => {
        this.lights[light.uniqueid] = new Light(light.name, light.uniqueid, light.state, light.id, this.bridgeId, light.capabilities.control, light.getSupportedStates(), this._useApi.bind(this))
      });
    } else {
      throw new CrownstoneHueError(405);
    }
  }

  /**
   * Rediscovers Bridge in case of failed connection
   *
   * @remarks
   * Retrieves bridge with discoverBridgeById.
   * Success:
   * If bridge is found it updates bridge info and creates the API for it.
   * Fail:
   * If the bridge is not found in the network it throws Error
   *
   */
  private async _rediscoverMyself(): Promise<void> {
    const result = await Discovery.discoverBridgeById(this.bridgeId);
    if(result.internalipaddress === "-1"){
      throw new CrownstoneHueError(404, "Bridge with id " + this.bridgeId + " not found.");
    } else{
    this.ipAddress = result.internalipaddress;
    await this.init()
    await persistence.updateBridgeIpAddress(this.bridgeId, this.ipAddress);
    }
  }

  getLightById(uniqueId: string): Light {
    return this.lights[uniqueId];
  }

  cleanup():void {
    Object.values(this.lights).forEach(light =>{
      light.cleanup();
    })
  }

  update(values: object) {
    if (values["name"] !== undefined) {
      this.name = values["name"]
    }
    if (values["ipAddress"] !== undefined) {
      this.ipAddress = values["ipAddress"]
    }
    if (values["username"] !== undefined) {
      this.username = values["username"]
    }
    if (values["clientKey"] !== undefined) {
      this.clientKey = values["clientKey"]
    }
    if (values["macAddress"] !== undefined) {
      this.macAddress = values["macAddress"]
    }
    if (values["bridgeId"] !== undefined) {
      this.bridgeId = values["bridgeId"]
    }
    if (values["reachable"] !== undefined) {
      this.reachable = values["reachable"]
    }
  }

  getInfo(): object {
    return {
      name: this.name,
      ipAddress: this.ipAddress,
      macAddress: this.macAddress,
      username: this.username,
      clientKey: this.clientKey,
      bridgeId: this.bridgeId,
      reachable: this.reachable
    };
  }
}
