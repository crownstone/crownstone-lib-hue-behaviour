import {promises as fs} from 'fs';
import {Bridge} from "./Bridge";
import {Light} from "./Light";
import {v3} from "node-hue-api"; ;

const discovery = v3.discovery;
const hueApi = v3.api;
const model = v3.model;


//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";


//TODO


//config locations/names
const CONF_NAME: string = "saveConfig.json";
const CONF_BRIDGE_LOCATION: string = "bridges";
const CONF_LIGHT_LOCATION: string = "lights";


export class Framework {
    configSettings: object = {"bridges": "", "lights": ""};
    connectedBridges: Bridge[] = new Array();

    APP_NAME: string = 'Hub';
    DEVICE_NAME: string = 'Hub1';

    constructor() {
    }

    async init(): Promise<Bridge[]> {
        await this.getConfigSettings();
        const result = this.getConfiguredBridges();
        let bridges = new Array();
        for (const bridgeId of result) {
            bridges.push(this.createBridgeFromConfig(bridgeId));
        }
        return bridges;
    }

    async getConfigSettings(): Promise<void> {
        await fs.readFile(CONF_NAME, 'utf8').then((data) => {
            this.configSettings = JSON.parse(data);
        }).catch(err => {
            if (err.code === "ENOENT") {
                this.updateConfigFile();
            }
            throw err;
        });

    };


    // Returns either a list of bridges
    async discoverBridges(): Promise<Bridge[]> {
        const discoveryResults = await discovery.nupnpSearch()
        if (discoveryResults.length === 0) {
            throw Error(NO_BRIDGES_DISCOVERED);
        } else {
            let bridges: Bridge[] = new Array();
            discoveryResults.forEach(item => {
                bridges.push(new Bridge(
                    item.name,
                    "",
                    "",
                    "",
                    item.ipaddress,
                    "",
                    this
                ))
            })
            return bridges;
        }
    }


    //Returns a string[] of bridges
    getConfiguredBridges(): string[] {
        const bridges: string[] = Object.keys(this.configSettings["bridges"]);
        if (bridges === undefined || bridges === null || bridges.length === 0) {
            throw Error(NO_BRIDGES_IN_CONFIG);
        } else {
            return bridges;
        }
    }

    //Temp???
    async saveBridgeInformation(bridge: Bridge): Promise<void> {
        let config = bridge.getInfo();
        let bridgeId = config["bridgeId"];
        delete config["reachable"];
        delete config["bridgeId"];
        this.configSettings[CONF_BRIDGE_LOCATION][bridgeId] = config;
        await this.updateConfigFile();
    }

    async saveAllLightsFromConnectedBridges(): Promise<void> {
        this.connectedBridges.forEach(bridge => {
            bridge.getConnectedLights().forEach(async light => {
                await this.saveLightInfo(light.getInfo())
            })
        });
    }

    async saveLightInfo(light: object): Promise<void> {
        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]] = {};
        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]]["name"] = light["name"];
        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]]["id"] = light["id"];
        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]]["bridgeId"] = light["bridgeId"];
        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]]["state"] = light["state"];
        await this.updateConfigFile();
    }

    //Call this to save configuration to the config file.
    async updateConfigFile(): Promise<void> {
        return await fs.writeFile(CONF_NAME, JSON.stringify(this.configSettings));
    }

    getConnectedBridges(): Bridge[] {
        return this.connectedBridges;
    }

    createBridgeFromConfig(bridgeId: string): Bridge {
        const bridgeConfig = this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]
        let bridge = new Bridge(bridgeConfig.name, bridgeConfig.username, bridgeConfig.clientKey, bridgeConfig.macAddress, bridgeConfig.ipAddress, bridgeId, this);
        this.connectedBridges.push(bridge);
        return bridge;
    }

}
