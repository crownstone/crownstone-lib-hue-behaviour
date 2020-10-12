import {CrownstoneHue} from "../CrownstoneHue";
import {Light} from "./Light"
import {v3} from "node-hue-api";
import {CrownstoneHueError} from "../util/CrownstoneHueError";
import {DISCOVERY_URL,APP_NAME,DEVICE_NAME} from "../constants/HueConstants"
import {persistence} from "../util/Persistence";
import {DiscoverResult} from "../declarations/declarations";
const hueApi = v3.api;
const fetch = require('node-fetch');




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
 * @param clientKey - The client key that is whitelisted on the Hue Bridge for the Entertaiment Api. Should be empty if not Bridge isn't linked. Currently unused. May be empty on construct.
 * @param macAddress - The mac-address of the bridge itself
 * @param ipAddress - The last known ip-address of the bridge.
 * @param bridgeId - The unique id of the bridge.
 * @param reachable - Boolean if Bridge is reachable or not.
 * @param framework - Link to the CrownstoneHue object from where the Bridge was created.
 *
 */
export class Bridge {
    lights: object = {};
    api: any;
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
     *
     */
    async init(): Promise<void> {
        try {
            if (this.username == "") {
                await this.link();
            } else {
                await this.connect();
                // await this.createLightsFromConfig();
            }
        } catch (err) {
            if (typeof (err.getHueErrorType) === "function" && err.getHueErrorType() === 1) {
                throw new CrownstoneHueError(401)
            } else {
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
        const bridgeConfig = await this.api.configuration.getConfiguration();
        await this.update({
            "bridgeId": bridgeConfig.bridgeid,
            "name": bridgeConfig.name,
            "macAddress": bridgeConfig.mac,
            "reachable": true
        })

        await persistence.saveFullBridgeInformation(this);
        await persistence.saveConfiguration();
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
            if (err.code == "ENOTFOUND" || err.code == "ECONNREFUSED" || err.code == "ETIMEDOUT") {
                await this._rediscoverMyself()
            } else {
                throw err;
            }

        }
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
     * @Returns light object.
     */
    async configureLight(id: number): Promise<Light> {
        if (this.authenticated) {
            try {
                const lightInfo = await this.api.lights.getLight(id);
                this.lights[lightInfo.uniqueid] = {};
                const light = new Light(lightInfo.name, lightInfo.uniqueid, lightInfo.state, id, this.bridgeId, lightInfo.capabilities.control, lightInfo.getSupportedStates(), this)
                this.lights[lightInfo.uniqueid] = light;
                await persistence.addLightInfo(this.bridgeId, light)
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

    //todo behaviour cleanup
    async removeLight(uniqueLightId: string): Promise<void> {
        await persistence.removeLightFromConfig(this, uniqueLightId);
        delete this.lights[uniqueLightId];
    }

    getConnectedLights(): Light[] {
        return Object.values(this.lights);
    }


    async getAllLightsFromBridge(): Promise<Light[]> {
        if (this.authenticated) {
            const lights = await this.api.lights.getAll();
            return lights.map(light => {
                return new Light(light.name, light.uniqueid, light.state, light.id, this.bridgeId, light.capabilities.control, light.getSupportedStates(), this)
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
    private async _createAuthenticatedApi(): Promise<void> {
        this.api = await hueApi.createLocal(this.ipAddress).connect(this.username);
        this.reachable = true;
        this.authenticated = true;
    }

    /**
     * Connects to the bridge and creates an API that has limited access to the bridge.
     * @remarks
     * Mainly used to create a user
     */
    private async _createUnAuthenticatedApi(): Promise<void> {
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
            let createdUser = await this.api.users.createUser(APP_NAME, DEVICE_NAME);
            this.update({"username": createdUser.username, "clientKey": createdUser.clientkey})

        } catch (err) {
            if (typeof (err.getHueErrorType) === "function" && err.getHueErrorType() === 101) {
                throw new CrownstoneHueError(406)
            } else {
                throw err;
            }
        }

    }

    /**
     * Retrieves all lights from the bridge and adds them to lights list.
     *
     */
    async populateLights(): Promise<void> {
        if (this.authenticated) {
            let lights = await this.api.lights.getAll();

            lights.forEach(light => {
                this.lights[light.uniqueId] = new Light(light.name, light.uniqueid, light.state, light.id, this.bridgeId, light.capabilities.control, light.getSupportedStates(), this)
            });
        } else {
            throw new CrownstoneHueError(405);
        }
    }

    // async createLightsFromConfig(): Promise<void> {
    //     let lightsInConfig = this.framework.getConfigSettings()
    //     lightsInConfig = lightsInConfig["Bridges"][this.bridgeId]["lights"];
    //     const lightIds: string[] = Object.keys(lightsInConfig);
    //
    //     for (const uniqueId of lightIds) {
    //         this.lights[uniqueId] = {};
    //         const light = lightsInConfig[uniqueId];
    //         const lightInfo = await this.api.lights.getLight(light.id);
    //         this.lights[uniqueId] = new Light(lightInfo.name, uniqueId, lightInfo.state, light.id, this.bridgeId, lightInfo.capabilities.control, lightInfo.getSupportedStates(), this);
    //     }
    // }

    /**
     * Rediscovers Bridge in case of failed connection
     *
     * @remarks
     * Retrieves bridges with _getBridgesFromDiscoveryUrl()
     * Compares found bridges with itself.
     * Success:
     * If bridge is found it updates bridge info and creates the API for it.
     * Fail:
     * If the bridge is not found in the network it throws Error
     *
     */
    private async _rediscoverMyself(): Promise<void> {
        let possibleBridges = await this._getBridgesFromDiscoveryUrl();
        if (possibleBridges.length === 0) {
            throw new CrownstoneHueError(404, "Bridge with id " + this.ipAddress + " not found.");
        } else {
            let result: DiscoverResult = {id: "", internalipaddress: ""};
            for (const item of possibleBridges) {
                if (this.bridgeId.toLowerCase() === item.id.toLowerCase()) {
                    result = item;
                    break;
                }
            }
            if (result.id === "") {
                throw new CrownstoneHueError(404, "Bridge with id " + this.ipAddress + " not found.")
            } else {
                this.ipAddress = result.internalipaddress;
                await this._createAuthenticatedApi()
                await persistence.updateBridgeIpAddress(this.bridgeId, this.ipAddress);
            }
        }
    }

    getLightById(uniqueId: string): Light {
        return this.lights[uniqueId];
    }

    /**
     * Retrieves online Hue bridges in the local network with Hue's discover url.
     *
     * @remarks
     * Use's Philips Hue's Discovery url {@link https://discovery.meethue.com/} to find Bridges that are online in the local network.
     *
     * @returns
     * An array of DiscoverResult either filled or empty.
     *
     */
    private async _getBridgesFromDiscoveryUrl(): Promise<DiscoverResult[]> {
        return await fetch(DISCOVERY_URL, {method: "Get"}).then(res => {
            return res.json()
        });
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
