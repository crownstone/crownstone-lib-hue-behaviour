import {Framework} from "./index";
import {Light} from "./Light"
import lightModel = require("./node_modules/node-hue-api/lib/model/Light");
import {v3} from "node-hue-api";
const discovery = v3.discovery;
const hueApi = v3.api;
const model = v3.model;

const DISCOVERY_URL = "https://discovery.meethue.com/";
//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";



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

    async init() {
        if (this.username == "") {
            await this.link();
        } else {
            await this.connect();
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
    }

    async connect(): Promise<void> {
        try {
            await this.createAuthenticatedApi()
        } catch (err) {
            if (err == "ENOTFOUND" || err == "ETIMEDOUT") {
                await this._rediscoverMyself()
                throw err;
            }
        }
    }


    getConnectedLights(): Light[] {
        return this.lights;
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
        let lights = await this._getAllLightsOnBridge()
        lights.forEach(light => {
            this.lights.push(new Light(light.name, light.uniqueid, light.state, light.id, this.api.lights))
        });
    }

    //Attempts to find- and connect to the bridge
    async _rediscoverMyself(): Promise<void> {
        let possibleBridges = await this._getBridgesFromDiscoveryUrl();
        if (possibleBridges.length === 0) {
            throw Error(NO_BRIDGES_DISCOVERED);
        } else {
            let result = {id: "", internalipaddress: ""};
            for (const item of possibleBridges.value) {
                if (this.bridgeId.toLowerCase() === item.id.toLowerCase()) {
                    result = item;
                    break;
                }
            }
            if (typeof (result) === "object") {
                const oldIpAddress = this.ipAddress;
                this.ipAddress = result.internalipaddress;
                await this.createAuthenticatedApi()
                await this.framework.saveBridgeInformation(this, oldIpAddress);
            }
        }
    }

    async _getBridgesFromDiscoveryUrl() {
        return await fetch(DISCOVERY_URL, {method: "Get"})
            .then(async res => {
                return await res.json()
            });
    }

    /// TODO
    update(newValues: object) {
        Object.keys(newValues).forEach(key => {
            if (typeof (this[key]) !== undefined) {
                this[key] = newValues[key];
            }
        });
    }

    async _getAllLightsOnBridge(): Promise<lightModel[]> {
        return await this.api.lights.getAll();
    }

    async setLightState(id: string, state: object) {
        return await this.api.lights.setLightState(id, state);
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
