import {Light} from "./Light"
import {v3} from "node-hue-api";
import {CrownstoneHueError} from "..";
import {APP_NAME, DEVICE_NAME, RECONNECTION_TIMEOUT_TIME} from "../constants/HueConstants"  //Device naming for on the Hue Bridge.
import {Discovery} from "./Discovery";
import {GenericUtil} from "../util/GenericUtil";
import Api from "node-hue-api/lib/api/Api"; // library import only used for types
import {eventBus} from "../util/EventBus";
import {ON_BRIDGE_PERSISTENCE_UPDATE} from "../constants/EventConstants";

const hueApi = v3.api;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const exemptOfAuthentication = {"createUser": true,"createAuthenticatedApi":true,"createUnauthenticatedApi":true};
const neededForReconnection = {...exemptOfAuthentication}
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
  reconnecting: boolean = false;


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
    if (this.username == "") {
      await this.link();
    } else {
      await this.connect();

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
    if (this.username == "") {
      return;
    }
    await this.connect();
    if (!this.authenticated) {
      return;
    }
    await this.updateBridgeInfo();
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
    await this._createAuthenticatedApi();
  }

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
    const lightInfo = await this._useApi("getLightById", id);
    if (lightInfo.hadConnectionFailure) {
      return;
    }
    const light = new Light(lightInfo.name, lightInfo.uniqueid, lightInfo.state, id, this.bridgeId, lightInfo.capabilities.control, lightInfo.getSupportedStates(), this._useApi.bind(this))
    this.lights[lightInfo.uniqueid] = light;
    return light;
  }

  async removeLight(uniqueLightId: string): Promise<void> {
    this.lights[uniqueLightId].cleanup();
    delete this.lights[uniqueLightId];
  }

  /** Retrieves all the lights that are connected through the module.
   *
   */
  getConnectedLights(): Light[] {
    return Object.values(this.lights);
  }

  async updateBridgeInfo() {
    const bridgeConfig = await this._useApi("getBridgeConfiguration");
    if (bridgeConfig.hadConnectionFailure) {
      return;
    }
    await this.update({
      "bridgeId": bridgeConfig.bridgeid,
      "name": bridgeConfig.name,
      "macAddress": bridgeConfig.mac,
      "reachable": true
    })
  }

  /** Retrieves all lights from the bridge.
   *
   */
  async getAllLightsFromBridge(): Promise<Light[]> {
    if (this.authenticated) {
      const lights = await this._useApi("getAllLights");
      if (typeof (lights) === "undefined" || lights.hadConnectionFailure) {
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
    const result = await this._useApi("createAuthenticatedApi");
    if (result.hadConnectionFailure) {
      return;
    }
    this.api = result;
    this.reachable = true;
    this.authenticated = true;
  }

  /**
   * Connects to the bridge and creates an API that has limited access to the bridge.
   * @remarks
   * Mainly used to create a user
   */
  async _createUnAuthenticatedApi(): Promise<void> {
    const result = await this._useApi("createUnauthenticatedApi");
    if (result.hadConnectionFailure) {
      return;
    }
    this.api = result;
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
    if (!this.reachable) {
      return;
    }
    let createdUser = await this._useApi("createUser");
    if (createdUser.hadConnectionFailure) {
      return;
    }
    this.update({"username": createdUser.username, "clientKey": createdUser.clientkey})
  }

  /**
   * Retrieves all lights from the bridge and adds them to lights list.
   * Does not save the lights into the config.
   */
  async populateLights(): Promise<void> {
    let lights = await this._useApi("getAllLights");
    if (lights.hadConnectionFailure) {
      if(!this.reconnecting){
        await this.populateLights();
      }
      return;
    }
    lights.forEach(light => {
      this.lights[light.uniqueid] = new Light(light.name, light.uniqueid, light.state, light.id, this.bridgeId, light.capabilities.control, light.getSupportedStates(), this._useApi.bind(this))
    });
  }


  /** Extra layer for error handling, in case bridge fails or is turned off.
   */
  async _useApi(action, extra?) {
    if (!exemptOfAuthentication[action]) {
      this._checkAuthentication()
    }
    if (this.reconnecting && !neededForReconnection[action]) {
      return {hadConnectionFailure: true};
    }
    try {
        switch (action) {
          case "getAllLights":
            return await this.api.lights.getAll();
          case "createUser":
            return await this.api.users.createUser(APP_NAME, DEVICE_NAME);
          case "getBridgeConfiguration":
            return await this.api.configuration.getConfiguration();
          case "getLightById":
            return await this.api.lights.getLight(extra);
          case "setLightState":
            return await this.api.lights.setLightState(extra[0], extra[1]);
          case "getLightState":
            return await this.api.lights.getLightState(extra);
          case "createAuthenticatedApi":
            return await hueApi.createLocal(this.ipAddress).connect(this.username) as Api;
          case "createUnauthenticatedApi":
            return await hueApi.createLocal(this.ipAddress).connect() as Api;
          default:
            throw new CrownstoneHueError(888);
        }
      } catch (err) {
        if (GenericUtil.isConnectionError(err)) {
          return await this._attemptReconnection();
        } else {
          if (typeof (err.getHueErrorType) === "function") {
            GenericUtil.convertHueLibraryToCrownstoneError(err, extra);
          } else {
            throw err;
          }
        }
      }
  }

  /** Reconnection loop.
   *
   */
  async _attemptReconnection() {
    if (!this.reconnecting) {
      this.reconnecting = true;
      while (this.reconnecting) {
        try {
          this.reachable = false;
          await this._rediscoverMyself();
          this.reconnecting = false;
        } catch (err) {
          if (GenericUtil.isConnectionError(err)) {
            await timeout(RECONNECTION_TIMEOUT_TIME);
          } else {
            this.reconnecting = false;
            throw err;
          }
        }
      }
    }
    return {hadConnectionFailure: true};
  }

  _checkAuthentication() {
    if (!this.authenticated) {
      throw new CrownstoneHueError(405);
    }
  }

  isReachable(): boolean {
    return this.reachable;
  }

  isReconnecting(): boolean {
    return this.reconnecting;
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
    if (result.internalipaddress === "-1") {
      throw new CrownstoneHueError(404, "Bridge with id " + this.bridgeId + " not found.");
    } else {
      this.ipAddress = result.internalipaddress;
      await this.init()
      this.update({ipAddress: this.ipAddress});
    }
  }

  getLightById(uniqueId: string): Light {
    return this.lights[uniqueId];
  }

  cleanup(): void {
    Object.values(this.lights).forEach(light => {
      light.cleanup();
    })
  }

  update(values: object) {
    let updateValues = {};
    if (values["name"] !== undefined) {
      this.name = values["name"]
      updateValues["name"] = values["name"]
    }
    if (values["ipAddress"] !== undefined) {
      this.ipAddress = values["ipAddress"]
      updateValues["ipAddress"] = values["ipAddress"]
    }
    if (values["username"] !== undefined) {
      this.username = values["username"]
      updateValues["username"] = values["username"]
    }
    if (values["clientKey"] !== undefined) {
      this.clientKey = values["clientKey"]
      updateValues["clientKey"] = values["clientKey"]
    }
    if (values["macAddress"] !== undefined) {
      this.macAddress = values["macAddress"]
      updateValues["macAddress"] = values["macAddress"]
    }
    if (values["bridgeId"] !== undefined) {
      this.bridgeId = values["bridgeId"]
      updateValues["bridgeId"] = values["bridgeId"]
    }
    if (values["reachable"] !== undefined) {
      this.reachable = values["reachable"]
    }
    this.save();
  }

  save() {
    const saveState =
      {
        name: this.name,
        ipAddress: this.ipAddress,
        macAddress: this.macAddress,
        username: this.username,
        clientKey: this.clientKey,
        bridgeId: this.bridgeId,
        lights: Object.values(this.lights).map((light) => {
          return {name: light.name, id: light.id, uniqueId: light.uniqueId} as LightInfoObject
        })
      }
    eventBus.emit(ON_BRIDGE_PERSISTENCE_UPDATE, JSON.stringify(saveState))
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
