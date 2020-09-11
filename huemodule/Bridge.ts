import {Framework} from "./Framework";
import {Light} from "./Light"
import lightModel = require("./node_modules/node-hue-api/lib/model/Light");
import {v3} from "node-hue-api";

const discovery = v3.discovery;
const hueApi = v3.api;
const model = v3.model;
const fetch = require('node-fetch');


const DISCOVERY_URL = "https://discovery.meethue.com/";
//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_NOT_DISCOVERED = "BRIDGE_NOT_DISCOVERED";


type discoverResult = {
    id: string,
    internalipaddress: string
}


export class Bridge {
    lights: Light[] = new Array();
    api: any;
    name: string;
    username: string;
    clientKey: string;
    macAddress: string;
    ipAddress: string;
    bridgeId: string
    reachable: boolean = false;

    framework: Framework;

    constructor(name: string, username: string, clientKey: string, macAddress: string, ipAddress: string, bridgeId: string, framework: Framework) {
        this.name = name;
        this.username = username;
        this.ipAddress = ipAddress;
        this.clientKey = clientKey;
        this.macAddress = macAddress;
        this.bridgeId = bridgeId;


        this.framework = framework;
    }

    async init(): Promise<void> {
        if (this.username == "") {
            await this.link();
        } else {
            await this.connect();
            await this.createLightsFromConfig();
        }
    }

    async link(): Promise<void> {
        await this.createUser()
        await this.connect();
        const bridgeConfig = await this.api.configuration.getConfiguration();
        await this.update({
            "bridgeId": bridgeConfig.bridgeid,
            "name": bridgeConfig.name,
            "macAddress": bridgeConfig.mac,
            "reachable": true
        })

        //TODO Different solution?
        await this.framework.connectedBridges.push(this);
        await this.framework.saveBridgeInformation(this);
        await this.framework.updateConfigFile();
    }

    async connect(): Promise<void> {
        try {
            await this.createAuthenticatedApi()
        } catch (err) {
            if (err.code == "ENOTFOUND" || err.code == "ECONNREFUSED" || err.code == "ETIMEDOUT") {
                await this._rediscoverMyself()
            } else {
                throw err;
            }

        }
    }

    getConnectedLights(): Light[] {
        return this.lights;
    }

    async getAllLightsFromBridge() {
        return await this.api.lights.getAll();
    }

    async createAuthenticatedApi(): Promise<void> {
        this.api = await hueApi.createLocal(this.ipAddress).connect(this.username);
        this.reachable = true;
    }

    async createUnAuthenticatedApi(): Promise<void> {
        this.api = await hueApi.createLocal(this.ipAddress).connect();
        this.reachable = true;
    }

    //User should press link button before this is called.
    async createUser(): Promise<void> {
        await this.createUnAuthenticatedApi();
        let createdUser = await this.api.users.createUser(this.framework.APP_NAME, this.framework.DEVICE_NAME);
        this.update({"username": createdUser.username, "clientKey": createdUser.clientkey})

    }

    async populateLights(): Promise<void> {
        let lights = await this.api.lights.getAll();
        lights.forEach(light => {
            this.lights.push(new Light(light.name, light.uniqueid, light.state, light.id, this.bridgeId, light.capabilities.control, light.getSupportedStates(), this))
        });
    }

    async createLightsFromConfig(): Promise<void> {
        let lightsInConfig = this.framework.getConfigSettings()
        lightsInConfig = lightsInConfig["Bridges"][this.bridgeId]["lights"];
        const lightIds: string[] = Object.keys(lightsInConfig);

        for(const uniqueId of lightIds){
            const light = lightsInConfig[uniqueId];
            const lightInfo = await this.api.lights.getLight(light.id);
            this.lights.push(new Light(light.name, uniqueId, lightInfo.state, light.id, this.bridgeId, lightInfo.capabilities.control, lightInfo.getSupportedStates(), this))
        };
    }

    //Attempts to find- and connect to the bridge
    async _rediscoverMyself(): Promise<void> {
        let possibleBridges = await this._getBridgesFromDiscoveryUrl();
        if (possibleBridges.length === 0) {
            throw Error(BRIDGE_NOT_DISCOVERED);
        } else {
            let result = {id: "", internalipaddress: ""};
            for (const item of possibleBridges) {
                if (this.bridgeId.toLowerCase() === item.id.toLowerCase()) {
                    result = item;
                    break;
                }
            }
            if (typeof (result) === "object") {
                this.ipAddress = result.internalipaddress;
                await this.createAuthenticatedApi()
                await this.framework.updateBridgeIpAddress(this.bridgeId,this.ipAddress);
            }
            if (result.id === "") {
                throw Error(BRIDGE_NOT_DISCOVERED)
            }
        }
    }

    getLightById(uniqueId: string): Light {
        for (const light of this.lights) {
            if (light.uniqueId === uniqueId) {
                return light;
            }
        }
        return undefined;
    }

    async _getBridgesFromDiscoveryUrl(): Promise<discoverResult[]> {
        const result = await fetch(DISCOVERY_URL, {method: "Get"}).then(res => {
            return res.json()
        });
        return result;
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
