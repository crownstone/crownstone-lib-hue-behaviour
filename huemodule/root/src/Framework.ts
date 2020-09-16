import {promises as fs} from 'fs';
import {Bridge} from "./Bridge";
import {Light} from "./Light";
import {v3} from "node-hue-api";
import {FrameworkError} from "./FrameworkError";

const discovery = v3.discovery

interface BridgeFormat {
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

/**
 * Framework object
 *
 * @remarks
 * init() should be called before using this object.
 *
 * @param configSettings - Contains the settings from config file
 * @param connectedBridges - List of connected bridges
 *
 */
export class Framework {
    configSettings: object = {};
    connectedBridges: Bridge[] = [];

    //TODO To be changed.
    APP_NAME: string = 'Hub';
    DEVICE_NAME: string = 'Hub1';

    constructor() {
    }

    /**
     * To be called for initialization of the Framework.
     *
     * @returns a List of Bridge objects configured from the config file.
     *
     */
    async init(): Promise<Bridge[]> {
        await this.loadConfigSettings();
        const result = this.getConfiguredBridges();

        return result;
    }

    async loadConfigSettings(): Promise<void> {
        await fs.readFile(CONF_NAME, 'utf8').then((data) => {
            this.configSettings = JSON.parse(data);
        }).catch(err => {
            if (err.code === "ENOENT") {
                this.configSettings = {CONF_BRIDGE_LOCATION: {}};
                this.updateConfigFile();
            }
            throw err;
        });

    };

    getConfigSettings(): object {
        return this.configSettings;
    }

    async addBridgeToConfig(bridge: BridgeFormat): Promise<void> {
        if (this.configSettings != undefined || this.configSettings != {}) {
            this.configSettings[CONF_BRIDGE_LOCATION][bridge.bridgeId] = {
                name: bridge.name,
                username: bridge.username,
                clientKey: bridge.clientKey,
                macAddress: bridge.macAddress,
                ipAddress: bridge.ipAddress,
                bridgeId: bridge.bridgeId,
                lights: {}
            }
            if (bridge.lights != undefined || bridge.lights != {}) {
                Object.values(bridge.lights).forEach((light) => {
                    this.addLightInfo(bridge.bridgeId, light)
                });
            }
            await this.updateConfigFile();
        } else {
            throw new FrameworkError(410);
        }
    }

    /**
     * Searches the local network for bridges.
     *
     * @returns List of discovered bridges.
     *
     *
     */
    async discoverBridges(): Promise<Bridge[]> {
        try{
            const discoveryResults = await discovery.nupnpSearch()
            if (discoveryResults.length === 0) {
                return discoveryResults;
            } else {
                let bridges: Bridge[] = [];
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
        } catch(err){
            if(err.message.includes("ETIMEDOUT")){
                return [];
            } else {
                throw err;
            }
        }
    }

    async removeBridge(bridgeId: string) {
        delete this.configSettings[CONF_BRIDGE_LOCATION][bridgeId];
        await this.updateConfigFile();
    }

    /**
     * Retrieves the bridges from the config file.
     *
     * @Returns array of Bridge
     */
    getConfiguredBridges(): Bridge[] {
        const bridges: string[] = Object.keys(this.configSettings[CONF_BRIDGE_LOCATION]);
        if (bridges === undefined || bridges === null || bridges.length === 0) {
            return [];
        } else if (bridges.length >= 0) {
            let confBridges = [];
            for (const bridgeId of bridges) {
                confBridges.push(this.createBridgeFromConfig(bridgeId));
            }
            return confBridges;
        } else {
            throw new FrameworkError(999,bridges);
        }
    }

    /**
     * Saves the given Bridge into the config file.
     * Including it's lights.
     *
     */
        async saveBridgeInformation(bridge: Bridge): Promise<void> {
        let config = bridge.getInfo();
        let bridgeId = config["bridgeId"];
        delete config["reachable"];
        delete config["bridgeId"];
        this.configSettings[CONF_BRIDGE_LOCATION][bridgeId] = config;
        if (bridge.lights != {}) {
            bridge.getConnectedLights().forEach(light => {
                this.addLightInfo(bridge.bridgeId, light)
            })
        }
        await this.updateConfigFile()

    }

    /**
     * Saves all lights from the connected bridges into the config file.
     *
     */
    async saveAllLightsFromConnectedBridges(): Promise<void> {
        this.connectedBridges.forEach(bridge => {
            bridge.getConnectedLights().forEach(light => {
                this.addLightInfo(bridge.bridgeId, light)
            })
        });
        await this.updateConfigFile();
    }

    /**
     * Adds the given Light to the configSettings variable
     * call this.updateConfigFile() to save into the config file.
     *
     * @param bridgeId - The id of the bridge the light is connected to.
     * @param light - Light object of the light to be saved
     */
    addLightInfo(bridgeId: string, light: Light): void {
        if (this.configSettings != undefined || this.configSettings != {}) {
            this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light["uniqueId"]] = {};
            this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light["uniqueId"]]["name"] = light["name"];
            this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]["lights"][light["uniqueId"]]["id"] = light["id"];
        } else {
            throw new FrameworkError(410)
        }
    }

    async removeLightFromConfig(bridge: Bridge, uniqueLightId) {
        delete this.configSettings[CONF_BRIDGE_LOCATION][bridge.bridgeId]["lights"][uniqueLightId];
        await this.updateConfigFile();
    }

    /**
     * Updates the configFile with the current configSettings variable.
     *
     */
    async updateConfigFile(): Promise<void> {
        await fs.writeFile(CONF_NAME, JSON.stringify(this.configSettings, null, 2));
    }

    getConnectedBridges(): Bridge[] {
        return this.connectedBridges;
    }

    createBridgeFromConfig(bridgeId: string): Bridge {
        const bridgeConfig = this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]
        if (bridgeConfig.name != "", bridgeConfig.macAddress != "", bridgeConfig.ipAddress != "") {
            if (bridgeConfig.username === undefined || bridgeConfig.username === null) {
                bridgeConfig.username = "";
            }
            if (bridgeConfig.clientKey === undefined || bridgeConfig.clientKey === null) {
                bridgeConfig.clientKey = "";
            }
            let bridge = new Bridge(bridgeConfig.name, bridgeConfig.username, bridgeConfig.clientKey, bridgeConfig.macAddress, bridgeConfig.ipAddress, bridgeId, this);
            this.connectedBridges.push(bridge);
            return bridge;
        }
    }

    async updateBridgeIpAddress(bridgeId, ipAddress): Promise<void> {
        if (this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]["ipAddress"] != undefined) {
            this.configSettings[CONF_BRIDGE_LOCATION][bridgeId]["ipAddress"] = ipAddress;
            await this.updateConfigFile()
        }
    }


}
