import {promises as fs} from 'fs';
import {Bridge} from "./Bridge";
import {Light} from "./Light";
import {v3} from "node-hue-api"; ;

const discovery = v3.discovery;

//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";
const CONFIG_UNDEFINED = "CONFIG_UNDEFINED";





type confBridge = {
    name: string;
    username: string;
    clientKey: string;
    macAddress: string;
    ipAddress: string;
    bridgeId: string;
    lights?: object;
}



//config locations/names
const CONF_NAME: string = "saveConfig.json";
const CONF_BRIDGE_LOCATION: string = "Bridges";

export class Framework {
    configSettings: object = {CONF_BRIDGE_LOCATION: {}};
    connectedBridges: Bridge[] = new Array();

     APP_NAME: string = 'Hub';
     DEVICE_NAME: string = 'Hub1';

    constructor() {
    }

    async init(): Promise<Bridge[]> {
        await this.loadConfigSettings();
        const result = this.getConfiguredBridges();
        let bridges = new Array();
        for (const bridgeId of result) {
            bridges.push(this.createBridgeFromConfig(bridgeId));
        }
        return bridges;
    }

    async loadConfigSettings(): Promise<void> {
        await fs.readFile(CONF_NAME, 'utf8').then((data) => {
            this.configSettings = JSON.parse(data);
        }).catch(err => {
            if (err.code === "ENOENT") {
                this.updateConfigFile();
            }
            throw err;
        });

    };

    getConfigSettings(): object{
        return this.configSettings;
    }

    async addBridgeToConfig(bridge:confBridge){
        this.configSettings[CONF_BRIDGE_LOCATION][bridge.bridgeId] = {
            name: bridge.name,
            username: bridge.username,
            clientKey: bridge.clientKey,
            macAddress: bridge.macAddress,
            ipAddress: bridge.ipAddress,
            bridgeId: bridge.bridgeId,
            lights: {}
        }
        if (bridge.lights != undefined || bridge.lights != {} ){
            Object.values(bridge.lights).forEach((light) => { this.saveLightInfo(bridge.bridgeId,light)});
        }
        await this.updateConfigFile();

    }
    async discoverBridges(): Promise<Bridge[]> {
        const discoveryResults = await discovery.nupnpSearch()
        if (discoveryResults.length === 0) {
            return discoveryResults;
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

    async removeBridge(bridgeId:string){
        delete this.configSettings[CONF_BRIDGE_LOCATION][bridgeId];
        await this.updateConfigFile();
    }

    getConfiguredBridges(): string[] {
        const bridges: string[] = Object.keys(this.configSettings[CONF_BRIDGE_LOCATION]);
        if (bridges === undefined || bridges === null || bridges.length === 0) {
            return new Array();
        } else {
            return bridges;
        }
    }

    async saveBridgeInformation(bridge: Bridge): Promise<void> {
        let config = bridge.getInfo();
        let bridgeId = config["bridgeId"];
        delete config["reachable"];
        delete config["bridgeId"];
        this.configSettings[CONF_BRIDGE_LOCATION][bridgeId] = config;
        await this.updateConfigFile()

    }

    async saveAllLightsFromConnectedBridges(): Promise<void> {
        this.connectedBridges.forEach(bridge => {
            bridge.getConnectedLights().forEach(async light => {
                await this.saveLightInfo(bridge.bridgeId,light)
            })
        });
        await this.updateConfigFile();``
    }

    //TODO
    saveLightInfo(bridgeId: string, light: Light): void {
        if(this.configSettings != undefined || this.configSettings != {}){
        this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light["uniqueId"]] = {};
        this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light["uniqueId"]]["name"] = light["name"];
        this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light["uniqueId"]]["id"] = light["id"];
        } else {
            throw Error(CONFIG_UNDEFINED)
        }
    }

    async removeLightFromConfig(bridge:Bridge,uniqueLightId){
        bridge.removeLight(uniqueLightId);
        delete this.configSettings[CONF_BRIDGE_LOCATION][bridge.bridgeId]["lights"][uniqueLightId];
        await this.updateConfigFile();
    }

    //Call this to save configuration to the config file.
    async updateConfigFile(): Promise<void> {
        await fs.writeFile(CONF_NAME, JSON.stringify(this.configSettings,null, 2));
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

    async updateBridgeIpAddress(bridgeId,ipAddress): Promise<void>{
        this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]["ipAddress"] = ipAddress;
        await this.updateConfigFile()
    }


}
